import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { FindUsersInput, FindUsersOutput } from './dto/find-users.input';
import { UseGuards } from '@nestjs/common';
import { USER_TYPE } from '@prisma/client';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CurrentUser, JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';
import { RoleGuard } from 'src/common/guard/role.guard';
import { CurrentUserInterface } from 'src/shared/generics';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(() => User)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.usersService.create(createUserInput, userReq.location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(() => FindUsersOutput, { name: 'findUsers' })
  async findUsers(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('request') request: FindUsersInput,
  ) {
    try {
      const result = await this.usersService.findAll(request, userReq);
      return result;
    } catch (error) {
      return error;
    }
  }
  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    const location = userReq.location;
    try {
      return this.usersService.findOne(id, location);
    } catch (error) {
      return error;
    }
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(() => User)
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @Args('id') id: number,
  ) {
    return this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => Boolean)
  disableUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.disableUser(id);
  }
}
