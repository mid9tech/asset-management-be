import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from 'src/shared/interfaces';
import { LoginInput } from './dto/login-input.dto';
import { AuthResponse } from './entities/auth-response.entity';
import { IsCorrectPW } from 'src/shared/helpers';
import { USER_TYPE } from '@prisma/client';
import { JWT_CONST } from 'src/shared/constants';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async validateUserByPayload(payload: JwtPayload): Promise<any> {
    // return await this.usersService.findOneById(payload.userId);
  }

  async validateUserByJwtRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<any> {
    const token = await this.usersService.findRefreshToken(
      refreshToken,
      userId,
    );

    if (!token) {
      throw new UnauthorizedException(
        'Wrong refresh token, please login again.',
      );
    }
    return;
  }

  async generateJwtToken(
    payload: JwtPayload,
    expiresIn: number,
    secret: string,
  ): Promise<string> {
    const options: JwtSignOptions = {
      expiresIn,
      secret,
    };
    return this.jwtService.sign(payload, options);
  }

  // async register(registerInput: RegisterInput): Promise<boolean> {
  //   try {
  //     const salt = await GenSalt();
  //     registerInput.password = await HashPW(registerInput.password, salt);
  //     const user = await this.userRepository.create(registerInput, salt);
  //     await this.otpService.generateSecret(user.id);

  //     this.mailerService
  //       .sendMail(NewThankyouForRegisterEmailOption(user.email, user.firstName))
  //       .catch((err) => console.log(err));

  //     return true;
  //   } catch (error) {
  //     if (error.code === 'P2002' && error.meta.target.includes('email')) {
  //       throw new MyBadRequestException('Email already exists');
  //     }
  //     throw error;
  //   }
  // }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.usersService.findOneByUsername(loginInput.username);

    if (!user) {
      throw new UnauthorizedException('Username or password is incorrect!');
    }
    if (!(await IsCorrectPW(user.password, loginInput.password))) {
      throw new UnauthorizedException('Username or password is incorrect!');
    }

    const payload: JwtPayload = { userId: user.id, role: USER_TYPE.USER };

    let refreshToken = null;

    await this.usersService.createNewRefreshToken(
      refreshToken,
      user.id,
      JWT_CONST.REFRESH_EXPIRED(),
    );

    return {
      accessToken: await this.generateJwtToken(
        payload,
        JWT_CONST.ACCESS_EXPIRED_GENERATION,
        JWT_CONST.ACCESS_SECRET,
      ),
      refreshToken,
      expired_accessToken: JWT_CONST.ACCESS_EXPIRED(),
      expired_refreshToken: JWT_CONST.REFRESH_EXPIRED(),
    };
  }

  async logout(userId: string, refreshToken: string) {
    return (await this.usersService.deleteRefreshToken(userId, refreshToken))
      ? true
      : false;
  }

  async refreshAccessToken(userId: number, role: string) {
    const payload: JwtPayload = { userId, role };
    const accessToken = await this.generateJwtToken(
      payload,
      JWT_CONST.ACCESS_EXPIRED_GENERATION,
      JWT_CONST.ACCESS_SECRET,
    );

    return {
      accessToken,
      expired_accessToken: JWT_CONST.ACCESS_EXPIRED(),
    };
  }

  async verifyToken(token: string, type: string) {
    return this.jwtService.verify(token, {
      secret:
        type === 'access' ? JWT_CONST.ACCESS_SECRET : JWT_CONST.REFRESH_SECRET,
    });
  }
}
