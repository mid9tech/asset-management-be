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
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginInput } from './dto/login-input.dto';
import { RoleGuard } from '../../common/guard/role.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import {
  CurrentUser,
  JwtAccessAuthGuard,
  JwtRefreshAuthGuard,
} from '../../common/guard/jwt.guard';
import { USER_TYPE } from '@prisma/client';
import { IChangePasswordFirstTimeDto } from './dto/change-password-first-time.dto';
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/test')
  @Roles(USER_TYPE.ADMIN)
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

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
    });

    //remove refreshtoken from result
    delete result.refreshToken;
    delete result.expiredRefreshToken;

    return res.status(HttpStatus.OK).json(result);
  }

  @Post('/refresh-access')
  @UseGuards(JwtRefreshAuthGuard)
  public async refreshAccess(@CurrentUser() user: any) {
    const { id, role } = user;

    const result = await this.authService.refreshAccessToken(id, role);

    return result;
  }

  @Post('/logout')
  @UseGuards(JwtAccessAuthGuard)
  public async logout(
    @Res() res: Response,
    @CurrentUser() user: any,
  ): Promise<void> {
    const { id } = user;

    await this.authService.logout(id);

    res.clearCookie('refreshToken', { httpOnly: true });

    res.status(HttpStatus.OK).json('Logout success!');
  }

  @Post('/change-password')
  @UseGuards(JwtAccessAuthGuard)
  public async changePassword(
    @Res() res: Response,
    @CurrentUser() user: any,
    @Body() changePasswordFirstTime: IChangePasswordFirstTimeDto,
  ) {
    const { newPassword } = changePasswordFirstTime;
    const result = await this.authService.changePasswordFirstTime(
      user,
      newPassword,
    );

    res.status(HttpStatus.OK).json(result);
  }
}
