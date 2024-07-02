import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { FindUsersInput } from './dto/find-users.input';
import { UseGuards } from '@nestjs/common';
import { USER_TYPE } from '@prisma/client';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CurrentUser, JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';
import { RoleGuard } from 'src/common/guard/role.guard';
import { CurrentUserInterface } from 'src/shared/generics';
import { returningFindUsersOutput, returningUser } from './returns';
import { returningBoolean, returningInt } from 'src/shared/constants';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningUser)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.usersService.create(createUserInput, userReq.location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(returningFindUsersOutput, { name: 'findUsers' })
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
  @Query(returningUser, { name: 'user' })
  findOne(
    @Args('id', { type: returningInt }) id: number,
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
  @Mutation(returningUser)
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @Args('id') id: number,
  ) {
    return this.usersService.update(id, updateUserInput);
  }

  @Mutation(returningBoolean)
  disableUser(@Args('id', { type: returningInt }) id: number) {
    return this.usersService.disableUser(id);
  }
}
