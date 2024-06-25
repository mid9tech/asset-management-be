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
  GENDER,
} from 'src/shared/enums';

import { HashPW } from 'src/shared/helpers';
import {
  MyBadRequestException,
  MyEntityNotFoundException,
} from 'src/shared/exceptions';
import { FindUsersInput, FindUsersOutput } from './dto/find-users.input';
import { Prisma, User } from '@prisma/client';
import { ENTITY_NAME } from 'src/shared/constants';

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

  async findAll(input: FindUsersInput, user: User) {
    const {
      page = 1,
      limit = 10,
      query,
      type,
      sort = 'firstName',
      sortOrder = 'asc',
    } = input;

    const where: Prisma.UserWhereInput = {};

    if (type) {
      where.type = type as $Enums.USER_TYPE; // Map to Prisma enum
    }

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { staffCode: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (user) {
      where.location = user.location as $Enums.LOCATION; // Map to Prisma enum
      where.id = {
        not: user.id,
      };
    }

    const orderBy = { [sort]: sortOrder };

    try {
      const total = await this.prismaService.user.count({ where });
      const users = await this.prismaService.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      });

      const totalPages = Math.ceil(total / limit);

      const result = new FindUsersOutput();
      result.users = users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        staffCode: user.staffCode,
        username: user.username,
        password: user.password,
        gender: user.gender as GENDER, // Map to application enum
        salt: user.salt,
        refreshToken: user.refreshToken,
        joinedDate: user.joinedDate.toString(),
        type: user.type as USER_TYPE, // Map to application enum
        dateOfBirth: user.dateOfBirth.toString(),
        state: user.state,
        location: user.location as LOCATION, // Map to application enum
      }));
      result.page = page;
      result.limit = limit;
      result.total = total;
      result.totalPages = totalPages;
      return result;
    } catch (error) {
      console.error('Error finding users:', error);
      throw new Error('Error finding users');
    }
  }

  async findOne(id: number, location: LOCATION): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: id,
        location: location as $Enums.LOCATION,
      },
    });
    if (!user) {
      throw new MyEntityNotFoundException(ENTITY_NAME.USER);
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
          isDisabled: USER_STATUS.INACTIVE,
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
