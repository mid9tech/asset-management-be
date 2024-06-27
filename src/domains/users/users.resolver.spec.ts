import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import UsersServiceMock from './__mocks__/mock-users.service';
import { UsersService } from './users.service';
import {
  currentUserMock,
  findUserInputMock,
  findUserOutputMock,
  userDataMock,
  userInputMock,
} from 'src/shared/__mocks__';

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useClass: UsersServiceMock,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const result = await resolver.createUser(
        userInputMock[0],
        currentUserMock,
      );
      expect(result).toEqual(userDataMock);
    });

    it('should handle error on creating a user', async () => {
      jest.spyOn(resolver['usersService'], 'create').mockImplementation(() => {
        throw new Error('Error creating user');
      });
      try {
        await resolver.createUser(userInputMock[0], currentUserMock);
      } catch (e) {
        expect(e.message).toBe('Error creating user');
      }
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const result = await resolver.updateUser(userInputMock[0], 1);
      expect(result).toEqual(userDataMock);
    });

    it('should handle error on updating a user', async () => {
      jest.spyOn(resolver['usersService'], 'update').mockImplementation(() => {
        throw new Error('Error updating user');
      });
      try {
        await resolver.updateUser(userInputMock[0], 1);
      } catch (e) {
        expect(e.message).toBe('Error updating user');
      }
    });
  });

  describe('disableUser', () => {
    it('should disable a user', async () => {
      const id = 1;
      const result = await resolver.disableUser(id);
      expect(result).toBe(true);
    });

    it('should handle error on disabling a user', async () => {
      jest
        .spyOn(resolver['usersService'], 'disableUser')
        .mockImplementation(() => {
          throw new Error('Error disabling user');
        });
      try {
        await resolver.disableUser(1);
      } catch (e) {
        expect(e.message).toBe('Error disabling user');
      }
    });
  });

  describe('findUsers', () => {
    it('should return list user', async () => {
      const result = await resolver.findUsers(
        currentUserMock,
        findUserInputMock[0],
      );
      expect(result).toEqual(findUserOutputMock[0]);
    });

    it('should handle error on finding users', async () => {
      jest.spyOn(resolver['usersService'], 'findAll').mockImplementation(() => {
        throw new Error('Error finding users');
      });
      try {
        await resolver.findUsers(currentUserMock, findUserInputMock[0]);
      } catch (e) {
        expect(e.message).toBe('Error finding users');
      }
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const result = await resolver.findOne(1, currentUserMock);
      expect(result).toEqual(userDataMock);
    });

    it('should handle error on finding one user', async () => {
      jest.spyOn(resolver['usersService'], 'findOne').mockImplementation(() => {
        throw new Error('Error finding user');
      });
      try {
        await resolver.findOne(1, currentUserMock);
      } catch (e) {
        expect(e.message).toBe('Error finding user');
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
