import { Injectable } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';

import { PrismaService } from 'src/services/prisma/prisma.service';
import {
  MyBadRequestException,
  MyEntityNotFoundException,
  MyInternalException,
} from 'src/shared/exceptions';
import { ENTITY_NAME } from 'src/shared/constants';
import { ReportInput } from './dto/report.input';
import { Prisma } from '@prisma/client';

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
    const category = await this.prismaService.category.findMany({
      where: {
        categoryName: {
          equals: categoryName,

          mode: 'insensitive',
        },
      },
    });
    return category.length > 0;
  }

  async getPrefixById(id: number): Promise<string> {
    const category = await this.prismaService.category.findUnique({
      where: {
        id: id,
      },
    });

    if (!category) {
      throw new MyEntityNotFoundException(ENTITY_NAME.CATEGORY);
    }

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

  async getReport(reportInput: ReportInput) {
    const { limit, page, sort, sortOrder } = reportInput;

    const offset = page && limit ? (page - 1) * limit : 0;

    try {
      const totalItems = await this.prismaService.$queryRaw<
        { count: number }[]
      >`SELECT COUNT(*)::INTEGER as count FROM asset_report`;

      const queryString =
        limit && page
          ? Prisma.sql`SELECT * FROM asset_report
          ORDER BY ${Prisma.raw(sort)} ${Prisma.raw(sortOrder)}
          LIMIT ${Prisma.raw(limit.toString())}
          OFFSET ${Prisma.raw(offset.toString())}`
          : Prisma.sql`SELECT * FROM asset_report`;

      const reportData = await this.prismaService.$queryRaw<any[]>(queryString);

      return {
        total: totalItems[0].count,
        totalPages: Math.ceil(totalItems[0].count / limit) || 0,
        page: page || 0,
        limit: limit || 0,
        data: reportData,
      };
    } catch (error) {
      console.log(error);

      throw new MyInternalException(
        'An error occurred while fetching the report data.',
      );
    }
  }
}
