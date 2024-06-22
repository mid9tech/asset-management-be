import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import UsersServiceMock from './__mocks__/mock-users.service';
import { UsersService } from './users.service';
import { userDataMock, userInputMock } from 'src/shared/__mocks__';
import { LOCATION, USER_STATUS, USER_TYPE } from 'src/shared/enums';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  // let usersServiceMock: UsersService;

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
    // usersServiceMock = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const result = await resolver.createUser(userInputMock[0], {
        firstName: 'Hai',
        id: 1,
        joinedDate: '2022-02-02',
        lastName: 'Nguyen Van',
        location: LOCATION.HN,
        type: USER_TYPE.ADMIN,
        staffCode: 'admin1',
        state: USER_STATUS.ACTIVE,
        username: 'admin1',
      });
      expect(result).toEqual(userDataMock);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const result = await resolver.updateUser(userInputMock[0], 1);
      expect(result).toEqual(userDataMock);
    });
  });

  describe('disableUser', () => {
    it('should disable a user', async () => {
      const id = 1;
      const result = await resolver.disableUser(id);
      expect(result).toBe(true);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
