import { GRAPHQL_CODE_ERROR } from '../constants';
import { MyCustomException } from './custom.exception';

export class MyInternalException extends MyCustomException {
  constructor(message: string) {
    super(message, GRAPHQL_CODE_ERROR.INTERNAL_SERVER_ERROR);
  }
}
