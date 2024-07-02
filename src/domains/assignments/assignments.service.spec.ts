import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import PrismaServiceMock from 'src/services/prisma/__mocks__/mock-prisma.service';
import {
  assignmentInputMock,
  assignmentDataMock,
  currentUserMock,
  findAssignmentInputMock,
  findAssignmentOutputMock,
  assetDatePrismaMock,
  userDataPrismaMock,
  assignmentDataPrismaMock,
} from 'src/shared/__mocks__';
import {
  MyBadRequestException,
  MyEntityNotFoundException,
  MyForbiddenException,
} from 'src/shared/exceptions';
import { ASSET_STATE, ASSIGNMENT_STATE, LOCATION } from 'src/shared/enums';

describe('AssignmentsService', () => {
  let assignmentService: AssignmentsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        {
          provide: PrismaService,
          useClass: PrismaServiceMock, // Use the mock class for PrismaService
        },
      ],
    }).compile();

    assignmentService = module.get<AssignmentsService>(AssignmentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should always pass', () => {
    expect(true).toBeTruthy();
  });

  describe('create', () => {
    it('should throw MyBadRequestException for invalid assetId', async () => {
      jest.spyOn(prismaService.asset, 'findFirst').mockResolvedValue(null);

      await expect(
        assignmentService.create(assignmentInputMock[0], currentUserMock),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw MyBadRequestException for asset is already assigned', async () => {
      jest.spyOn(prismaService.asset, 'findFirst').mockResolvedValue({
        ...assetDatePrismaMock,
        state: ASSET_STATE.ASSIGNED,
      });

      await expect(
        assignmentService.create(assignmentInputMock[1], currentUserMock),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw MyForbiddenException for asset is already from different location', async () => {
      jest.spyOn(prismaService.asset, 'findFirst').mockResolvedValue({
        ...assetDatePrismaMock,
        location: LOCATION.DN,
      });

      await expect(
        assignmentService.create(assignmentInputMock[1], currentUserMock),
      ).rejects.toThrow(MyForbiddenException);
    });

    it('should throw MyBadRequestException for empty assignedToId', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      await expect(
        assignmentService.create(assignmentInputMock[3], currentUserMock),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw MyForbiddenException for assignedToId is already from different location', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        ...userDataPrismaMock,
        location: LOCATION.DN,
      });

      jest.spyOn(prismaService.asset, 'findFirst').mockResolvedValue({
        ...assetDatePrismaMock,
      });

      await expect(
        assignmentService.create(assignmentInputMock[1], currentUserMock),
      ).rejects.toThrow(MyForbiddenException);
    });

    it('should throw MyBadRequestException for invalid assignedDate', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        ...userDataPrismaMock,
      });

      await expect(
        assignmentService.create(assignmentInputMock[4], currentUserMock),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should return new assignment', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        ...userDataPrismaMock,
      });

      const result = await assignmentService.create(
        assignmentInputMock[5],
        currentUserMock,
      );

      expect(result).toEqual(assignmentDataMock[0]);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of assignments', async () => {
      const input = findAssignmentInputMock[0];
      const result = await assignmentService.findAll(input, currentUserMock);
      expect(result).toEqual(findAssignmentOutputMock[0]);
    });

    it('should return paginated list of own assignments', async () => {
      const input = findAssignmentInputMock[0];
      const result = await assignmentService.getListOwnAssignment(
        input,
        currentUserMock,
      );
      expect(result).toEqual(findAssignmentOutputMock[0]);
    });

    it('should throw MyBadRequestException for invalid assignedDate', async () => {
      const input = findAssignmentInputMock[1];
      await expect(
        assignmentService.findAll(input, currentUserMock),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('limit empty but no affect to logical, should return paginated list of assignments', async () => {
      const input = findAssignmentInputMock[2];
      const result = await assignmentService.findAll(input, currentUserMock);
      expect(result).toEqual({ ...findAssignmentOutputMock[0], limit: 20 });
    });

    it('page empty but no affect to logical, should return paginated list of assignments', async () => {
      const input = findAssignmentInputMock[3];
      const result = await assignmentService.findAll(input, currentUserMock);
      expect(result).toEqual(findAssignmentOutputMock[0]);
    });

    it('query empty but no affect to logical, should return paginated list of assignments', async () => {
      const input = findAssignmentInputMock[4];
      const result = await assignmentService.findAll(input, currentUserMock);
      expect(result).toEqual(findAssignmentOutputMock[0]);
    });

    it('sort empty but no affect to logical, should return paginated list of assignments', async () => {
      const input = findAssignmentInputMock[5];
      const result = await assignmentService.findAll(input, currentUserMock);
      expect(result).toEqual(findAssignmentOutputMock[0]);
    });

    it('sortOrder empty but no affect to logical, should return paginated list of assignments', async () => {
      const input = findAssignmentInputMock[6];
      const result = await assignmentService.findAll(input, currentUserMock);
      expect(result).toEqual(findAssignmentOutputMock[0]);
    });

    it('state empty but no affect to logical, should return paginated list of assignments', async () => {
      const input = findAssignmentInputMock[7];
      const result = await assignmentService.findAll(input, currentUserMock);
      expect(result).toEqual(findAssignmentOutputMock[0]);
    });

    it('assignedDate empty but no affect to logical, should return paginated list of assignments', async () => {
      const input = findAssignmentInputMock[8];
      const result = await assignmentService.findAll(input, currentUserMock);
      expect(result).toEqual(findAssignmentOutputMock[0]);
    });
  });

  describe('findOne', () => {
    it('should return assignment by id', async () => {
      const result = await assignmentService.findOne(1);
      expect(result).toEqual(assignmentDataMock[0]);
    });

    it('should throw MyEntityNotFoundException by invalid id', async () => {
      jest.spyOn(prismaService.assignment, 'findFirst').mockResolvedValue(null);

      await expect(assignmentService.findOne(1)).rejects.toThrow(
        MyEntityNotFoundException,
      );
    });
  });

  describe('removeAssignment', () => {
    it('should return true because remove assignment by id successfully', async () => {
      const result = await assignmentService.removeAssignment(
        1,
        currentUserMock,
      );
      expect(result).toEqual(true);
    });

    it('should throw MyEntityNotFoundException because assignment not found', async () => {
      jest.spyOn(prismaService.assignment, 'findFirst').mockResolvedValue(null);

      await expect(
        assignmentService.removeAssignment(1, currentUserMock),
      ).rejects.toThrow(MyEntityNotFoundException);
    });

    it('should throw MyBadRequestException because assignment state is not WAITING_FOR_ACCEPTANCE', async () => {
      jest.spyOn(prismaService.assignment, 'findFirst').mockResolvedValue({
        ...assignmentDataPrismaMock,
        state: ASSIGNMENT_STATE.ACCEPTED,
      });

      await expect(
        assignmentService.removeAssignment(1, currentUserMock),
      ).rejects.toThrow(MyBadRequestException);
    });
  });

  describe('update', () => {
    it('should throw MyEntityNotFoundException for invalid assignment id', async () => {
      jest.spyOn(prismaService.assignment, 'findFirst').mockResolvedValue(null);

      await expect(
        assignmentService.update(999, assignmentInputMock[0], currentUserMock),
      ).rejects.toThrow(MyEntityNotFoundException);
    });

    it('should throw MyBadRequestException for assignment not in WAITING_FOR_ACCEPTANCE state', async () => {
      jest.spyOn(prismaService.assignment, 'findFirst').mockResolvedValue({
        ...assignmentDataPrismaMock,
        state: ASSIGNMENT_STATE.DECLINED,
      });

      await expect(
        assignmentService.update(1, assignmentDataMock[0], currentUserMock),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw MyEntityNotFoundException for invalid asset id', async () => {
      jest
        .spyOn(prismaService.assignment, 'findFirst')
        .mockResolvedValue(assignmentDataPrismaMock);
      jest.spyOn(prismaService.asset, 'findFirst').mockResolvedValue(null);

      await expect(
        assignmentService.update(1, assignmentInputMock[6], currentUserMock),
      ).rejects.toThrow(MyEntityNotFoundException);
    });

    it('should throw MyBadRequestException for asset not ready to be assigned', async () => {
      jest
        .spyOn(prismaService.assignment, 'findFirst')
        .mockResolvedValue(assignmentDataPrismaMock);

      jest.spyOn(prismaService.asset, 'findFirst').mockResolvedValue({
        ...assetDatePrismaMock,
        state: ASSET_STATE.NOT_AVAILABLE,
      });

      await expect(
        assignmentService.update(1, assignmentInputMock[6], currentUserMock),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw MyForbiddenException for assigning asset from different location', async () => {
      jest
        .spyOn(prismaService.assignment, 'findFirst')
        .mockResolvedValue(assignmentDataPrismaMock);
      jest.spyOn(prismaService.asset, 'findFirst').mockResolvedValue({
        ...assetDatePrismaMock,
        location: LOCATION.DN,
      });

      await expect(
        assignmentService.update(2, assignmentInputMock[6], currentUserMock),
      ).rejects.toThrow(MyForbiddenException);
    });

    it('should throw MyEntityNotFoundException for invalid user id', async () => {
      jest
        .spyOn(prismaService.assignment, 'findFirst')
        .mockResolvedValue(assignmentDataPrismaMock);
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(
        assignmentService.update(3, assignmentInputMock[6], currentUserMock),
      ).rejects.toThrow(MyEntityNotFoundException);
    });

    it('should throw MyBadRequestException for invalid assigned date', async () => {
      jest
        .spyOn(prismaService.assignment, 'findFirst')
        .mockResolvedValue(assignmentDataPrismaMock);

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(userDataPrismaMock);

      const invalidDateInput = {
        ...assignmentInputMock[6],
        assignedDate: 'invalid-date',
      };

      await expect(
        assignmentService.update(1, invalidDateInput, currentUserMock),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw MyForbiddenException for assigned user form different location', async () => {
      jest
        .spyOn(prismaService.assignment, 'findFirst')
        .mockResolvedValue(assignmentDataPrismaMock);

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue({ ...userDataPrismaMock, location: LOCATION.DN });

      await expect(
        assignmentService.update(1, assignmentDataMock[0], currentUserMock),
      ).rejects.toThrow(MyForbiddenException);
    });

    it('should successfully update assignment', async () => {
      jest
        .spyOn(prismaService.assignment, 'findFirst')
        .mockResolvedValue(assignmentDataPrismaMock);

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(userDataPrismaMock);

      const updatedAssignment = await assignmentService.update(
        1,
        assignmentInputMock[6],
        currentUserMock,
      );

      expect(updatedAssignment).toBeDefined();
      expect(updatedAssignment).toEqual(assignmentDataMock[0]);
      // Add more assertions based on your expected update result
    });
  });

  describe('updateStatusAssignment', () => {
    it('should return true because update status assignment by id successfully', async () => {
      const result = await assignmentService.updateStatusAssignment(
        { id: 1, state: ASSIGNMENT_STATE.ACCEPTED },
        currentUserMock,
      );
      expect(result).toEqual(true);
    });

    it('should throw MyEntityNotFoundException because assignment not found', async () => {
      jest.spyOn(prismaService.assignment, 'findFirst').mockResolvedValue(null);

      await expect(
        assignmentService.updateStatusAssignment(
          { id: 1, state: ASSIGNMENT_STATE.ACCEPTED },
          currentUserMock,
        ),
      ).rejects.toThrow(MyEntityNotFoundException);
    });

    it('should throw MyBadRequestException because assignment state is not WAITING_FOR_ACCEPTANCE', async () => {
      jest.spyOn(prismaService.assignment, 'findFirst').mockResolvedValue({
        ...assignmentDataPrismaMock,
        state: ASSIGNMENT_STATE.ACCEPTED,
      });

      await expect(
        assignmentService.updateStatusAssignment(
          { id: 1, state: ASSIGNMENT_STATE.ACCEPTED },
          currentUserMock,
        ),
      ).rejects.toThrow(MyBadRequestException);
    });
  });
});
