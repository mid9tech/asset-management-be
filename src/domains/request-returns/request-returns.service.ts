import { Injectable } from '@nestjs/common';
import { CreateRequestReturnInput } from './dto/create-request-return.input';

import { PrismaService } from 'src/services/prisma/prisma.service';
import { FindRequestReturnsInput } from './dto/find-request-returns.input';
import {
  ASSET_STATE,
  LOCATION,
  Prisma,
  REQUEST_RETURN_STATE,
} from '@prisma/client';
import { FindRequestReturnsOutput } from './dto/find-request-returns.output';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class RequestReturnsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findRequestReturns(
    request: FindRequestReturnsInput,
    location: LOCATION,
  ) {
    const {
      page = 1,
      limit = 20,
      query = '',
      sortField = 'id',
      sortOrder = 'asc',
      stateFilter,
      returnedDateFilter,
    } = request;
    const where: Prisma.RequestReturnWhereInput = {};

    if (query) {
      where.OR = [
        { asset: { assetName: { contains: query } } },
        { asset: { assetCode: { contains: query } } },
        { requestedBy: { username: { contains: query } } },
      ];
    }

    if (stateFilter) {
      where.state = { in: stateFilter };
    }

    if (returnedDateFilter) {
      where.returnedDate = returnedDateFilter;
    }

    where.assignment.location = location;

    where.isRemoved = false;
    try {
      const total = await this.prismaService.requestReturn.count({ where });

      const orderBy = {};

      switch (sortField) {
        case 'assetCode':
          orderBy['asset.assetCode'] = sortOrder;
          break;
        case 'assetName':
          orderBy['asset.assetName'] = sortOrder;
          break;
        case 'requestedBy':
          orderBy['requestedBy.username'] = sortOrder;
          break;
        case 'acceptedBy':
          orderBy['acceptedBy.username'] = sortOrder;
          break;
        default:
          orderBy[sortField] = sortOrder;
      }

      const requestReturns = await this.prismaService.requestReturn.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      });

      const totalPages = Math.ceil(total / limit);

      const result = new FindRequestReturnsOutput();
      result.requestReturns = requestReturns.map((item) => ({
        ...item,
        assignedDate: item.assignedDate.toISOString(),
        returnedDate: item.returnedDate.toISOString(),
      }));
      result.page = page;
      result.limit = limit;
      result.total = total;
      result.totalPages = totalPages;
      return result;
    } catch (error) {
      throw new MyBadRequestException('Error finding request returns');
    }
  }

  async findOne(id: number, location: LOCATION) {
    const requestReturn = await this.prismaService.requestReturn.findUnique({
      where: { id, assignment: { location: location } },
    });

    if (!requestReturn) {
      throw new MyBadRequestException('Request return not found');
    }

    return requestReturn;
  }

  async createRequestReturn(
    createRequestReturnInput: CreateRequestReturnInput,
    location: string,
  ) {
    const { assetId, assignmentId, requestedById, assignedDate } =
      createRequestReturnInput;

    const assignment = await this.prismaService.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new MyBadRequestException('Assignment not found');
    }
    if (assignment.location !== LOCATION[location]) {
      throw new MyBadRequestException('Assignment not in this location');
    }
    if (assignment.state !== 'ACCEPTED') {
      throw new MyBadRequestException('Assignment not accepted');
    }
    if (assetId !== assignment.assetId) {
      throw new MyBadRequestException('Asset id not match');
    }

    if (assignedDate !== assignment.assignedDate.toISOString()) {
      throw new MyBadRequestException('Assigned date not match');
    }

    const requestReturn = await this.prismaService.requestReturn.create({
      data: {
        assetId,
        assignmentId,
        requestedById,
        assignedDate,
        state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
      },
    });

    return requestReturn;
  }

  async deleteRequestReturn(id: number, location: LOCATION) {
    const requestReturn = await this.prismaService.requestReturn.findUnique({
      where: { id, assignment: { location: location } },
    });
    if (!requestReturn) {
      throw new MyBadRequestException('Request return not found');
    }
    if (requestReturn.state !== REQUEST_RETURN_STATE.WAITING_FOR_RETURNING) {
      throw new MyBadRequestException('Request return not in waiting state');
    }
    if (requestReturn.isRemoved) {
      throw new MyBadRequestException('Request return already removed');
    }
    const result = await this.prismaService.requestReturn.update({
      where: { id },
      data: { isRemoved: true },
    });
    return result;
  }

  async completeRequestReturn(
    id: number,
    location: LOCATION,
    acceptedById: number,
  ) {
    const requestReturn = await this.prismaService.requestReturn.findUnique({
      where: { id, assignment: { location: location } },
    });
    if (!requestReturn) {
      throw new MyBadRequestException('Request return not found');
    }
    if (requestReturn.state !== REQUEST_RETURN_STATE.WAITING_FOR_RETURNING) {
      throw new MyBadRequestException('Request return not in waiting state');
    }
    if (requestReturn.isRemoved) {
      throw new MyBadRequestException('Request return already removed');
    }
    const result = await this.prismaService.requestReturn.update({
      where: { id },
      data: {
        state: REQUEST_RETURN_STATE.COMPLETED,
        returnedDate: new Date(),
        acceptedById: acceptedById,
      },
    });
    await this.prismaService.asset.update({
      where: { id: requestReturn.assetId },
      data: { state: ASSET_STATE.AVAILABLE },
    });
    return result;
  }
}
