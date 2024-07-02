import { Module } from '@nestjs/common';
import { RequestReturnsService } from './request-returns.service';
import { RequestReturnsResolver } from './request-returns.resolver';
import { AssetsModule } from '../assets/assets.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from 'src/services/prisma/prisma.module';

@Module({
  imports: [AssetsModule, AssignmentsModule, UsersModule, PrismaModule],
  providers: [RequestReturnsResolver, RequestReturnsService],
  exports: [RequestReturnsService],
})
export class RequestReturnsModule {}
