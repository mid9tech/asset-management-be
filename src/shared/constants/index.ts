import * as dotenv from 'dotenv';
import { ApolloServerErrorCode } from '@apollo/server/errors';

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;

export const ENTITY_NAME = {
  USER: 'User',
  ASSIGNMENT: 'Assignment',
  REQUEST_RETURN: 'Request Return',
  ASSET: 'Asset',
};

export const PORT = process.env.PORT || 8080;

export const GRAPHQL_CODE_ERROR = {
  INTERNAL_SERVER_ERROR: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
  BAD_REQUEST: ApolloServerErrorCode.BAD_REQUEST,
  UNAUTHORIZED_ERROR: 'UNAUTHORIZED_ERROR',
  DB_ERROR: 'DB_ERROR',
  FORBIDDEN_ERROR: 'FORBIDDEN_ERROR',
  NOTFOUND_ERROR: 'NOTFOUND_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  GRAPHQL_VALIDATION_FAILED: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
};
