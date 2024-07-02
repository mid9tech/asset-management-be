import { FindAssignmentsOutput } from '../dto/find-assignment.input';
import { Assignment } from '../entities/assignment.entity';

export const returningAssignment = () => Assignment;

export const returningFindAssignmentsOutput = () => FindAssignmentsOutput;
