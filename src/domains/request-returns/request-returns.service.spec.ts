import { Test, TestingModule } from '@nestjs/testing';
import { RequestReturnsService } from './request-returns.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { MyBadRequestException } from 'src/shared/exceptions';
import { CreateRequestReturnInput } from './dto/create-request-return.input';
import { FindRequestReturnsInput } from './dto/find-request-returns.input';
import { ASSET_STATE, LOCATION, REQUEST_RETURN_STATE } from '@prisma/client';

describe('RequestReturnsService', () => {
  let service: RequestReturnsService;

  const mockPrismaService = {
    requestReturn: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    assignment: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    asset: {
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestReturnsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RequestReturnsService>(RequestReturnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findRequestReturns', () => {
    it('should return paginated request returns', async () => {
      const input: FindRequestReturnsInput = {
        query: '',
        stateFilter: [],
        returnedDateFilter: undefined,
        page: 1,
        limit: 10,
        sortField: 'id',
        sortOrder: 'asc',
      };
      const location = LOCATION.HCM;
      const requestReturns = [
        {
          id: 1,
          assetId: 1,
          assignmentId: 1,
          state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
          assignedDate: null,
          returnedDate: null,
        },
      ];
      const total = 1;

      mockPrismaService.requestReturn.findMany.mockResolvedValueOnce(
        requestReturns,
      );
      mockPrismaService.requestReturn.count.mockResolvedValueOnce(total);

      const result = await service.findRequestReturns(input, location);

      expect(result).toEqual({
        requestReturns: requestReturns.map((r) => ({
          ...r,
          assignedDate: r.assignedDate?.toISOString() || null,
          returnedDate: r.returnedDate?.toISOString() || null,
        })),
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      });
    });

    it('should handle empty state filter and undefined returned date filter', async () => {
      const input: FindRequestReturnsInput = {
        query: '',
        stateFilter: [],
        returnedDateFilter: undefined,
        page: 1,
        limit: 10,
        sortField: 'id',
        sortOrder: 'asc',
      };
      const location = LOCATION.HCM;
      const requestReturns = [
        {
          id: 1,
          assetId: 1,
          assignmentId: 1,
          state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
          assignedDate: null,
          returnedDate: null,
        },
      ];
      const total = 1;

      mockPrismaService.requestReturn.findMany.mockResolvedValueOnce(
        requestReturns,
      );
      mockPrismaService.requestReturn.count.mockResolvedValueOnce(total);

      const result = await service.findRequestReturns(input, location);

      expect(result).toEqual({
        requestReturns: requestReturns.map((r) => ({
          ...r,
          assignedDate: r.assignedDate?.toISOString() || null,
          returnedDate: r.returnedDate?.toISOString() || null,
        })),
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      });
    });

    it('should throw an error if finding request returns fails', async () => {
      const input: FindRequestReturnsInput = {
        query: '',
        stateFilter: [],
        returnedDateFilter: undefined,
        page: 1,
        limit: 10,
        sortField: 'id',
        sortOrder: 'asc',
      };
      const location = LOCATION.HCM;

      mockPrismaService.requestReturn.findMany.mockRejectedValueOnce(
        new Error(),
      );

      await expect(service.findRequestReturns(input, location)).rejects.toThrow(
        MyBadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a request return if found', async () => {
      const requestReturn = { id: 1, assignment: { location: LOCATION.HCM } };
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(
        requestReturn,
      );

      const result = await service.findOne(1, LOCATION.HCM);
      expect(result).toEqual(requestReturn);
    });

    it('should throw an error if request return is not found', async () => {
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(1, LOCATION.HCM)).rejects.toThrow(
        MyBadRequestException,
      );
    });
  });

  describe('createRequestReturn', () => {
    it('should create a new request return if inputs are valid', async () => {
      const createRequestReturnInput: CreateRequestReturnInput = {
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
      };
      const location = 'HCM';
      const assignment = {
        id: 1,
        location: LOCATION.HCM,
        state: 'ACCEPTED',
        assetId: 1,
      };
      const requestReturn = { id: 1, ...createRequestReturnInput };

      mockPrismaService.assignment.findUnique.mockResolvedValueOnce(assignment);
      mockPrismaService.requestReturn.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.requestReturn.create.mockResolvedValueOnce(
        requestReturn,
      );

      const result = await service.createRequestReturn(
        createRequestReturnInput,
        location,
      );
      expect(result).toEqual(requestReturn);
    });

    it('should throw an error if request return already exists', async () => {
      const createRequestReturnInput: CreateRequestReturnInput = {
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
      };
      const location = 'HCM';
      const checkExist = { id: 1, assignmentId: 1 };

      mockPrismaService.requestReturn.findFirst.mockResolvedValueOnce(
        checkExist,
      );

      await expect(
        service.createRequestReturn(createRequestReturnInput, location),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if assignment is not found', async () => {
      const createRequestReturnInput: CreateRequestReturnInput = {
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
      };
      const location = 'HCM';

      mockPrismaService.assignment.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.createRequestReturn(createRequestReturnInput, location),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if assignment location does not match', async () => {
      const createRequestReturnInput: CreateRequestReturnInput = {
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
      };
      const location = 'HCM';
      const assignment = {
        id: 1,
        location: LOCATION.HN,
        state: 'ACCEPTED',
        assetId: 1,
      };

      mockPrismaService.assignment.findUnique.mockResolvedValueOnce(assignment);

      await expect(
        service.createRequestReturn(createRequestReturnInput, location),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if assignment state is not accepted', async () => {
      const createRequestReturnInput: CreateRequestReturnInput = {
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
      };
      const location = 'HCM';
      const assignment = {
        id: 1,
        location: LOCATION.HCM,
        state: 'NOT_ACCEPTED',
        assetId: 1,
      };

      mockPrismaService.assignment.findUnique.mockResolvedValueOnce(assignment);

      await expect(
        service.createRequestReturn(createRequestReturnInput, location),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if asset id does not match assignment asset id', async () => {
      const createRequestReturnInput: CreateRequestReturnInput = {
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
      };
      const location = 'HCM';
      const assignment = {
        id: 1,
        location: LOCATION.HCM,
        state: 'ACCEPTED',
        assetId: 2,
      };

      mockPrismaService.assignment.findUnique.mockResolvedValueOnce(assignment);

      await expect(
        service.createRequestReturn(createRequestReturnInput, location),
      ).rejects.toThrow(MyBadRequestException);
    });
  });

  describe('deleteRequestReturn', () => {
    it('should delete a request return if conditions are met', async () => {
      const requestReturn = {
        id: 1,
        state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
        isRemoved: false,
      };
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(
        requestReturn,
      );
      mockPrismaService.requestReturn.update.mockResolvedValueOnce({
        ...requestReturn,
        isRemoved: true,
      });

      const result = await service.deleteRequestReturn(1, LOCATION.HCM);
      expect(result).toEqual({ ...requestReturn, isRemoved: true });
    });

    it('should throw an error if request return is not found', async () => {
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.deleteRequestReturn(1, LOCATION.HCM),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if request return is not in waiting state', async () => {
      const requestReturn = {
        id: 1,
        state: REQUEST_RETURN_STATE.COMPLETED,
        isRemoved: false,
      };
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(
        requestReturn,
      );

      await expect(
        service.deleteRequestReturn(1, LOCATION.HCM),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if request return is already removed', async () => {
      const requestReturn = {
        id: 1,
        state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
        isRemoved: true,
      };
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(
        requestReturn,
      );

      await expect(
        service.deleteRequestReturn(1, LOCATION.HCM),
      ).rejects.toThrow(MyBadRequestException);
    });
  });

  describe('completeRequestReturn', () => {
    it('should complete a request return if conditions are met', async () => {
      const requestReturn = {
        id: 1,
        state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
        isRemoved: false,
        assetId: 1,
        assignmentId: 1,
      };
      const assignment = { id: 1, assignedToId: 1, isRemoved: false };
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(
        requestReturn,
      );
      mockPrismaService.requestReturn.update.mockResolvedValueOnce({
        ...requestReturn,
        state: REQUEST_RETURN_STATE.COMPLETED,
      });
      mockPrismaService.asset.update.mockResolvedValueOnce({
        id: 1,
        state: ASSET_STATE.AVAILABLE,
      });
      mockPrismaService.assignment.update.mockResolvedValueOnce({
        ...assignment,
        isRemoved: true,
      });
      mockPrismaService.assignment.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.user.update.mockResolvedValueOnce({
        id: 1,
        isAssigned: false,
      });

      const result = await service.completeRequestReturn(1, LOCATION.HCM, 1);
      expect(result).toEqual({
        ...requestReturn,
        state: REQUEST_RETURN_STATE.COMPLETED,
      });
    });

    it('should throw an error if request return is not found', async () => {
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.completeRequestReturn(1, LOCATION.HCM, 1),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if request return is not in waiting state', async () => {
      const requestReturn = {
        id: 1,
        state: REQUEST_RETURN_STATE.COMPLETED,
        isRemoved: false,
      };
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(
        requestReturn,
      );

      await expect(
        service.completeRequestReturn(1, LOCATION.HCM, 1),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if request return is already removed', async () => {
      const requestReturn = {
        id: 1,
        state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
        isRemoved: true,
      };
      mockPrismaService.requestReturn.findUnique.mockResolvedValueOnce(
        requestReturn,
      );

      await expect(
        service.completeRequestReturn(1, LOCATION.HCM, 1),
      ).rejects.toThrow(MyBadRequestException);
    });
  });
});
