import { Test, TestingModule } from '@nestjs/testing';
import { RequestReturnsResolver } from './request-returns.resolver';
import { RequestReturnsService } from './request-returns.service';
import { AssetsService } from '../assets/assets.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { UsersService } from '../users/users.service';
import { FindRequestReturnsInput } from './dto/find-request-returns.input';
import { CreateRequestReturnInput } from './dto/create-request-return.input';

import { CurrentUserInterface } from 'src/shared/generics';
import { LOCATION, REQUEST_RETURN_STATE, USER_TYPE } from 'src/shared/enums';
import { RequestReturn } from './entities/request-return.entity';

const mockRequestReturnsService = {
  findRequestReturns: jest.fn(),
  findOne: jest.fn(),
  createRequestReturn: jest.fn(),
  completeRequestReturn: jest.fn(),
  deleteRequestReturn: jest.fn(),
};

const mockAssetsService = {
  findOne: jest.fn(),
};

const mockAssignmentsService = {
  findOne: jest.fn(),
};

const mockUsersService = {
  findOne: jest.fn(),
};

describe('RequestReturnsResolver', () => {
  let resolver: RequestReturnsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestReturnsResolver,
        { provide: RequestReturnsService, useValue: mockRequestReturnsService },
        { provide: AssetsService, useValue: mockAssetsService },
        { provide: AssignmentsService, useValue: mockAssignmentsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    resolver = module.get<RequestReturnsResolver>(RequestReturnsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getRequestReturns', () => {
    it('should return paginated request returns', async () => {
      const userReq: CurrentUserInterface = {
        id: 1,
        firstName: 'John',
        staffCode: 'SC001',
        lastName: 'Doe',
        location: LOCATION.HCM,
        state: true,
        type: USER_TYPE.ADMIN,
        username: 'johndoe',
        joinedDate: new Date().toISOString(),
      };
      const input: FindRequestReturnsInput = {
        query: '',
        stateFilter: [],
        returnedDateFilter: undefined,
        page: 1,
        limit: 10,
        sortField: 'id',
        sortOrder: 'asc',
      };
      const requestReturns = [
        {
          id: 1,
          assetId: 1,
          assignmentId: 1,
          state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
        },
      ];

      mockRequestReturnsService.findRequestReturns.mockResolvedValueOnce({
        requestReturns,
        page: input.page,
        limit: input.limit,
        total: 1,
        totalPages: 1,
      });

      const result = await resolver.getRequestReturns(userReq, input);
      expect(result).toEqual({
        requestReturns,
        page: input.page,
        limit: input.limit,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a request return', async () => {
      const userReq: CurrentUserInterface = {
        id: 1,
        firstName: 'John',
        staffCode: 'SC001',
        lastName: 'Doe',
        location: LOCATION.HCM,
        state: true,
        type: USER_TYPE.ADMIN,
        username: 'johndoe',
        joinedDate: new Date().toISOString(),
      };
      const requestReturn = { id: 1, assignment: { location: LOCATION.HCM } };

      mockRequestReturnsService.findOne.mockResolvedValueOnce(requestReturn);

      const result = await resolver.findOne(userReq, 1);
      expect(result).toEqual(requestReturn);
    });
  });

  describe('createRequestReturn', () => {
    it('should create a new request return', async () => {
      const userReq: CurrentUserInterface = {
        id: 1,
        firstName: 'John',
        staffCode: 'SC001',
        lastName: 'Doe',
        location: LOCATION.HCM,
        state: true,
        type: USER_TYPE.ADMIN,
        username: 'johndoe',
        joinedDate: new Date().toISOString(),
      };
      const createRequestReturnInput: CreateRequestReturnInput = {
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
      };
      const requestReturn = { id: 1, ...createRequestReturnInput };

      mockRequestReturnsService.createRequestReturn.mockResolvedValueOnce(
        requestReturn,
      );

      const result = await resolver.createRequestReturn(
        userReq,
        createRequestReturnInput,
      );
      expect(result).toEqual(requestReturn);
    });
  });

  describe('completeRequestReturn', () => {
    it('should complete a request return', async () => {
      const userReq: CurrentUserInterface = {
        id: 1,
        firstName: 'John',
        staffCode: 'SC001',
        lastName: 'Doe',
        location: LOCATION.HCM,
        state: true,
        type: USER_TYPE.ADMIN,
        username: 'johndoe',
        joinedDate: new Date().toISOString(),
      };
      const requestReturn = {
        id: 1,
        state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
      };

      mockRequestReturnsService.completeRequestReturn.mockResolvedValueOnce({
        ...requestReturn,
        state: REQUEST_RETURN_STATE.COMPLETED,
      });

      const result = await resolver.completeRequestReturn(userReq, 1);
      expect(result).toEqual({
        ...requestReturn,
        state: REQUEST_RETURN_STATE.COMPLETED,
      });
    });
  });

  describe('deleteRequestReturn', () => {
    it('should delete a request return', async () => {
      const userReq: CurrentUserInterface = {
        id: 1,
        firstName: 'John',
        staffCode: 'SC001',
        lastName: 'Doe',
        location: LOCATION.HCM,
        state: true,
        type: USER_TYPE.ADMIN,
        username: 'johndoe',
        joinedDate: new Date().toISOString(),
      };
      const requestReturn = {
        id: 1,
        state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
      };

      mockRequestReturnsService.deleteRequestReturn.mockResolvedValueOnce({
        ...requestReturn,
        isRemoved: true,
      });

      const result = await resolver.deleteRequestReturn(userReq, 1);
      expect(result).toEqual({
        ...requestReturn,
        isRemoved: true,
      });
    });
  });

  describe('ResolveField', () => {
    it('should return asset for a request return', async () => {
      const requestReturn: RequestReturn = {
        id: 1,
        assetId: 1,
        assignmentId: 0,
        requestedById: 0,
        acceptedById: 0,
        assignedDate: '',
        returnedDate: '',
        state: '',
        isRemoved: false,
      };
      const userReq: CurrentUserInterface = {
        id: 1,
        firstName: 'John',
        staffCode: 'SC001',
        lastName: 'Doe',
        location: LOCATION.HCM,
        state: true,
        type: USER_TYPE.ADMIN,
        username: 'johndoe',
        joinedDate: new Date().toISOString(),
      };
      const asset = { id: 1 };

      mockAssetsService.findOne.mockResolvedValueOnce(asset);

      const result = await resolver.asset(requestReturn, userReq);
      expect(result).toEqual(asset);
    });

    it('should return assignment for a request return', async () => {
      const requestReturn: RequestReturn = {
        id: 1,
        assignmentId: 1,
        assetId: 0,
        requestedById: 0,
        acceptedById: 0,
        assignedDate: '',
        returnedDate: '',
        state: '',
        isRemoved: false,
      };
      const userReq: CurrentUserInterface = {
        id: 1,
        firstName: 'John',
        staffCode: 'SC001',
        lastName: 'Doe',
        location: LOCATION.HCM,
        state: true,
        type: USER_TYPE.ADMIN,
        username: 'johndoe',
        joinedDate: new Date().toISOString(),
      };
      const assignment = { id: 1 };

      mockAssignmentsService.findOne.mockResolvedValueOnce(assignment);

      const result = await resolver.assignment(requestReturn, userReq);
      expect(result).toEqual(assignment);
    });

    it('should return user for acceptedBy field', async () => {
      const requestReturn: RequestReturn = {
        id: 1,
        acceptedById: 1,
        assetId: 0,
        assignmentId: 0,
        requestedById: 0,
        assignedDate: '',
        returnedDate: '',
        state: '',
        isRemoved: false,
      };
      const user = { id: 1 };

      mockUsersService.findOne.mockResolvedValueOnce(user);

      const result = await resolver.acceptedBy(requestReturn);
      expect(result).toEqual(user);
    });

    it('should return user for requestedBy field', async () => {
      const requestReturn: RequestReturn = {
        id: 1,
        requestedById: 1,
        assetId: 0,
        assignmentId: 0,
        acceptedById: 0,
        assignedDate: '',
        returnedDate: '',
        state: '',
        isRemoved: false,
      };
      const userReq: CurrentUserInterface = {
        id: 1,
        firstName: 'John',
        staffCode: 'SC001',
        lastName: 'Doe',
        location: LOCATION.HCM,
        state: true,
        type: USER_TYPE.ADMIN,
        username: 'johndoe',
        joinedDate: new Date().toISOString(),
      };
      const user = { id: 1 };

      mockUsersService.findOne.mockResolvedValueOnce(user);

      const result = await resolver.requestedBy(requestReturn, userReq);
      expect(result).toEqual(user);
    });

    it('should return null for acceptedBy field', async () => {
      const requestReturn: RequestReturn = {
        id: 1,
        assetId: 0,
        assignmentId: 0,
        requestedById: 0,
        assignedDate: '',
        returnedDate: '',
        state: '',
        isRemoved: false,
        acceptedById: 0,
      };

      const result = await resolver.acceptedBy(requestReturn);
      expect(result).toBeNull();
    });
  });
});
