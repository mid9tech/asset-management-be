import { CreateAssignmentInput } from 'src/domains/assignments/dto/create-assignment.input';
import { Assignment } from 'src/domains/assignments/entities/assignment.entity';
import { userDataMock } from './user';
import { ASSIGNMENT_STATE } from '../enums';
import {
  FindAssignmentsOutput,
  FindAssignmentsInput,
} from 'src/domains/assignments/dto/find-assignment.input';

export const assignmentDataMock: Assignment[] = [
  {
    assetCode: 'assignment1',
    assetId: 1,
    assetName: 'asset',
    assignedById: 1,
    assignedDate: '2024-12-22T13:32:33.076Z',
    assignedToId: 2,
    assignee: userDataMock[0],
    assigner: userDataMock[0],
    state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
    id: 1,
    note: 'Note',
  },
];

export const assignmentInputMock: CreateAssignmentInput[] = [
  {
    assetCode: 'assetCode',
    assetId: null,
    assetName: 'asset',
    assignedDate: '2024-12-22T13:32:33.076Z',
    assignedToId: 1,
    assignedToUsername: 'username',
    note: 'Note',
  },
  {
    assetCode: 'assetCode',
    assetId: 1,
    assetName: 'asset',
    assignedDate: '2024-12-22T13:32:33.076Z',
    assignedToId: null,
    assignedToUsername: 'username',
    note: 'Note',
  },
  {
    assetCode: 'assetCode',
    assetId: undefined,
    assetName: 'asset',
    assignedDate: '2024-12-22T13:32:33.076Z',
    assignedToId: 1,
    assignedToUsername: 'username',
    note: 'Note',
  },
  {
    assetCode: 'assetCode',
    assetId: 1,
    assetName: 'asset',
    assignedDate: '2024-12-22T13:32:33.076Z',
    assignedToId: undefined,
    assignedToUsername: 'username',
    note: 'Note',
  },
  {
    assetCode: 'assetCode',
    assetId: null,
    assetName: 'asset',
    assignedDate: 'not correct date',
    assignedToId: null,
    assignedToUsername: 'username',
    note: 'Note',
  },
  {
    assetCode: 'assetCode',
    assetId: null,
    assetName: 'asset',
    assignedDate: '2024-12-22T13:32:33.076Z',
    assignedToId: null,
    assignedToUsername: 'username',
    note: 'Note',
  },
];

export const findAssignmentOutputMock: FindAssignmentsOutput[] = [
  {
    limit: 10,
    page: 1,
    total: 10,
    totalPages: 1,
    assignments: assignmentDataMock,
  },
  {
    limit: null,
    page: 1,
    total: 10,
    totalPages: Infinity,
    assignments: assignmentDataMock,
  },
  {
    limit: 10,
    page: null,
    total: 10,
    totalPages: 1,
    assignments: assignmentDataMock,
  },
];

export const findAssignmentInputMock: FindAssignmentsInput[] = [
  {
    limit: 10,
    page: 1,
    query: 'assignment',
    sort: 'assetName',
    sortOrder: 'asc',
    state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
    assignedDate: '2024-12-22T13:32:33.076Z',
  },
  {
    limit: 10,
    page: 1,
    query: 'assignment',
    sort: 'assetName',
    sortOrder: 'asc',
    state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
    assignedDate: 'invalidDate',
  },
  {
    limit: undefined,
    page: 1,
    query: 'assignment',
    sort: 'assetName',
    sortOrder: 'asc',
    state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
    assignedDate: '2024-12-22T13:32:33.076Z',
  },
  {
    limit: 10,
    page: undefined,
    query: 'assignment',
    sort: 'assetName',
    sortOrder: 'asc',
    state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
    assignedDate: '2024-12-22T13:32:33.076Z',
  },
  {
    limit: 10,
    page: 1,
    query: undefined,
    sort: 'assetName',
    sortOrder: 'asc',
    state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
    assignedDate: '2024-12-22T13:32:33.076Z',
  },
  {
    limit: 10,
    page: 1,
    query: 'assignment',
    sort: undefined,
    sortOrder: 'asc',
    state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
    assignedDate: '2024-12-22T13:32:33.076Z',
  },
  {
    limit: 10,
    page: 1,
    query: 'assignment',
    sort: 'assetName',
    sortOrder: undefined,
    state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
    assignedDate: '2024-12-22T13:32:33.076Z',
  },
  {
    limit: 10,
    page: 1,
    query: 'assignment',
    sort: 'assetName',
    sortOrder: 'asc',
    state: undefined,
    assignedDate: '2024-12-22T13:32:33.076Z',
  },
  {
    limit: 10,
    page: 1,
    query: 'assignment',
    sort: 'assetName',
    sortOrder: 'asc',
    state: ASSIGNMENT_STATE.WAITING_FOR_ACCEPTANCE,
    assignedDate: undefined,
  },
];
