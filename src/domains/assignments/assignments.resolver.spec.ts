import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsResolver } from './assignments.resolver';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsResolver', () => {
  let resolver: AssignmentsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentsResolver, AssignmentsService],
    }).compile();

    resolver = module.get<AssignmentsResolver>(AssignmentsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
