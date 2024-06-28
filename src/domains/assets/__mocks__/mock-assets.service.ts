import { assetDataMock } from 'src/shared/__mocks__';

export default class AssetsServiceMock {
  findOne = jest.fn().mockImplementation((id: number) => {
    return id === 1 ? assetDataMock[0] : null;
  });
}
