import { Injectable } from '@nestjs/common';
import { CreateAssignmentInput } from './dto/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';

@Injectable()
export class AssignmentsService {
  create(createAssignmentInput: CreateAssignmentInput) {
    return createAssignmentInput;
  }

  findAll() {
    return `This action returns all assignments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assignment`;
  }

  update(id: number, updateAssignmentInput: UpdateAssignmentInput) {
    return `This action updates a #${id} assignment: ${updateAssignmentInput}`;
  }

  remove(id: number) {
    return `This action removes a #${id} assignment`;
  }
}
