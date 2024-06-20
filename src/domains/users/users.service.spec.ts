import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { GENDER, USER_TYPE, User } from '@prisma/client';
import { ENTITY_NAME } from '../../shared/constants';
import { MyEntityNotFoundException } from '../../shared/exceptions';
import { LOCATION } from '../../shared/enums';


describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
