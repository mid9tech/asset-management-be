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
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('auth')
export class AuthController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly testing: boolean;

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

  @Post('/login')
  public async login(
    @Res() res: Response,
    @Body() loginInput: LoginInput,
  ): Promise<void> {
    const result = await this.authService.login(singInDto, origin);
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }
  @UseGuards(JwtAuthGuard)
  @Post('/refresh-access')
  public async refreshAccess(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);

    const result = await this.authService.refreshTokenAccess(
      token,
      req.headers.origin,
    );
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const message = await this.authService.logout(token);
    res.clearCookie(this.cookieName, { path: '/' });
    res.clearCookie('access-token', { path: '/' });
    res.status(HttpStatus.OK).json(message);
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
