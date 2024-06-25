import { Injectable } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';

import { PrismaService } from 'src/services/prisma/prisma.service';
import {
  MyBadRequestException,
  MyEntityNotFoundException,
} from 'src/shared/exceptions';
import { ENTITY_NAME } from 'src/shared/constants';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryInput: CreateCategoryInput) {
    // Check if the category name already exists
    if (await this.categoryNameExists(createCategoryInput.categoryName)) {
      throw new MyBadRequestException(
        'Category is already existed. Please enter a different category',
      );
    }

    // Check if the category code already exists
    if (await this.categoryCodeExists(createCategoryInput.categoryCode)) {
      throw new MyBadRequestException(
        'Prefix is already existed. Please enter a different prefix',
      );
    }
    return this.prismaService.category.create({
      data: createCategoryInput,
    });
  }

  async getAll() {
    return this.prismaService.category.findMany();
  }

  async categoryCodeExists(prefix: string): Promise<boolean> {
    try {
      const categories = await this.prismaService.category.findFirst({
        where: {
          categoryCode: prefix,
        },
      });
      return categories !== null;
    } catch (error) {
      throw new MyEntityNotFoundException(ENTITY_NAME.CATEGORY);
    }
  }

  async categoryNameExists(categoryName: string): Promise<boolean> {
    const category = await this.prismaService.category.findUnique({
      where: {
        categoryName: categoryName,
      },
    });
    return category !== null;
  }

  async getPrefixById(id: number): Promise<string> {
    const category = await this.prismaService.category.findUnique({
      where: {
        id: id,
      },
    });
    return category.categoryCode;
  }

  async findById(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id: id,
      },
    });
    if (!category) {
      throw new MyEntityNotFoundException(ENTITY_NAME.CATEGORY);
    }
    return category;
  }
}
