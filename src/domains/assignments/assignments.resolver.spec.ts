import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsResolver } from './assignments.resolver';
import { AssignmentsService } from './assignments.service';
import AssignmentsServiceMock from './__mocks__/mock-assignment.service';
import { UsersService } from '../users/users.service';
import UsersServiceMock from '../users/__mocks__/mock-users.service';
import {
  assignmentDataMock,
  assignmentInputMock,
  currentUserMock,
  findAssignmentInputMock,
  findAssignmentOutputMock,
  userDataMock,
} from 'src/shared/__mocks__';
import { MyBadRequestException } from 'src/shared/exceptions';

describe('AssignmentsResolver', () => {
  let resolver: AssignmentsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsResolver,
        {
          provide: AssignmentsService,
          useClass: AssignmentsServiceMock,
        },
        {
          provide: UsersService,
          useClass: UsersServiceMock,
        },
      ],
    }).compile();

    resolver = module.get<AssignmentsResolver>(AssignmentsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createAssignment', () => {
    it('should throw MyBadRequestException for invalid assignedToId', async () => {
      const input = assignmentInputMock[1];
      await expect(
        resolver.createAssignment(input, currentUserMock),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should throw MyBadRequestException for invalid assetId', async () => {
      const input = assignmentInputMock[0];
      await expect(
        resolver.createAssignment(input, currentUserMock),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should throw MyBadRequestException for invalid assignedDate', async () => {
      const input = assignmentInputMock[3];
      await expect(
        resolver.createAssignment(input, currentUserMock),
      ).rejects.toThrowError(MyBadRequestException);
    });

    it('should create an assignment', async () => {
      const result = await resolver.createAssignment(
        assignmentInputMock[5],
        currentUserMock,
      );
      expect(result).toEqual(assignmentDataMock[0]);
    });
  });

  describe('findAll', () => {
    it('should return a list of assignments', async () => {
      const result = await resolver.findAll(
        findAssignmentInputMock[0],
        currentUserMock,
      );
      expect(result).toEqual(findAssignmentOutputMock[0]);
    });
  });

  describe('getAssigner', () => {
    it('should return the assigner', async () => {
      const assignment = { assignedById: 1 } as any;
      const result = await resolver.getAssigner(assignment);
      expect(result).toEqual(userDataMock);
    });
  });

  describe('getAssignee', () => {
    it('should return the assignee', async () => {
      const assignment = { assignedToId: 1 } as any;
      const result = await resolver.getAssignee(assignment);
      expect(result).toEqual(userDataMock);
    });
  });

  describe('findOne', () => {
    it('should return a single assignment by ID', async () => {
      const id = 1;
      const result = await resolver.findOne(id);
      expect(result).toEqual(assignmentDataMock[0]);
    });

    it('should return null if assignment not found', async () => {
      const id = 2;
      const result = await resolver.findOne(id);
      expect(result).toBeNull();
    });
  });
});