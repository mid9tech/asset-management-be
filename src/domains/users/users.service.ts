import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { $Enums } from '@prisma/client';
import {
  LOCATION,
  USER_FIRST_LOGIN,
  USER_STATUS,
  USER_TYPE,
} from 'src/shared/enums';

import { HashPW } from 'src/shared/helpers';
import {
  MyBadRequestException,
  MyEntityNotFoundException,
  MyForbiddenException,
} from 'src/shared/exceptions';
import { FindUsersInput } from './dto/find-users.input';
import { Prisma } from '@prisma/client';
import { ENTITY_NAME } from 'src/shared/constants';
import { CurrentUserInterface } from 'src/shared/generics';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  calculateAge(dob: Date, compareDate: Date): number {
    const diff = compareDate.getTime() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  async create(createUserInput: CreateUserInput, location: LOCATION) {
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

      if (ageAtCurrentDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 currently. Please select a different date of birth.',
        );
      }

      if (ageAtJoinDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 at the join date. Please select a different join date.',
        );
      }

      let pickLocation;

      if (createUserInput.type === USER_TYPE.ADMIN) {
        pickLocation = createUserInput.location;
      } else {
        pickLocation = location;
      }

      const result = await this.prismaService.user.create({
        data: {
          ...createUserInput,
          state: USER_FIRST_LOGIN.FALSE,
          location: pickLocation,
          dateOfBirth: dob.toISOString(),
          joinedDate: joinDate.toISOString(),
        },
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll(input: FindUsersInput, user: CurrentUserInterface) {
    const {
      page = 1,
      limit = 10,
      query,
      type,
      sort = 'firstName',
      sortOrder = 'asc',
    } = input;

    const where: Prisma.UserWhereInput = {};

    if (type && type.length > 0) {
      where.type = { in: type };
    }
    if (query) {
      const trimmedQuery = query.trim();
      const words = trimmedQuery.split(' ').filter((word) => word.length > 0);

      where.OR = [
        { firstName: { contains: trimmedQuery, mode: 'insensitive' } },
        { lastName: { contains: trimmedQuery, mode: 'insensitive' } },
        { staffCode: { contains: trimmedQuery, mode: 'insensitive' } },
      ];

      if (words.length > 1) {
        where.OR.push({
          AND: words.map((word) => ({
            OR: [
              { firstName: { contains: word, mode: 'insensitive' } },
              { lastName: { contains: word, mode: 'insensitive' } },
            ],
          })),
        });
      }
    }
    if (user) {
      where.location = user.location as $Enums.LOCATION; // Map to Prisma enum
      where.id = {
        not: user.id,
      };
    }

    const orderBy = { [sort]: sortOrder };

    const total = await this.prismaService.user.count({ where });
    const users = await this.prismaService.user.findMany({
      where: { ...where, isDisabled: false },
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
      users: users ? users : [],
    };
  }

  async findOne(id: number, location?: LOCATION) {
    const where: Prisma.UserWhereInput = {};
    if (location) {
      where.location = location as $Enums.LOCATION;
    }
    where.id = id;
    const user = await this.prismaService.user.findFirst({
      where,
    });
    if (!user) {
      throw new MyEntityNotFoundException(ENTITY_NAME.USER);
    }
    return user;
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    try {
      const { dateOfBirth, joinedDate } = updateUserInput;

      const updatedUser = await this.prismaService.user.findFirst({
        where: { id },
      });

      if (!updatedUser) {
        throw new MyEntityNotFoundException(ENTITY_NAME.USER);
      }

      if (updatedUser.type === USER_TYPE.ADMIN) {
        throw new MyForbiddenException(
          'You are not had permission to edit admin!',
        );
      }

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

      if (ageAtCurrentDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 currently. Please select a different date of birth.',
        );
      }

      if (ageAtJoinDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 at the join date. Please select a different join date.',
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
    const isAlreadyHadAssigned = await this.prismaService.user.findFirst({
      where: { id: id, isAssigned: true },
    });

    if (id && isAlreadyHadAssigned) {
      throw new MyBadRequestException(
        'There are valid assignments belonging to this user. Please close all assignments before disabling user.',
      );
    }

    const result = await this.prismaService.user.update({
      where: { id },
      data: {
        isDisabled: USER_STATUS.ACTIVE,
      },
    });

    return result ? true : false;
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
