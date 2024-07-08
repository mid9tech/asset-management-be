import { Injectable } from '@nestjs/common';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { CurrentUserInterface } from 'src/shared/generics';
import { PrismaService } from 'src/services/prisma/prisma.service';
import {
  ASSET_STATE,
  ASSIGNMENT_STATE,
  LOCATION,
  REQUEST_RETURN_STATE,
} from 'src/shared/enums';
import {
  MyBadRequestException,
  MyEntityNotFoundException,
  MyForbiddenException,
} from 'src/shared/exceptions';
import { FindAssignmentsInput } from './dto/find-assignment.input';
import { Prisma } from '@prisma/client';
import { ENTITY_NAME } from 'src/shared/constants';
import {
  UpdateAssignmentInput,
  UpdateStatusAssignmentInput,
} from './dto/update-assignment.input';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async returnQueryCondition(
    input: FindAssignmentsInput,
  ): Promise<Prisma.AssignmentWhereInput> {
    const { query, state, assignedDate } = input;

    const where: Prisma.AssignmentWhereInput = {};

    where.state = { in: state };
    where.state = { in: state };

    if (query) {
      const trimmedQuery = query.trim();
      const words = trimmedQuery.split(' ').filter((word) => word.length > 0);

      where.OR = [
        { assetName: { contains: query, mode: 'insensitive' } },
        { assetCode: { contains: query, mode: 'insensitive' } },
        { assignedToUsername: { contains: query, mode: 'insensitive' } },
      ];

      if (words.length > 1) {
        where.OR.push({
          AND: words.map((word) => ({
            OR: [{ assetName: { contains: word, mode: 'insensitive' } }],
          })),
        });
      }
    }

    if (assignedDate) {
      if (isNaN(Date.parse(assignedDate))) {
        throw new MyBadRequestException('assigned date is invalid');
      } else {
        where.assignedDate = new Date(assignedDate).toISOString();
      }
    }

    return where;
  }

  async create(
    createAssignmentInput: CreateAssignmentInput,
    userReq: CurrentUserInterface,
  ) {
    try {
      // if asset is already assigned for any user
      const checkAsset = await this.prismaService.asset.findFirst({
        where: {
          id: createAssignmentInput.assetId,
        },
      });

      if (!checkAsset) {
        throw new MyBadRequestException('invalid asset');
      }

      if (
        checkAsset.state !== ASSET_STATE.AVAILABLE ||
        checkAsset.isReadyAssigned === false
      ) {
        throw new MyBadRequestException('Asset is not ready to be assigned');
      }

      // if asset is from different location
      if (checkAsset.location !== userReq.location) {
        throw new MyForbiddenException(
          'You are not allowed to assign asset from different location',
        );
      }

      // if user is already assigned
      const checkUser = await this.prismaService.user.findFirst({
        where: {
          id: createAssignmentInput.assignedToId,
          isDisabled: false,
        },
      });

      if (!checkUser) {
        throw new MyBadRequestException('invalid user');
      }

      // if assignee from different location
      if (checkUser.location !== userReq.location) {
        throw new MyForbiddenException(
          'You are not allowed to assign user from different location',
        );
      }

      if (isNaN(Date.parse(createAssignmentInput.assignedDate))) {
        throw new MyBadRequestException('assigned date is invalid');
      }

      await this.prismaService.asset.update({
        where: { id: createAssignmentInput.assetId },
        data: {
          isAllowRemoved: false,
          isReadyAssigned: false,
        },
      });

      const result = await this.prismaService.assignment.create({
        data: {
          ...createAssignmentInput,
          assignedById: userReq.id,
          location: userReq.location,
          state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
          assignedByUsername: userReq.username,
          assignedDate: new Date(
            createAssignmentInput.assignedDate,
          ).toISOString(),
        },
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll(input: FindAssignmentsInput, reqUser: CurrentUserInterface) {
    const { limit = 20, page = 1, sort, sortOrder } = input;

    const where = await this.returnQueryCondition(input);

    if (reqUser) {
      where.location = reqUser.location; // Map to Prisma enum
    }
    where.isRemoved = false;
    where.assignedToId = { not: reqUser.id };
    const orderBy = { [sort]: sortOrder };

    const total = await this.prismaService.assignment.count({ where });
    const assignments = await this.prismaService.assignment.findMany({
      where: where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      page: page,
      limit: limit,
      total: total,
      totalPages: totalPages,
      assignments: assignments ? assignments : [],
    };
  }

  async findOne(id: number, location?: LOCATION) {
    const result = await this.prismaService.assignment.findFirst({
      where: { id: id, location: location },
    });

    if (!result) {
      throw new MyEntityNotFoundException(ENTITY_NAME.ASSIGNMENT);
    }

    return result;
  }

  async removeAssignment(assignmentId: number, userReq: CurrentUserInterface) {
    const assignment = await this.prismaService.assignment.findFirst({
      where: { id: assignmentId, location: userReq.location },
    });

    if (!assignment) {
      throw new MyEntityNotFoundException(ENTITY_NAME.ASSIGNMENT);
    }

    if (assignment.state === ASSIGNMENT_STATE.ACCEPTED) {
      throw new MyBadRequestException(
        'Cannot remove assignment not in WAITING_FOR_ACCEPTANCE, DECLINED state',
      );
    }

    const result = await this.prismaService.$transaction(async () => {
      await this.prismaService.assignment.update({
        where: { id: assignmentId },
        data: {
          isRemoved: true,
        },
      });

      const countExistNotAllowRemove =
        await this.prismaService.assignment.count({
          where: {
            assetId: assignment.assetId,
            OR: [
              { state: ASSIGNMENT_STATE.ACCEPTED },
              {
                state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
                isRemoved: false,
              },
              { state: ASSIGNMENT_STATE.DECLINED, isRemoved: false },
            ],
          },
        });

      if (countExistNotAllowRemove === 0) {
        await this.prismaService.asset.update({
          where: { id: assignment.assetId },
          data: {
            isAllowRemoved: true,
          },
        });
      }

      await this.prismaService.asset.update({
        where: { id: assignment.assetId },
        data: {
          isReadyAssigned: true,
        },
      });

      return true;
    });

    return result;
  }

  async update(
    id: number,
    updateAssignmentInput: UpdateAssignmentInput,
    userReq: CurrentUserInterface,
  ) {
    const assignment = await this.prismaService.assignment.findFirst({
      where: { id: id, location: userReq.location },
    });

    if (!assignment) {
      throw new MyEntityNotFoundException(ENTITY_NAME.ASSIGNMENT);
    }

    // Check assignment state
    if (assignment.state !== ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE) {
      throw new MyBadRequestException(
        'Cannot update assignment not in WAITING_FOR_ACCEPTANCE state',
      );
    }

    // Validate asset updates
    if (updateAssignmentInput.assetId) {
      const checkAsset = await this.prismaService.asset.findFirst({
        where: {
          id: updateAssignmentInput.assetId,
        },
      });

      if (!checkAsset) {
        throw new MyEntityNotFoundException(ENTITY_NAME.ASSET);
      }

      if (
        checkAsset.state !== ASSET_STATE.AVAILABLE ||
        checkAsset.isReadyAssigned === false
      ) {
        throw new MyBadRequestException('Asset is not ready to be assigned');
      }

      if (checkAsset.location !== userReq.location) {
        throw new MyForbiddenException(
          'You are not allowed to assign asset from different location',
        );
      }
    }

    // Validate user updates
    if (updateAssignmentInput.assignedToId) {
      const checkUser = await this.prismaService.user.findFirst({
        where: {
          id: updateAssignmentInput.assignedToId,
          isDisabled: false,
        },
      });

      if (!checkUser) {
        throw new MyEntityNotFoundException(ENTITY_NAME.USER);
      }

      if (checkUser.location !== userReq.location) {
        throw new MyForbiddenException(
          'You are not allowed to assign user from different location',
        );
      }
    }

    // Validate assignedDate
    if (isNaN(Date.parse(updateAssignmentInput.assignedDate))) {
      throw new MyBadRequestException('assigned date is invalid');
    }

    // Start transaction
    const result = await this.prismaService.$transaction(async (prisma) => {
      // Update assignment
      const updatedAssignment = await prisma.assignment.update({
        where: { id },
        data: {
          ...updateAssignmentInput,
          assignedDate: new Date(
            updateAssignmentInput.assignedDate,
          ).toISOString(),
        },
      });

      // Update asset states
      // current asset assigned is not ready assigned
      if (updateAssignmentInput.assetId) {
        await prisma.asset.update({
          where: {
            id: updateAssignmentInput.assetId,
          },
          data: {
            isAllowRemoved: false,
            isReadyAssigned: false,
          },
        });

        // past asset assigned is ready assigned
        await prisma.asset.update({
          where: {
            id: assignment.assetId,
          },
          data: {
            isReadyAssigned: true,
          },
        });
      }

      return updatedAssignment;
    });

    // End transaction

    return result;
  }

  async getListOwnAssignment(
    input: FindAssignmentsInput,
    reqUser: CurrentUserInterface,
  ) {
    const { limit = 20, page = 1, sort, sortOrder } = input;

    const where = await this.returnQueryCondition(input);

    if (reqUser) {
      where.location = reqUser.location; // Map to Prisma enum
      where.assignedToId = reqUser.id;
    }

    const orderBy = { [sort]: sortOrder };

    where.isRemoved = false;
    where.state = { not: ASSIGNMENT_STATE.DECLINED };
    where.assignedDate = { lte: new Date().toISOString() };
    where.assignedDate = { lte: new Date().toISOString() };
    const total = await this.prismaService.assignment.count({ where });
    const assignments = await this.prismaService.assignment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      page: page,
      limit: limit,
      total: total,
      totalPages: totalPages,
      assignments: assignments ? assignments : [],
    };
  }

  async updateStatusAssignment(
    updateStatusAssignmentInput: UpdateStatusAssignmentInput,
    userReq: CurrentUserInterface,
  ) {
    const assignment = await this.prismaService.assignment.findFirst({
      where: { id: updateStatusAssignmentInput.id, location: userReq.location },
    });

    if (!assignment) {
      throw new MyEntityNotFoundException(ENTITY_NAME.ASSIGNMENT);
    }

    if (assignment.state !== ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE) {
      throw new MyBadRequestException(
        'Assignment state is not waiting for acceptance',
      );
    }

    // Start transaction for atomicity
    const result = await this.prismaService.$transaction(async (prisma) => {
      // Update assignment state
      await prisma.assignment.update({
        where: { id: updateStatusAssignmentInput.id },
        data: {
          state: updateStatusAssignmentInput.state,
        },
      });

      // Update user's isAssigned status based on assignment state
      if (updateStatusAssignmentInput.state === ASSIGNMENT_STATE.ACCEPTED) {
        await prisma.user.update({
          where: { id: assignment.assignedToId },
          data: {
            isAssigned: true,
          },
        });

        await prisma.asset.update({
          where: { id: assignment.assetId },
          data: {
            state: ASSET_STATE.ASSIGNED,
          },
        });
      } else {
        await prisma.asset.update({
          where: { id: assignment.assetId },
          data: {
            isReadyAssigned: true,
          },
        });
      }

      return true;
    });

    // End transaction

    return result; // Return true on successful update
  }

  async isWaitingReturning(id: number, location: LOCATION) {
    const check = await this.prismaService.requestReturn.findFirst({
      where: {
        assignmentId: id,
        isRemoved: false,
        state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
        assignment: { location: location },
      },
    });

    return check ? true : false;
  }
}
