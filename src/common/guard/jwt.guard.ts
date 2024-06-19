import {
  ExecutionContext,
  Injectable,
  createParamDecorator,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/domains/auth/auth.service';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard('access') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);

    return ctx.getContext().req;
  }
}

export class JwtRefreshAuthGuard extends AuthGuard('refresh') {
  constructor(private readonly authService: AuthService) {
    super();
  }
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);

    return ctx.getContext().req;
  }
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);

    const token = ctx.getContext().req.headers['authorization'].split(' ')[1];

    const user = ctx.getContext().req.user;

    user.token = token;

    return user;
  },
);
