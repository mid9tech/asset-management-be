import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from '../../services/prisma/prisma.service';
import { LOCATION, USER_STATUS } from '../../shared/enums';

import { HashPW } from 'src/shared/helpers';
import { MyBadRequestException, MyEntityNotFoundException } from '../../shared/exceptions';
import { FindUsersInput } from './dto/find-users.input';
import { Prisma, User } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ENTITY_NAME } from 'src/shared/constants';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserInput: CreateUserInput) {
    try {
      const { dateOfBirth, joinedDate } = createUserInput;

      if (isNaN(Date.parse(dateOfBirth))) {
        throw new MyBadRequestException('DOB is invalid');
      }

      if (isNaN(Date.parse(joinedDate))) {
        throw new MyBadRequestException('JoinedDate is invalid');
      }

      await this.prismaService.user.create({
        data: {
          ...createUserInput,
          state: USER_STATUS.ACTIVE,
          location: LOCATION.HCM,
          dateOfBirth: new Date(dateOfBirth).toISOString(),
          joinedDate: new Date(joinedDate).toISOString(),
        },
      });
    } catch (error) {}
  }

 async findAll(input: FindUsersInput, user: User) {
    const { page, limit, query, type } = input;

    const where: Prisma.UserWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { staffCode: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (user) {
      where.location = user.location;
      where.id = {
        not: user.id, 
      };
    }

    const sort = input.sort || 'firstName';
    const sortOrder = input.sortOrder || 'asc';
    const orderBy = { [sort]: sortOrder };

    try {
      const users = await this.prismaService.user.findMany({
        where,
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit || undefined,
        orderBy,
      });

      return users;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });
    if(!user) {
      throw new MyEntityNotFoundException(ENTITY_NAME.USER)
    }
    return user;
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user: ${updateUserInput}`;
  }

  updateRefreshToken(id: number, refreshToken: string) {
    return this.prismaService.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async checkRefreshToken(id: number, refreshToken: string) {
    const data = await this.prismaService.user.findFirst({
      where: { id, refreshToken },
    });

    return data ? true : false;
  }

  async findOneById(id: number) {
    return await this.prismaService.user.findFirst({ where: { id } });
  }

  async findOneByUsername(username: string) {
    return await this.prismaService.user.findFirst({ where: { username } });
  }

  async updatePassword(id: number, password: string) {
    const { salt } = await this.getSalt(id);
    const newPassword = await HashPW(password, salt);
    return this.prismaService.user.update({
      where: { id },
      data: { password: newPassword },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getSalt(id: number) {
    return this.prismaService.user.findFirst({
      where: { id },
      select: { salt: true },
    });
  }

  async updateState(id: number, state: boolean) {
    return this.prismaService.user.update({
      where: { id },
      data: { state },
    });
  }
}
