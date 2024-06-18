import { Request as ExpressRequest } from 'express';

declare module 'express-serve-static-core' {
  interface Request extends ExpressRequest {
    user?: string;
  }
}
