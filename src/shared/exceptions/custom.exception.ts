import { GraphQLError } from 'graphql';
import { GRAPHQL_CODE_ERROR } from '../constants';

export class MyCustomException extends GraphQLError {
  constructor(
    message: string,
    private readonly code: string = GRAPHQL_CODE_ERROR.BAD_REQUEST,
  ) {
    super(message, {
      extensions: {
        code: code,
      },
    });
  }
}
