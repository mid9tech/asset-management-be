import { MyBadRequestException } from 'src/shared/exceptions';
import { CreateUserInput } from '../dto/create-user.input';
import { userDataMock } from 'src/shared/__mocks__';
import { UpdateUserInput } from '../dto/update-user.input';
import { FindUsersInput } from '../dto/find-users.input';
import { CurrentUserInterface } from 'src/shared/generics';
import { Prisma } from '@prisma/client';
import { LOCATION } from 'src/shared/enums';

export default class UsersServiceMock {
  calculateAge(dob: Date, compareDate: Date): number {
    const diff = compareDate.getTime() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  create = jest.fn().mockImplementation((createUserInput: CreateUserInput) => {
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

    return userDataMock;
  });

  update = jest
    .fn()
    .mockImplementation((id: number, updateUserInput: UpdateUserInput) => {
      const { dateOfBirth, joinedDate } = updateUserInput;

      id++;

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

      return userDataMock;
    });

  disableUser = jest.fn().mockImplementation((id: number) => {
    console.log(id);
    return true;
  });

  updateRefreshToken = jest
    .fn()
    .mockImplementation((id: number, refreshToken: string) => {
      console.log(id, refreshToken);
      return userDataMock;
    });

  checkRefreshToken = jest
    .fn()
    .mockImplementation((id: number, refreshToken: string) => {
      console.log(id, refreshToken);
      return true;
    });

  findOneByUsername = jest.fn().mockImplementation((username: string) => {
    console.log(username);
    return userDataMock;
  });

  updatePassword = jest
    .fn()
    .mockImplementation((id: number, password: string) => {
      console.log(id, password);
      return userDataMock;
    });

  findAll = jest
    .fn()
    .mockImplementation((input: FindUsersInput, user: CurrentUserInterface) => {
      const { page = 1, limit = 10, query, type } = input;

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
        where.location = user.location; // Map to Prisma enum
        where.id = {
          not: user.id,
        };
      }

      try {
        return {
          page: page,
          limit: limit,
          total: 10,
          totalPages: 1,
          users: userDataMock,
        };
      } catch (error) {
        console.error('Error finding users:', error);
        throw new Error('Error finding users');
      }
    });

  findOne = jest.fn().mockImplementation((id: number, location?: LOCATION) => {
    const where: Prisma.UserWhereInput = {};
    if (location) {
      where.location = location;
    }

    return userDataMock;
  });
}
