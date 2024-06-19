// jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtPayload } from 'src/shared/interfaces/index';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_ACCESS_TOKEN_KEY'),
    });
  }

  async validate(payload: JwtPayload) {
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
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_ACCESS_REFRESH_KEY'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUserByPayload(payload);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    user.role = payload.role;

    return user;
  }
}
