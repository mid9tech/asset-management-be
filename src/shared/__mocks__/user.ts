import {
  FindUsersInput,
  FindUsersOutput,
} from 'src/domains/users/dto/find-users.input';
import { GENDER, LOCATION, USER_STATUS, USER_TYPE } from '../enums';
import { CurrentUserInterface } from '../generics';
import { User } from 'src/domains/users/entities/user.entity';
import * as MyPrisma from '@prisma/client';

// Adjust based on your Prisma schema
export const userDataMock: User[] = [
  {
    id: 1,
    firstName: 'Hai',
    lastName: 'Nguyen Van',
    username: 'hainv',
    password: 'password',
    staffCode: 'SD0001',
    gender: GENDER.MALE,
    salt: 'somesalt',
    refreshToken: 'some-refresh-token',
    joinedDate: '2000-12-22T13:32:33.076Z',
    type: USER_TYPE.USER,
    dateOfBirth: '2000-12-22T13:32:33.076Z',
    state: true,
    location: LOCATION.HCM,
  },
  {
    id: 2,
    firstName: 'Hai',
    lastName: 'Nguyen Van',
    username: 'hainv',
    password: 'password',
    staffCode: 'SD0001',
    gender: GENDER.MALE,
    salt: 'somesalt',
    refreshToken: 'some-refresh-token',
    joinedDate: '2000-12-22T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2000-12-22T13:32:33.076Z',
    state: true,
    location: LOCATION.HCM,
  },
];

export const userInputMock = [
  {
    firstName: 'Hai',
    lastName: 'Nguyen Van',
    joinedDate: '2022-12-22T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2000-12-22T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  {
    firstName: 'Hai',
    lastName: 'Nguyen Van',
    joinedDate: '2000-12-22T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: 'invalid',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  {
    firstName: 'Hai',
    lastName: 'Nguyen Van',
    joinedDate: 'invalid',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2000-12-22T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  {
    firstName: '',
    lastName: 'Nguyen Van',
    joinedDate: '2000-12-22T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2000-12-22T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  {
    firstName: 'Hai',
    lastName: '',
    joinedDate: '2000-12-22T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2000-12-22T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  // Invalid User (Age at join date < 18 years)
  {
    firstName: 'Hai',
    lastName: 'Nguyen Van',
    joinedDate: '2015-01-01T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2000-12-22T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  // Invalid User (Age at current date < 18 years)
  {
    firstName: 'Hai',
    lastName: 'Nguyen Van',
    joinedDate: '2023-01-01T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2012-01-01T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  // Valid User (Age at join date and current date >= 18 years)
  {
    firstName: 'John',
    lastName: 'Doe',
    joinedDate: '2020-01-01T13:32:33.076Z',
    type: USER_TYPE.USER,
    dateOfBirth: '2000-01-01T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  // Valid User (Edge case: turns 18 today, join date is today)
  {
    firstName: 'Bob',
    lastName: 'Williams',
    joinedDate: '2024-06-19T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2006-06-19T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  // Invalid User (Age at join date < 18 years, age at current date >= 18 years)
  {
    firstName: 'Charlie',
    lastName: 'Brown',
    joinedDate: '2018-01-01T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2003-01-01T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  // Valid User (Age at join date and current date >= 18 years)
  {
    firstName: 'David',
    lastName: 'Miller',
    joinedDate: '2022-01-01T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2003-01-01T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  // Invalid User (Both age at join date and current date < 18 years)
  {
    firstName: 'Eve',
    lastName: 'Taylor',
    joinedDate: '2022-01-01T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
    dateOfBirth: '2005-01-01T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.FEMALE,
  },
];

export const findUserInputMock: FindUsersInput[] = [
  {
    limit: 10,
    page: 1,
    query: 'name',
    sort: 'username',
    sortOrder: 'desc',
    type: [USER_TYPE.USER],
  },
  {
    limit: undefined,
    page: 1,
    query: 'name query',
    sort: 'username',
    sortOrder: 'desc',
    type: [USER_TYPE.USER],
  },
  {
    limit: 10,
    page: undefined,
    query: 'name',
    sort: 'username',
    sortOrder: 'desc',
    type: [USER_TYPE.USER],
  },
  {
    limit: 10,
    page: 1,
    query: undefined,
    sort: 'username',
    sortOrder: 'desc',
    type: [USER_TYPE.USER],
  },
  {
    limit: 10,
    page: 1,
    query: 'name',
    sort: undefined,
    sortOrder: 'desc',
    type: [USER_TYPE.USER],
  },
  {
    limit: 10,
    page: 1,
    query: 'name',
    sort: 'username',
    sortOrder: undefined,
    type: [USER_TYPE.USER],
  },
  {
    limit: 10,
    page: 1,
    query: 'name',
    sort: 'username',
    sortOrder: 'desc',
    type: undefined,
  },
  {
    limit: null,
    page: 1,
    query: 'name',
    sort: 'username',
    sortOrder: 'desc',
    type: [USER_TYPE.USER],
  },
  {
    limit: 10,
    page: null,
    query: 'name',
    sort: 'username',
    sortOrder: 'desc',
    type: [USER_TYPE.USER],
  },
  {
    limit: 10,
    page: 1,
    query: null,
    sort: 'username',
    sortOrder: 'desc',
    type: [USER_TYPE.USER],
  },
];

export const findUserOutputMock: FindUsersOutput[] = [
  {
    limit: 10,
    page: 1,
    total: 10,
    totalPages: 1,
    users: userDataMock,
  },
  {
    limit: null,
    page: 1,
    total: 10,
    totalPages: Infinity,
    users: userDataMock,
  },
  {
    limit: 10,
    page: null,
    total: 10,
    totalPages: 1,
    users: userDataMock,
  },
];

export const currentUserMock: CurrentUserInterface = {
  firstName: 'Taylor',
  id: 1,
  joinedDate: '2000-12-22T13:32:33.076Z',
  lastName: 'Swift',
  location: LOCATION.HCM,
  staffCode: 'taylors',
  state: USER_STATUS.ACTIVE,
  type: USER_TYPE.ADMIN,
  username: 'taylors',
};

export const userDataPrismaMock: MyPrisma.User = {
  ...userDataMock[1],
  createdAt: new Date(),
  updatedAt: new Date(),
  salt: '1111',
  isAssigned: false,
  isDisabled: false,
  refreshToken: '111111',
  gender: GENDER.FEMALE,
  joinedDate: new Date(),
  dateOfBirth: new Date(),
};
