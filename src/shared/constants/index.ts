import * as dotenv from 'dotenv';
import { ApolloServerErrorCode } from '@apollo/server/errors';

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;

export const ENTITY_NAME = {
  USER: 'User',
  ASSIGNMENT: 'Assignment',
  REQUEST_RETURN: 'Request Return',
  ASSET: 'Asset',
  CATEGORY: 'Category',
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

export const JWT_CONST = {
  ACCESS_SECRET: process.env.SECRET_ACCESS_TOKEN_KEY,
  REFRESH_SECRET: process.env.SECRET_REFRESH_TOKEN_KEY,
  ACCESS_EXPIRED: () => {
    return 60 * 60 * 24 * 1000 + new Date().getTime();
  }, // mini seconds one hour from now (integer)
  REFRESH_EXPIRED: () => {
    return 60 * 60 * 24 * 30 * 1000 + new Date().getTime();
  }, // mini seconds one month from now
  ACCESS_EXPIRED_GENERATION: 60 * 60,
  REFRESH_EXPIRED_GENERATION: 60 * 60 * 24 * 30,
};

const domains = process.env.DOMAINS;

export const allowedOrigins = domains ? domains.split(',') : [];
