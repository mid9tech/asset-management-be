// jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { IJwtPayload } from 'src/shared/interfaces/index';
import { JWT_CONST } from 'src/shared/constants';
import { Request } from 'express';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONST.ACCESS_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    const user = await this.authService.validateUserByPayload(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }
    user.role = payload.role;
    return user;
  }
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // extract refresh token from cookie
          const refreshToken = req.headers.cookie
            ?.split(';')
            .find((c) => c.trim().startsWith('refreshToken'))
            ?.split('=')[1];
          return refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: JWT_CONST.REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IJwtPayload) {
    // extract refresh token from cookie
    const refreshToken = req.headers.cookie
      ?.split(';')
      .find((c) => c.trim().startsWith('refreshToken'))
      ?.split('=')[1];
    //check refresh token is current refresh token of user
    const user = await this.authService.validateUserByJwtRefreshToken(
      payload.userId,
      refreshToken,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    user.role = payload.role;

    return user;
  }
}
