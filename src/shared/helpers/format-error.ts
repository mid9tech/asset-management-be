export function FormatError(error) {
  const originalError = error.extensions?.originalError;

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
