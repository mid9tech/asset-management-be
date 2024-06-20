import { GRAPHQL_CODE_ERROR } from '../constants';
import { MyCustomException } from './custom.exception';

export class MyEntityNotFoundException extends MyCustomException {
  constructor(entityName: string) {
    super(`${entityName} not found`, GRAPHQL_CODE_ERROR.NOT_FOUND_ERROR);
  }
}
