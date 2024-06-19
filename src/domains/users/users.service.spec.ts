import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
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

  it('should create a user', async () => {
    const result = await usersService.create(userInputMock[0]);

    expect(result).toEqual(userDataMock);
  });

  it('should throw MyBadRequestException for invalid DOB', async () => {
    await expect(usersService.create(userInputMock[1])).rejects.toThrowError(
      MyBadRequestException,
    );
  });

  // Add more test cases to cover other methods in UsersService

  afterEach(() => {
    // Optionally clear mock calls if needed
    jest.clearAllMocks();
  });
});
