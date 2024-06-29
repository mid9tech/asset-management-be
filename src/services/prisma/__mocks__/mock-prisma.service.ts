import {
  assetDataMock,
  assignmentDataMock,
  userDataMock,
} from 'src/shared/__mocks__';

export default class PrismaServiceMock {
  user = {
    create: jest.fn().mockReturnValue(userDataMock),
    update: jest.fn().mockReturnValue(userDataMock),
    findFirst: jest.fn().mockReturnValue(userDataMock),
    findMany: jest.fn().mockReturnValue(userDataMock),
    delete: jest.fn().mockReturnValue(userDataMock),
    count: jest.fn().mockReturnValue(10),
  };
  assignment = {
    create: jest.fn().mockReturnValue(assignmentDataMock[0]),
    update: jest.fn().mockReturnValue(assignmentDataMock),
    findFirst: jest.fn().mockImplementation(() => assignmentDataMock[0]),
    findMany: jest.fn().mockReturnValue(assignmentDataMock),
    delete: jest.fn().mockReturnValue(assignmentDataMock),
    count: jest.fn().mockReturnValue(10),
  };
  asset = {
    create: jest.fn().mockReturnValue(assetDataMock),
    update: jest.fn().mockReturnValue(assetDataMock),
    findFirst: jest.fn().mockReturnValue(assetDataMock[0]),
    findMany: jest.fn().mockReturnValue(assetDataMock),
    delete: jest.fn().mockReturnValue(assetDataMock),
    count: jest.fn().mockReturnValue(10),
  };
}
