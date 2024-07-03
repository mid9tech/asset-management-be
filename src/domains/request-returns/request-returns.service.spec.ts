import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { RequestReturnsService } from './request-returns.service';
import { CreateRequestReturnInput } from './dto/create-request-return.input';
import { MyBadRequestException } from 'src/shared/exceptions';
import { LOCATION, REQUEST_RETURN_STATE } from 'src/shared/enums';

describe('RequestReturnsService', () => {
  let service: RequestReturnsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestReturnsService,
        {
          provide: PrismaService,
          useValue: {
            requestReturn: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
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
          },
        },
      ],
    }).compile();

    service = module.get<RequestReturnsService>(RequestReturnsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('findRequestReturns', () => {
  //   it('should find request returns based on input filters', async () => {
  //     const mockInput: FindRequestReturnsInput = {
  //       page: 1,
  //       limit: 10,
  //       query: 'test',
  //       sortField: 'assetCode',
  //       sortOrder: 'asc',
  //       stateFilter: [REQUEST_RETURN_STATE.COMPLETED],
  //       returnedDateFilter: '2023-01-01',
  //     };

  //     const mockLocation: LOCATION = LOCATION.HCM;

  //     const mockRequestReturns = [
  //       {
  //         id: 1,
  //         assetId: 1,
  //         assignmentId: 1,
  //         requestedById: 1,
  //         assignedDate: new Date(),
  //         returnedDate: null,
  //         state: REQUEST_RETURN_STATE.COMPLETED,
  //         isRemoved: false,
  //       },
  //     ];

  //     const mockTotal = 1;
  //     const mockTotalPages = 1;

  //     const expectedResult: FindRequestReturnsOutput = {
  //       requestReturns: [
  //         {
  //           id: 1,
  //           assetId: 1,
  //           assignmentId: 1,
  //           requestedById: 1,
  //           acceptedById: null,
  //           assignedDate: expect.any(String),
  //           returnedDate: null,
  //           state: REQUEST_RETURN_STATE.COMPLETED,
  //           isRemoved: false,
  //         },
  //       ],
  //       page: 1,
  //       limit: 10,
  //       total: mockTotal,
  //       totalPages: mockTotalPages,
  //     };

  //     (prismaService.requestReturn.findMany as jest.Mock).mockResolvedValueOnce(
  //       mockRequestReturns,
  //     );
  //     (prismaService.requestReturn.count as jest.Mock).mockResolvedValueOnce(
  //       mockTotal,
  //     );

  //     const result = await service.findRequestReturns(mockInput, mockLocation);

  //     expect(result).toEqual(expectedResult);
  //     expect(prismaService.requestReturn.findMany).toHaveBeenCalledWith({
  //       where: {
  //         OR: [
  //           { asset: { assetName: { contains: 'test' } } },
  //           { asset: { assetCode: { contains: 'test' } } },
  //           { requestedBy: { username: { contains: 'test' } } },
  //         ],
  //         state: { in: [REQUEST_RETURN_STATE.COMPLETED] },
  //         returnedDate: '2023-01-01',
  //         assignment: { location: LOCATION.HCM },
  //         isRemoved: false,
  //       },
  //       skip: 0,
  //       take: 10,
  //       orderBy: { 'asset.assetCode': 'asc' },
  //     });
  //     expect(prismaService.requestReturn.count).toHaveBeenCalledWith({
  //       where: {
  //         OR: [
  //           { asset: { assetName: { contains: 'test' } } },
  //           { asset: { assetCode: { contains: 'test' } } },
  //           { requestedBy: { username: { contains: 'test' } } },
  //         ],
  //         state: { in: [REQUEST_RETURN_STATE.COMPLETED] },
  //         returnedDate: '2023-01-01',
  //         assignment: { location: LOCATION.HCM },
  //         isRemoved: false,
  //       },
  //     });
  //   });

  //   it('should handle errors when finding request returns', async () => {
  //     const mockInput: FindRequestReturnsInput = {
  //       sortField: '',
  //       stateFilter: [],
  //       returnedDateFilter: '',
  //       page: 0,
  //       limit: 0,
  //       query: '',
  //       sortOrder: 'asc',
  //     };

  //     const mockLocation: LOCATION = LOCATION.HCM;

  //     (prismaService.requestReturn.count as jest.Mock).mockRejectedValueOnce(
  //       new Error('Prisma error'),
  //     );

  //     await expect(
  //       service.findRequestReturns(mockInput, mockLocation),
  //     ).rejects.toThrowError(MyBadRequestException);
  //   });
  // });

  describe('createRequestReturn', () => {
    it('should create a request return', async () => {
      const mockInput: CreateRequestReturnInput = {
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
      };

      const mockLocation: LOCATION = LOCATION.HCM;

      const mockAssignment = {
        id: 1,
        location: LOCATION.HCM,
        state: 'ACCEPTED', // Assuming this matches ASSIGNMENT_STATE.ACCEPTED
        assetId: 1,
        assignedDate: new Date(),
      };

      (prismaService.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        mockAssignment,
      );

      const mockRequestReturn = {
        id: 1,
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
        state: REQUEST_RETURN_STATE.WAITING_FOR_RETURNING,
      };

      (prismaService.requestReturn.create as jest.Mock).mockResolvedValueOnce(
        mockRequestReturn,
      );

      const result = await service.createRequestReturn(mockInput, mockLocation);

      expect(result).toEqual({
        ...mockRequestReturn,
        assignedDate: expect.any(String),
      });
      expect(prismaService.assignment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.requestReturn.create).toHaveBeenCalledWith({
        data: {
          assetId: 1,
          assignmentId: 1,
          requestedById: 1,
          state: 'WAITING_FOR_RETURNING',
          assignedDate: expect.any(String),
        },
      });
    });

    it('should handle errors when creating request return', async () => {
      const mockInput: CreateRequestReturnInput = {
        assetId: 1,
        assignmentId: 1,
        requestedById: 1,
        assignedDate: new Date().toISOString(),
      };

      const mockLocation: LOCATION = LOCATION.HCM;

      (prismaService.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(
        service.createRequestReturn(mockInput, mockLocation),
      ).rejects.toThrowError(MyBadRequestException);
    });
  });

  // Add more test cases for other methods like deleteRequestReturn and completeRequestReturn as needed
});
