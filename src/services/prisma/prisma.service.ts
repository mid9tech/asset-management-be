import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    const prisma = new PrismaClient();
    await this.$connect();

    prisma.$use(async (params, next) => {
      if (params.model === 'User' && params.action === 'create') {
        // Auto-generate staff code
        if (!params.args.data.staffCode) {
          const lastUser = await prisma.user.findFirst({
            orderBy: { id: 'desc' },
          });
          const lastId = lastUser ? parseInt(lastUser.staffCode.slice(2)) : 0;
          const newId = lastId + 1;
          const newStaffCode = `SD${newId.toString().padStart(4, '0')}`;
          params.args.data.staffCode = newStaffCode;
        }

        // Auto-generate username
        if (!params.args.data.username) {
          const { firstName, lastName } = params.args.data;
          const usernameBase =
            firstName.toLowerCase().replace(/\s+/g, '') +
            lastName.toLowerCase().replace(/\s+/g, '');
          let username = usernameBase;
          let counter = 1;
          while (await prisma.user.findFirst({ where: { username } })) {
            username = usernameBase + counter;
            counter++;
          }
          params.args.data.username = username;
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
