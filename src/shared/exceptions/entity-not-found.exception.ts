import { GRAPHQL_CODE_ERROR, ENTITY_NAME } from '../constants';
import { MyCustomException } from './custom.exception';

export class MyEntityNotFoundException extends MyCustomException {
  constructor(entityName: typeof ENTITY_NAME) {
    super(`${entityName} not found`, GRAPHQL_CODE_ERROR.NOT_FOUND_ERROR);
  }
}
