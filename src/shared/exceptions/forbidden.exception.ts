import { GRAPHQL_CODE_ERROR } from '../constants';
import { MyCustomException } from './custom.exception';

export class MyForbiddenException extends MyCustomException {
  constructor(message: string) {
    super(message, GRAPHQL_CODE_ERROR.FORBIDDEN_ERROR);
  }
}
