import { MyBadRequestException } from 'src/shared/exceptions';
import {
  assignmentDataMock,
  findAssignmentOutputMock,
} from 'src/shared/__mocks__';
import { CurrentUserInterface } from 'src/shared/generics';
import { Prisma } from '@prisma/client';
import { CreateAssignmentInput } from '../dto/create-assignment.input';
import { FindAssignmentsInput } from '../dto/find-assignment.input';

export default class AssignmentsServiceMock {
  create = jest
    .fn()
    .mockImplementation(
      async (
        createAssignmentInput: CreateAssignmentInput,
        userReq: CurrentUserInterface,
      ) => {
        try {
          // if asset is already assigned for any user
          const isAssetIsAssigned =
            createAssignmentInput.assetId === 1 && userReq ? true : false;

          if (createAssignmentInput.assetId && isAssetIsAssigned) {
            throw new MyBadRequestException(
              'Asset is already assigned for another user',
            );
          }

          // if user is already assigned
          const isUserAlreadyAssigned =
            createAssignmentInput.assignedToId === 1 && userReq ? true : false;

          if (createAssignmentInput.assignedToId && isUserAlreadyAssigned) {
            throw new MyBadRequestException('User is already assigned');
          }

          if (isNaN(Date.parse(createAssignmentInput.assignedDate))) {
            throw new MyBadRequestException('assigned date is invalid');
          }

          return assignmentDataMock[0];
        } catch (error) {
          throw error;
        }
      },
    );

  findAll = jest
    .fn()
    .mockImplementation(
      (input: FindAssignmentsInput, reqUser: CurrentUserInterface) => {
        const { query, state, assignedDate } = input;

        const where: Prisma.AssignmentWhereInput = {};

        if (state && state.length > 0) {
          where.state = { in: state };
        }

        if (query) {
          const trimmedQuery = query.trim();
          const words = trimmedQuery
            .split(' ')
            .filter((word) => word.length > 0);

          where.OR = [
            { assetName: { contains: query, mode: 'insensitive' } },
            { assetCode: { contains: query, mode: 'insensitive' } },
            { assignedToUsername: { contains: query, mode: 'insensitive' } },
          ];

          if (words.length > 1) {
            where.OR.push({
              AND: words.map((word) => ({
                OR: [{ assetName: { contains: word, mode: 'insensitive' } }],
              })),
            });
          }
        }

        if (assignedDate) {
          if (isNaN(Date.parse(assignedDate))) {
            throw new MyBadRequestException('assigned date is invalid');
          } else {
            where.assignedDate = new Date(assignedDate).toISOString();
          }
        }

        if (reqUser) {
          where.location = reqUser.location; // Map to Prisma enum
        }

        return findAssignmentOutputMock[0];
      },
    );

  findOne = jest.fn().mockImplementation((id: number) => {
    return id === 1 ? assignmentDataMock[0] : null;
  });
}
