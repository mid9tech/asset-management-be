import { ForbiddenError } from '@nestjs/apollo';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GaphAuth implements CanActivate {
  // constructor(
  //   private configService: ConfigService,
  //   private jwtService: JwtService
  // ) { }
  matchRoles(roles: string[], userRole: string) {
    return roles.some((role) => role === userRole);
  }

  canActivate(context: ExecutionContext): boolean {
    try {
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
      }
      const token = authHeader.split(' ')[1];
      console.log(token);
      // ctx.getContext().user = {sub, email}
      return true;
    } catch (error) {
      throw new ForbiddenError('Unauthorized');
    }
  }
}
