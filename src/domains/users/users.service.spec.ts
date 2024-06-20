import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { GENDER, USER_TYPE, User } from '@prisma/client';
import { ENTITY_NAME } from '../../shared/constants';
import { MyEntityNotFoundException } from '../../shared/exceptions';
import { LOCATION } from '../../shared/enums';
import { PrismaService } from 'src/services/prisma/prisma.service';
import PrismaServiceMock from 'src/services/prisma/__mocks__/mock-prisma.service';
import { userDataMock, userInputMock } from 'src/shared/__mocks__';
import { MyBadRequestException } from 'src/shared/exceptions';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaServiceMock: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useClass: PrismaServiceMock, // Use the mock class for PrismaService
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaServiceMock = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const result = await usersService.create(userInputMock[0]);
      expect(result).toEqual(userDataMock);
    });

    it('should throw MyBadRequestException for invalid DOB', async () => {
      await expect(usersService.create(userInputMock[1])).rejects.toThrowError(
        MyBadRequestException,
      );
    });

    it('should throw MyBadRequestException for invalid joinedDate', async () => {
      await expect(usersService.create(userInputMock[2])).rejects.toThrowError(
        MyBadRequestException,
      );
    });

    it('should throw MyBadRequestException for invalid firstName', async () => {
      await expect(usersService.create(userInputMock[3])).rejects.toThrowError(
        MyBadRequestException,
      );
    });

    it('should throw MyBadRequestException for invalid lastName', async () => {
      await expect(usersService.create(userInputMock[4])).rejects.toThrowError(
        MyBadRequestException,
      );
    });

    // New test cases
    it('should throw MyBadRequestException for user under 18 at join date', async () => {
      await expect(usersService.create(userInputMock[5])).rejects.toThrowError(
        MyBadRequestException,
      );
    });

    it('should create a user who is exactly 18 at join date', async () => {
      const result = await usersService.create(userInputMock[7]);
      expect(result).toEqual(userDataMock);
    });

    it('should throw MyBadRequestException for user under 18 at current date', async () => {
      await expect(usersService.create(userInputMock[6])).rejects.toThrowError(
        MyBadRequestException,
      );
    });

    it('should create a user who is exactly 18 at current date', async () => {
      const result = await usersService.create(userInputMock[8]);
      expect(result).toEqual(userDataMock);
    });
  });

  // Update user tests
  describe('update', () => {
    it('should update a user', async () => {
      const result = await usersService.update(1, userInputMock[0]);
      expect(result).toEqual(userDataMock);
    });

    it('should update a user with valid input', async () => {
      const result = await usersService.update(1, userInputMock[0]);
      expect(result).toEqual(userDataMock);
    });

    it('should throw MyBadRequestException for invalid DOB', async () => {
      await expect(
        usersService.update(1, userInputMock[1]),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should throw MyBadRequestException for invalid joinedDate', async () => {
      await expect(
        usersService.update(1, userInputMock[2]),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should throw MyBadRequestException for user under 18 at join date', async () => {
      await expect(
        usersService.update(1, userInputMock[5]),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should throw MyBadRequestException for user under 18 at current date', async () => {
      await expect(
        usersService.update(1, userInputMock[6]),
      ).rejects.toThrowError(MyBadRequestException);
    });
  });

  // Additional existing test cases
  it('should disable a user', async () => {
    const result = await usersService.disableUser(1);
    expect(result).toBe(true);
  });

  // Additional existing test cases
  it('should update Refresh Token a user', async () => {
    const result = await usersService.updateRefreshToken(1, 'refresh_token');
    expect(result).toEqual(userDataMock);
  });

  // Additional existing test cases
  it('should check Refresh Token a user', async () => {
    const result = await usersService.checkRefreshToken(1, 'refresh_token');
    expect(result).toBe(true);
  });

  // Additional existing test cases
  it('should find One By Username', async () => {
    const result = await usersService.findOneByUsername('username');
    expect(result).toEqual(userDataMock);
  });

  // Additional existing test cases
  it('should update Password', async () => {
    const result = await usersService.updatePassword(1, 'new password');
    expect(result).toEqual(userDataMock);
  });

  afterEach(() => {
    // Optionally clear mock calls if needed
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    const mockUser: User = {
      id: 1,
      firstName: 'John',
      staffCode: 'STAFF001',
      lastName: 'Doe',
      username: 'johndoe',
      password: 'hashedpassword',
      gender: GENDER.MALE,
      salt: 'saltvalue',
      refreshToken: 'refreshTokenValue',
      joinedDate: new Date('2023-01-01T00:00:00Z'),
      type: USER_TYPE.USER,
      dateOfBirth: new Date('1990-01-01T00:00:00Z'),
      state: true,
      location: LOCATION.HCM,
    };

    it('should find user by id', async () => {

      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw MyEntityNotFoundException if user does not exist', async () => {
      // Mock the behavior of PrismaService.user.findFirst
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);

      try {
        await service.findOne(999); // Providing an id that does not exist
        // If findOne does not throw, fail the test
        fail('Expected MyEntityNotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(MyEntityNotFoundException);
        expect(error.message).toBe(`${ENTITY_NAME.USER} not found`);
      }
    });
  });
});
