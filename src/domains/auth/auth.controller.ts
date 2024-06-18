import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  Res,
  HttpStatus,
  Req,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Request, Response } from 'express-serve-static-core';
import { LoginInput } from './dto/login-input.dto';
import { RoleGuard } from 'src/common/guard/role.guard';

import { Roles } from 'src/common/decorator/roles.decorator';
import { CurrentUser, JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';
import { USER_TYPE } from '@prisma/client';

@Controller('api/auth')
export class AuthController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;

  constructor(private readonly authService: AuthService) {
    this.cookieName = 'refresh-token';
    this.refreshTime = 604800;
  }

  private refreshTokenFromReq(req: Request): string {
    const token: string | undefined = req.signedCookies[this.cookieName];

    if (token === undefined) {
      throw new UnauthorizedException();
    }

    return token;
  }

  private saveRefreshCookie(res: Response, refreshToken: string): Response {
    return res.cookie(this.cookieName, refreshToken, {
      secure: false,
      httpOnly: true,
      signed: true,
      path: '/',
      expires: new Date(Date.now() + this.refreshTime * 1000),
    });
  }

  @Get('/test')
  @Roles(USER_TYPE.USER)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  public async findAll(): Promise<any> {
    return 'Hello World!';
  }

  @Post('/login')
  public async login(
    @Res() res: Response,
    @Body() loginInput: LoginInput,
  ): Promise<any> {
    const result = await this.authService.login(loginInput);
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('/refresh-access')
  @UseGuards(JwtAccessAuthGuard)
  public async refreshAccess(@CurrentUser() user: any) {
    const { id, token } = user;
    console.log('user', user);
    const result = await this.authService.refreshAccessToken(id, token);
    return result;
  }

  @Post('/logout')
  @UseGuards(JwtAccessAuthGuard)
  public async logout(@CurrentUser() user: any): Promise<void> {
    const { id, token } = user;
    const result = await this.authService.logout(id, token);
  }

  // @Patch('/update-password')
  // public async updatePassword(
  //   @Body() changePasswordDto: ChangePasswordDto,
  //   @Res() res: Response,
  // ): Promise<void> {
  //   const { id } = changePasswordDto;
  //   const result = await this.authService.updatePassword(
  //     id,
  //     changePasswordDto,
  //     origin,
  //   );
  //   this.saveRefreshCookie(res, result.refreshToken)
  //     .status(HttpStatus.OK)
  //     .json(AuthResponseMapper.map(result));
  // }
}
