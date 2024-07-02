import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import {
  returningCategories,
  returningCategory,
  returningReport,
} from './returns';
import { ReportInput } from './dto/report.input';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_TYPE } from 'src/shared/enums';
import { UseGuards } from '@nestjs/common';
import { JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';
import { RoleGuard } from 'src/common/guard/role.guard';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Mutation(returningCategory)
  createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoriesService.create(createCategoryInput);
  }

  @Query(returningCategories, { name: 'getCategories' })
  getAll() {
    return this.categoriesService.getAll();
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(returningReport, { name: 'getReport' })
  getReport(@Args('reportInput') reportInput: ReportInput) {
    return this.categoriesService.getReport(reportInput);
  }
}
