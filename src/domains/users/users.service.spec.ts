import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

import { ENTITY_NAME } from 'src/shared/constants';
import {
  MyEntityNotFoundException,
  MyForbiddenException,
} from 'src/shared/exceptions';

import { PrismaService } from 'src/services/prisma/prisma.service';
import PrismaServiceMock from 'src/services/prisma/__mocks__/mock-prisma.service';
import {
  currentUserMock,
  findUserInputMock,
  findUserOutputMock,
  userDataMock,
  userDataPrismaMock,
  userInputMock,
} from 'src/shared/__mocks__';
import { MyBadRequestException } from 'src/shared/exceptions';
import { LOCATION } from 'src/shared/enums';

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
      const result = await usersService.create(
        userInputMock[0],
        userInputMock[0].location,
      );
      expect(result).toEqual(userDataMock);
    });

    it('should throw MyBadRequestException for invalid DOB', async () => {
      await expect(
        usersService.create(userInputMock[1], userInputMock[1].location),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should throw MyBadRequestException for invalid joinedDate', async () => {
      await expect(
        usersService.create(userInputMock[2], userInputMock[2].location),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should throw MyBadRequestException for invalid firstName', async () => {
      await expect(
        usersService.create(userInputMock[3], userInputMock[1].location),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should throw MyBadRequestException for invalid lastName', async () => {
      await expect(
        usersService.create(userInputMock[4], userInputMock[1].location),
      ).rejects.toThrowError(MyBadRequestException);
    });

    // New test cases
    it('should throw MyBadRequestException for user under 18 at join date', async () => {
      await expect(
        usersService.create(userInputMock[5], userInputMock[1].location),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should create a user who is exactly 18 at join date', async () => {
      const result = await usersService.create(
        userInputMock[7],
        userInputMock[1].location,
      );
      expect(result).toEqual(userDataMock);
    });

    it('should throw MyBadRequestException for user under 18 at current date', async () => {
      await expect(
        usersService.create(userInputMock[6], userInputMock[1].location),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should create a user who is exactly 18 at current date', async () => {
      const result = await usersService.create(
        userInputMock[8],
        userInputMock[1].location,
      );
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

    it('should throw MyEntityNotFoundException for user not found', async () => {
      jest.spyOn(prismaServiceMock.user, 'findFirst').mockResolvedValue(null);
      await expect(usersService.update(1, userInputMock[6])).rejects.toThrow(
        MyEntityNotFoundException,
      );
    });

    it('should throw MyForbiddenException because edit ADMIN', async () => {
      jest.spyOn(prismaServiceMock.user, 'findFirst').mockResolvedValue({
        ...userDataPrismaMock,
      });
      await expect(usersService.update(1, userInputMock[6])).rejects.toThrow(
        MyForbiddenException,
      );
    });
  });

  // Additional existing test cases
  describe('Disable User', () => {
    it('should not disable a user, return MyBadRequestException', async () => {
      await expect(usersService.disableUser(1)).rejects.toThrowError(
        MyBadRequestException,
      );
    });

    it('should disable a user', async () => {
      const result = await usersService.disableUser(null);
      expect(result).toBe(true);
    });
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
    jest
      .spyOn(usersService, 'getSalt')
      .mockResolvedValue({ salt: '$2b$10$r22I5rrcS52ukc6xnAmuQO' });
    const result = await usersService.updatePassword(1, 'new password');
    expect(result).toEqual(userDataMock);
  });

  it('should getSalt', async () => {
    const result = await usersService.getSalt(1);
    expect(result).toEqual(userDataMock);
  });

  it('should updateState', async () => {
    const result = await usersService.updateState(1, true);
    expect(result).toEqual(userDataMock);
  });

  it('should return user', async () => {
    const result = await usersService.findOneByUsername('username');
    expect(result).toEqual(userDataMock);
  });

  it('should return user', async () => {
    const result = await usersService.findOneById(1);
    expect(result).toEqual(userDataMock);
  });

  afterEach(() => {
    // Optionally clear mock calls if needed
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should find user by id', async () => {
      const result = await usersService.findOne(1, LOCATION.HCM);
      expect(result).toEqual(userDataMock);
    });

    it('should throw MyEntityNotFoundException if user does not exist', async () => {
      // Mock the behavior of PrismaService.user.findFirst
      (prismaServiceMock.user.findFirst as jest.Mock).mockResolvedValue(null);

      try {
        await usersService.findOne(999, LOCATION.HCM); // Providing an id that does not exist
        // If findOne does not throw, fail the test
        fail('Expected MyEntityNotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(MyEntityNotFoundException);
        expect(error.message).toBe(`${ENTITY_NAME.USER} not found`);
      }
    });
  });

  describe('findMany', () => {
    it('find user input is okay, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[0],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[0]);
    });

    it('limit empty but no affect to logical, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[1],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[0]);
    });

    it('page empty but no affect to logical, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[2],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[0]);
    });

    it('query empty but no affect to logical, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[3],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[0]);
    });

    it('sort empty but no affect to logical, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[4],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[0]);
    });

    it('sortOrder empty but no affect to logical, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[5],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[0]);
    });

    it('type empty but no affect to logical, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[6],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[0]);
    });

    it('limit is null so return all record, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[7],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[1]);
    });

    it('page is null so return record in page 1, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[8],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[2]);
    });

    it('query is null but no affect to logical, return user list', async () => {
      const result = await usersService.findAll(
        findUserInputMock[9],
        currentUserMock,
      );

      expect(result).toEqual(findUserOutputMock[0]);
    });
  });
});
