import { Test, TestingModule } from '@nestjs/testing';
import { RequestReturnsService } from './request-returns.service';

describe('RequestReturnsService', () => {
  let service: RequestReturnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestReturnsService],
    }).compile();

    service = module.get<RequestReturnsService>(RequestReturnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
