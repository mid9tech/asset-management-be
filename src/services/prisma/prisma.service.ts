import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  GenSalt,
  generatePassword,
  generateStaffCode,
  generateUsername,
} from '../../shared/helpers';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    this.$use(async (params, next) => {
      if (params.model === 'User' && params.action === 'create') {
        // Auto-generate staff code

        if (!params.args.data.staffCode) {
          params.args.data.staffCode = await generateStaffCode(this);
        }

        // Auto-generate username
        if (!params.args.data.username) {
          params.args.data.username = await generateUsername(params, this);
        }

        // Auto-generate salt
        if (!params.args.data.salt) {
          params.args.data.salt = await GenSalt();
        }

        // Auto-generate password based on username and date of birth
        if (!params.args.data.password) {
          params.args.data.password = await generatePassword(params);
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
