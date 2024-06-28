import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_TYPE } from 'src/shared/enums';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';
import { RoleGuard } from 'src/common/guard/role.guard';
import { CurrentUserInterface } from 'src/shared/generics';
import {
  FindAssignmentsInput,
  FindAssignmentsOutput,
} from './dto/find-assignment.input';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AssetsService } from '../assets/assets.service';
import { Asset } from '../assets/entities/asset.entity';

@Resolver(() => Assignment)
export class AssignmentsResolver {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly usersService: UsersService,
    private readonly assetService: AssetsService,
  ) {}

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(() => Assignment)
  createAssignment(
    @Args('createAssignmentInput') createAssignmentInput: CreateAssignmentInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assignmentsService.create(createAssignmentInput, userReq);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(() => FindAssignmentsOutput, { name: 'findAssignments' })
  async findAll(
    @Args('findAssignmentsInput') findAssignmentsInput: FindAssignmentsInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    const result = await this.assignmentsService.findAll(
      findAssignmentsInput,
      userReq,
    );
    return result;
  }

  @ResolveField(() => User, { name: 'assigner' })
  getAssigner(
    @Parent() assignment: Assignment,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.usersService.findOne(assignment.assignedById, userReq.location);
  }

  @ResolveField(() => User, { name: 'assignee' })
  getAssignee(
    @Parent() assignment: Assignment,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.usersService.findOne(assignment.assignedToId, userReq.location);
  }

  @ResolveField(() => Asset, { name: 'asset' })
  getAsset(
    @Parent() assignment: Assignment,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assetService.findOne(assignment.assetId, userReq.location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(() => Assignment, { name: 'assignment' })
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assignmentsService.findOne(id, userReq.location);
  }
}
