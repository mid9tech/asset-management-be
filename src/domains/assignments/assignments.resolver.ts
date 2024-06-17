import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';

@Resolver(() => Assignment)
export class AssignmentsResolver {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Mutation(() => Assignment)
  createAssignment(
    @Args('createAssignmentInput') createAssignmentInput: CreateAssignmentInput,
  ) {
    return this.assignmentsService.create(createAssignmentInput);
  }

  @Query(() => [Assignment], { name: 'assignments' })
  findAll() {
    return this.assignmentsService.findAll();
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
