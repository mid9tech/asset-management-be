import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './domains/users/users.module';
import { AssetsModule } from './domains/assets/assets.module';
import { AssignmentsModule } from './domains/assignments/assignments.module';
import { RequestReturnsModule } from './domains/request-returns/request-returns.module';
import { FormatError } from './shared/helpers';
import { PrismaModule } from './services/prisma/prisma.module';
import { AuthModule } from './domains/auth/auth.module';
import { CategoriesModule } from './domains/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      formatError(error) {
        return FormatError(error);
      },
    }),
    PrismaModule,
    UsersModule,
    AssetsModule,
    AssignmentsModule,
    RequestReturnsModule,
    AuthModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
