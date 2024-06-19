import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from '../../services/prisma/prisma.service';
import { LOCATION, USER_STATUS } from '../../shared/enums';
import { MyBadRequestException } from '../../shared/exceptions';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserInput: CreateUserInput) {
    try {
      const { dateOfBirth, joinedDate, lastName, firstName } = createUserInput;

      if (lastName === '' && firstName === '') {
        throw new MyBadRequestException('Name is invalid');
      }

      if (isNaN(Date.parse(dateOfBirth))) {
        throw new MyBadRequestException('DOB is invalid');
      }

      if (isNaN(Date.parse(joinedDate))) {
        throw new MyBadRequestException('JoinedDate is invalid');
      }

      const result = await this.prismaService.user.create({
        data: {
          ...createUserInput,
          state: USER_STATUS.ACTIVE,
          location: LOCATION.HCM,
          dateOfBirth: new Date(dateOfBirth).toISOString(),
          joinedDate: new Date(joinedDate).toISOString(),
        },
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all users`;
  }
  findOne(id: number) {
    return `This action returns a #${id} user`;
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

  async findOneByUsername(username: string) {
    return await this.prismaService.user.findFirst({ where: { username } });
  }

  updatePassword(id: number, password: string) {
    return this.prismaService.user.update({
      where: { id },
      data: { password },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
