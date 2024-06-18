import { GRAPHQL_CODE_ERROR } from '../constants';
import { MyCustomException } from './custom.exception';

export class MyUnAuthorizedException extends MyCustomException {
  constructor(message: string) {
    super(message, GRAPHQL_CODE_ERROR.UNAUTHORIZED_ERROR);
  }
}
