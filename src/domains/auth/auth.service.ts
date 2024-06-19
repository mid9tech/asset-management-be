import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { IJwtPayload } from '../../shared/interfaces';
import { LoginInput } from './dto/login-input.dto';
import { IsCorrectPW } from '../../shared/helpers';
import { JWT_CONST } from '../../shared/constants';
import { AuthResponseDto } from './dto/auth-response.dto';
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

    const user = await this.usersService.findOneById(userId);
    return user;
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

  async login(loginInput: LoginInput): Promise<AuthResponseDto> {
    const user = await this.usersService.findOneByUsername(loginInput.username);

    if (!user) {
      throw new BadRequestException('Username or password is incorrect!');
    }
    if (!(await IsCorrectPW(user.password, loginInput.password))) {
      throw new BadRequestException('Username or password is incorrect!');
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
      isActived: user.state,
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

  async logout(userId: number) {
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

  async changePassword(user: any, oldPassword: string, newPassword: string) {
    const { id } = user;
    const { password } = await this.usersService.findOneById(id);
    const isCorrect = await IsCorrectPW(password, oldPassword);
    if (!isCorrect) {
      throw new BadRequestException('Old password is incorrect!');
    }

    if (newPassword === oldPassword) {
      throw new BadRequestException('New password must be different!');
    }

    const result = await this.usersService.updatePassword(id, newPassword);
    const mappedUser = {
      id: result.id,
      username: result.username,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.type,
      isActived: result.state,
    };
    return mappedUser;
  }
  async changePasswordFirstTime(user: any, newPassword: string) {
    const { id } = user;
    const { state: isActived } = await this.usersService.findOneById(id);
    if (isActived) {
      throw new BadRequestException(
        'This user already changed password first time!',
      );
    }
    const { password } = await this.usersService.findOneById(id);

    const isOldPassword = await IsCorrectPW(password, newPassword);
    if (isOldPassword) {
      throw new BadRequestException('New password must be different!');
    }

    await this.usersService.updatePassword(id, newPassword);
    const result = await this.usersService.updateState(id, true);

    const mappedUser = {
      id: result.id,
      username: result.username,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.type,
      isActived: result.state,
    };
    return mappedUser;
  }
}
