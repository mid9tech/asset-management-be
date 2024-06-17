import { Test, TestingModule } from '@nestjs/testing';
import { RequestReturnsResolver } from './request-returns.resolver';
import { RequestReturnsService } from './request-returns.service';

describe('RequestReturnsResolver', () => {
  let resolver: RequestReturnsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestReturnsResolver, RequestReturnsService],
    }).compile();

    resolver = module.get<RequestReturnsResolver>(RequestReturnsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
