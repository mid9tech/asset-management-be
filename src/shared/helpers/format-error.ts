import { GRAPHQL_CODE_ERROR } from '../constants';

function parseErrorMessage(errorMessage: string): string {
  const regex =
    /Field "(\w+)\.(\w+)" of required type "(\w+!)" was not provided\./;
  const match = errorMessage.match(regex);

  if (match && match[2]) {
    return `${match[2]} is missing`;
  }

  return errorMessage;
}

export function FormatError(error) {
  const originalError = error.extensions?.originalError;

  if (error.extensions?.code === GRAPHQL_CODE_ERROR.GRAPHQL_VALIDATION_FAILED) {
    error.message = parseErrorMessage(error.message);
  }

  if (!originalError) {
    return {
      message: error.message,
      code: error.extensions?.code,
    };
  }

  return {
    message: originalError.message,
    code: error.extensions?.code,
  };
}
