import {
  Resolver,
  Query,
  Mutation,
  Args,
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
import { FindAssignmentsInput } from './dto/find-assignment.input';

import { UsersService } from '../users/users.service';
import { AssetsService } from '../assets/assets.service';

import {
  UpdateStatusAssignmentInput,
  UpdateAssignmentInput,
} from './dto/update-assignment.input';
import { returningAssignment, returningFindAssignmentsOutput } from './returns';
import { returningUser } from '../users/returns';
import { returningBoolean, returningInt } from 'src/shared/constants';
import { returningAsset } from '../assets/returns';

@Resolver(returningAssignment)
export class AssignmentsResolver {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly usersService: UsersService,
    private readonly assetService: AssetsService,
  ) {}

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningAssignment)
  createAssignment(
    @Args('createAssignmentInput') createAssignmentInput: CreateAssignmentInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assignmentsService.create(createAssignmentInput, userReq);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(returningFindAssignmentsOutput, { name: 'findAssignments' })
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

  @ResolveField(returningUser, { name: 'assigner' })
  getAssigner(
    @Parent() assignment: Assignment,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.usersService.findOne(assignment.assignedById, userReq.location);
  }

  @ResolveField(returningUser, { name: 'assignee' })
  getAssignee(
    @Parent() assignment: Assignment,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.usersService.findOne(assignment.assignedToId, userReq.location);
  }

  @ResolveField(returningAsset, { name: 'asset' })
  getAsset(
    @Parent() assignment: Assignment,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assetService.findOne(assignment.assetId, userReq.location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(returningAssignment, { name: 'assignment' })
  findOne(
    @Args('id', { type: returningInt }) id: number,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assignmentsService.findOne(id, userReq.location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningBoolean)
  removeAssignment(
    @Args('id', { type: returningInt }) id: number,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assignmentsService.removeAssignment(id, userReq);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningAssignment)
  updateAssignment(
    @Args('id', { type: returningInt }) id: number,
    @Args('updateAssignmentInput') updateAssignmentInput: UpdateAssignmentInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assignmentsService.update(id, updateAssignmentInput, userReq);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Query(returningFindAssignmentsOutput)
  getListOwnAssignment(
    @Args('findAssignmentsInput') findAssignmentsInput: FindAssignmentsInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assignmentsService.getListOwnAssignment(
      findAssignmentsInput,
      userReq,
    );
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningBoolean)
  updateStatusAssignment(
    @Args('updateStatusAssignmentInput')
    updateStatusAssignmentInput: UpdateStatusAssignmentInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assignmentsService.updateStatusAssignment(
      updateStatusAssignmentInput,
      userReq,
    );
  }
}
