import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsResolver } from './assignments.resolver';

@Module({
  providers: [AssignmentsResolver, AssignmentsService],
})
export class AssignmentsModule {}
