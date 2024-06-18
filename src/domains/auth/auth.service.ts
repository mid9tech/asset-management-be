import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { IJwtPayload } from '../../shared/interfaces';
import { LoginInput } from './dto/login-input.dto';
import { IsCorrectPW } from '../../shared/helpers';
import { JWT_CONST } from '../../shared/constants';
import { IAuthResponse } from './dto/auth-response.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async validateUserByPayload(payload: IJwtPayload): Promise<any> {
    return await this.usersService.findOneById(payload.userId);
  }

  async validateUserByJwtRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<any> {
    const token = await this.usersService.checkRefreshToken(
      userId,
      refreshToken,
    );

    if (!token) {
      throw new UnauthorizedException(
        'Wrong refresh token, please login again.',
      );
    }
    return;
  }

  async generateJwtToken(
    payload: IJwtPayload,
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

  async login(loginInput: LoginInput): Promise<IAuthResponse> {
    const user = await this.usersService.findOneByUsername(loginInput.username);

    if (!user) {
      throw new UnauthorizedException('Username or password is incorrect!');
    }
    if (!(await IsCorrectPW(user.password, loginInput.password))) {
      throw new UnauthorizedException('Username or password is incorrect!');
    }
    const payload: IJwtPayload = { userId: user.id, role: user.type };
    let refreshToken = null;

    refreshToken = await this.generateJwtToken(
      payload,
      JWT_CONST.REFRESH_EXPIRED_GENERATION,
      JWT_CONST.REFRESH_SECRET,
    );

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    const mappedUser = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.type,
    };

    return {
      accessToken: await this.generateJwtToken(
        payload,
        JWT_CONST.ACCESS_EXPIRED_GENERATION,
        JWT_CONST.ACCESS_SECRET,
      ),
      refreshToken,
      expiredAccessToken: JWT_CONST.ACCESS_EXPIRED(),
      expiredRefreshToken: JWT_CONST.REFRESH_EXPIRED(),
      user: mappedUser,
    };
  }

  async logout(userId: number, refreshToken: string) {
    return (await this.usersService.updateRefreshToken(userId, null))
      ? true
      : false;
  }

  async refreshAccessToken(userId: number, role: string) {
    const payload: IJwtPayload = { userId, role };
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
