import { Test, TestingModule } from '@nestjs/testing';
import { RequestReturnsResolver } from './request-returns.resolver';
import { RequestReturnsService } from './request-returns.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import PrismaServiceMock from 'src/services/prisma/__mocks__/mock-prisma.service';

describe('RequestReturnsResolver', () => {
  let resolver: RequestReturnsResolver;
  // let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestReturnsResolver,
        RequestReturnsService,
        {
          provide: PrismaService,
          useClass: PrismaServiceMock,
        },
      ],
    }).compile();

    resolver = module.get<RequestReturnsResolver>(RequestReturnsResolver);
    // prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
