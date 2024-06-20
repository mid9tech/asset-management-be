import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from '../../services/prisma/prisma.service';
import { LOCATION, USER_STATUS } from '../../shared/enums';

import { HashPW } from 'src/shared/helpers';
import { MyBadRequestException, MyEntityNotFoundException } from '../../shared/exceptions';
import { FindUsersInput } from './dto/find-users.input';
import { Prisma, User } from '@prisma/client';
import { ENTITY_NAME } from '../../shared/constants';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  calculateAge(dob: Date, compareDate: Date): number {
    const diff = compareDate.getTime() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  async create(createUserInput: CreateUserInput) {
    try {
      const { dateOfBirth, joinedDate, lastName, firstName } = createUserInput;

      if (lastName === '' || firstName === '') {
        throw new MyBadRequestException('Name is invalid');
      }

      if (isNaN(Date.parse(dateOfBirth))) {
        throw new MyBadRequestException('DOB is invalid');
      }

      if (isNaN(Date.parse(joinedDate))) {
        throw new MyBadRequestException('JoinedDate is invalid');
      }

      // Validate age at joinedDate
      const dob = new Date(dateOfBirth);
      const joinDate = new Date(joinedDate);
      const currentDate = new Date();

      const ageAtJoinDate = this.calculateAge(dob, joinDate);
      const ageAtCurrentDate = this.calculateAge(dob, currentDate);

      if (ageAtJoinDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 at the join date. Please select a different join date.',
        );
      }

      if (ageAtCurrentDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 currently. Please select a different date of birth.',
        );
      }

      const result = await this.prismaService.user.create({
        data: {
          ...createUserInput,
          state: USER_STATUS.ACTIVE,
          location: LOCATION.HCM,
          dateOfBirth: dob.toISOString(),
          joinedDate: joinDate.toISOString(),
        },
      });

      return result;
    } catch (error) {
      throw error;
    }
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

  async update(id: number, updateUserInput: UpdateUserInput) {
    try {
      const { dateOfBirth, joinedDate } = updateUserInput;

      if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
        throw new MyBadRequestException('DOB is invalid');
      }

      if (joinedDate && isNaN(Date.parse(joinedDate))) {
        throw new MyBadRequestException('JoinedDate is invalid');
      }

      // Validate age at joinedDate
      const dob = new Date(dateOfBirth);
      const joinDate = new Date(joinedDate);
      const currentDate = new Date();

      const ageAtJoinDate = this.calculateAge(dob, joinDate);
      const ageAtCurrentDate = this.calculateAge(dob, currentDate);

      if (ageAtJoinDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 at the join date. Please select a different join date.',
        );
      }

      if (ageAtCurrentDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 currently. Please select a different date of birth.',
        );
      }

      const result = await this.prismaService.user.update({
        where: { id },
        data: {
          ...updateUserInput,
          dateOfBirth: dateOfBirth
            ? new Date(dateOfBirth).toISOString()
            : undefined,
          joinedDate: joinedDate
            ? new Date(joinedDate).toISOString()
            : undefined,
        },
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async disableUser(id: number) {
    try {
      const result = await this.prismaService.user.update({
        where: { id },
        data: {
          state: USER_STATUS.INACTIVE,
        },
      });

      return result ? true : false;
    } catch (error) {
      throw error;
    }
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
