import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsResolver } from './assets.resolver';
import { PrismaModule } from 'src/services/prisma/prisma.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [PrismaModule, CategoriesModule],
  providers: [AssetsResolver, AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
