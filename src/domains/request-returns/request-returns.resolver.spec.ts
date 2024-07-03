import { Test, TestingModule } from '@nestjs/testing';
import { RequestReturnsResolver } from './request-returns.resolver';
import { RequestReturnsService } from './request-returns.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import PrismaServiceMock from 'src/services/prisma/__mocks__/mock-prisma.service';
import { AssetsService } from '../assets/assets.service';
import mockAssetsService from '../assets/__mocks__/mock-assets.service';
import { AssignmentsService } from '../assignments/assignments.service';
import mockUsersService from '../users/__mocks__/mock-users.service';
import { UsersService } from '../users/users.service';

describe('RequestReturnsResolver', () => {
  let resolver: RequestReturnsResolver;
  // let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestReturnsResolver,
        RequestReturnsService,
        { provide: AssetsService, useValue: mockAssetsService }, // Mocked AssetsService
        { provide: AssignmentsService, useValue: mockAssetsService }, // Mocked AssignmentsService
        { provide: UsersService, useValue: mockUsersService }, // Mocked UsersService
        { provide: PrismaService, useClass: PrismaServiceMock }, // Already mocked PrismaService
      ],
    }).compile();

    resolver = module.get<RequestReturnsResolver>(RequestReturnsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
