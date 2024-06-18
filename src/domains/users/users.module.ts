import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UsersRepository } from './users.repository';

@Module({
  providers: [UsersResolver, UsersService, UsersRepository],
})
export class UsersModule {}
