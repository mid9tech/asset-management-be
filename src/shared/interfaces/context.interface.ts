import { Request, Response } from 'express-serve-static-core';

export interface IContext {
  req: Request;
  res: Response;
}
