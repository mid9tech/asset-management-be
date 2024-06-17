import { Module } from '@nestjs/common';
import { RequestReturnsService } from './request-returns.service';
import { RequestReturnsResolver } from './request-returns.resolver';

@Module({
  providers: [RequestReturnsResolver, RequestReturnsService],
})
export class RequestReturnsModule {}
