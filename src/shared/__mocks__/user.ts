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
    joinedDate: '2000-12-22T13:32:33.076Z',
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
];
