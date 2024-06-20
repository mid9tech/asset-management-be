import { GENDER, LOCATION, USER_TYPE } from '../enums';

// Adjust based on your Prisma schema
export const userDataMock = [
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
    joinedDate: new Date('2000-12-22T13:32:33.076Z'),
    type: USER_TYPE.ADMIN,
    dateOfBirth: new Date('2000-12-22T13:32:33.076Z'),
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
    dateOfBirth: '2006-01-01T13:32:33.076Z',
    location: LOCATION.HCM,
    gender: GENDER.MALE,
  },
  // Valid User (Age at join date and current date >= 18 years)
  {
    firstName: 'John',
    lastName: 'Doe',
    joinedDate: '2020-01-01T13:32:33.076Z',
    type: USER_TYPE.ADMIN,
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
