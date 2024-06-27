import { Injectable } from '@nestjs/common';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { CurrentUserInterface } from 'src/shared/generics';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { ASSET_STATE, ASSIGNMENT_STATE } from 'src/shared/enums';
import {
  MyBadRequestException,
  MyEntityNotFoundException,
} from 'src/shared/exceptions';
import { FindAssignmentsInput } from './dto/find-assignment.input';
import { Prisma } from '@prisma/client';
import { ENTITY_NAME } from 'src/shared/constants';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createAssignmentInput: CreateAssignmentInput,
    userReq: CurrentUserInterface,
  ) {
    try {
      // if asset is already assigned for any user
      const isAssetIsAssigned = await this.prismaService.asset.findFirst({
        where: {
          id: createAssignmentInput.assetId,
          state: ASSET_STATE.ASSIGNED,
        },
      });

      if (createAssignmentInput.assetId && isAssetIsAssigned) {
        throw new MyBadRequestException(
          'Asset is already assigned for another user',
        );
      }

      // if user is already assigned
      const isUserAlreadyAssigned = await this.prismaService.user.findFirst({
        where: {
          id: createAssignmentInput.assignedToId,
          isAssigned: true,
        },
      });

      if (createAssignmentInput.assignedToId && isUserAlreadyAssigned) {
        throw new MyBadRequestException('User is already assigned');
      }

      if (isNaN(Date.parse(createAssignmentInput.assignedDate))) {
        throw new MyBadRequestException('assigned date is invalid');
      }

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
    const {
      limit = 20,
      page = 1,
      query,
      sort,
      sortOrder,
      state,
      assignedDate,
    } = input;

    const where: Prisma.AssignmentWhereInput = {};

    if (state) {
      where.state = state;
    }

    if (query) {
      where.OR = [
        { assetName: { contains: query, mode: 'insensitive' } },
        { assetCode: { contains: query, mode: 'insensitive' } },
        { assignedToUsername: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (assignedDate) {
      if (isNaN(Date.parse(assignedDate))) {
        throw new MyBadRequestException('assigned date is invalid');
      } else {
        where.assignedDate = new Date(assignedDate).toISOString();
      }
    }

    if (reqUser) {
      where.location = reqUser.location; // Map to Prisma enum
    }

    const orderBy = { [sort]: sortOrder };

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

  async findOne(id: number) {
    const result = await this.prismaService.assignment.findFirst({
      where: { id: id },
    });

    if (!result) {
      throw new MyEntityNotFoundException(ENTITY_NAME.ASSIGNMENT);
    }

    return result;
  }
}
