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
import { UpdateAssignmentInput } from './dto/update-assignment.input';
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

@Resolver(() => Assignment)
export class AssignmentsResolver {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly usersService: UsersService,
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
  findAll(
    @Args('findAssignmentsInput') findAssignmentsInput: FindAssignmentsInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assignmentsService.findAll(findAssignmentsInput, userReq);
  }

  @ResolveField((returns) => User, { name: 'assigner' })
  getAssigner(@Parent() assignment: Assignment) {
    return this.usersService.findOne(assignment.assignedById);
  }

  @ResolveField((returns) => User, { name: 'assignee' })
  getAssignee(@Parent() assignment: Assignment) {
    return this.usersService.findOne(assignment.assignedToId);
  }

  @Query(() => Assignment, { name: 'assignment' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.assignmentsService.findOne(id);
  }

  @Mutation(() => Assignment)
  updateAssignment(
    @Args('updateAssignmentInput') updateAssignmentInput: UpdateAssignmentInput,
  ) {
    return this.assignmentsService.update(
      updateAssignmentInput.id,
      updateAssignmentInput,
    );
  }

  @Mutation(() => Assignment)
  removeAssignment(@Args('id', { type: () => Int }) id: number) {
    return this.assignmentsService.remove(id);
  }
}
