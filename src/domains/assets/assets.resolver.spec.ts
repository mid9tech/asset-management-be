import { Test, TestingModule } from '@nestjs/testing';
import { AssetsResolver } from './assets.resolver';
import { AssetsService } from './assets.service';

describe('AssetsResolver', () => {
  let resolver: AssetsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetsResolver, AssetsService],
    }).compile();

    resolver = module.get<AssetsResolver>(AssetsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
