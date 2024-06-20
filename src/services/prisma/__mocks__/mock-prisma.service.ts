import { userDataMock } from '../../../shared/__mocks__';

export default class PrismaServiceMock {
  user = {
    create: jest.fn().mockReturnValue(userDataMock),
    update: jest.fn().mockReturnValue(userDataMock),
    findFirst: jest.fn().mockReturnValue(userDataMock),
    findMany: jest.fn().mockReturnValue(userDataMock),
    delete: jest.fn().mockReturnValue(userDataMock),
  };
}
