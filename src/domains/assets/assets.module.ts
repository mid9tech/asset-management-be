import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsResolver } from './assets.resolver';

@Module({
  providers: [AssetsResolver, AssetsService],
})
export class AssetsModule {}
