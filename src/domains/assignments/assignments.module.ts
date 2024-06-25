import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsResolver } from './assignments.resolver';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [AssignmentsResolver, AssignmentsService],
  imports: [UsersModule],
})
export class AssignmentsModule {}
