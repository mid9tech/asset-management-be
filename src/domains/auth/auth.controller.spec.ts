import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { USER_TYPE } from '@prisma/client';
import { ChangePasswordFirstTimeDto } from './dto/change-password-first-time.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginInput } from './dto/login-input.dto';

import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

jest.mock('./auth.service');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    logout: jest.fn(),
    changePasswordFirstTime: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    type: USER_TYPE.USER,
    state: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('test', () => {
    it('should return "Hello World!"', async () => {
      const result = await controller.test();
      expect(result).toBe('Hello World!');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const res = mockResponse();
      const loginInput: LoginInput = {
        username: 'testuser',
        password: 'password',
      };
      const authResult = {
        accessToken: 'accessToken',
        expiredAccessToken: 3600,
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue(authResult);

      await controller.login(res, loginInput);

      expect(authService.login).toHaveBeenCalledWith(loginInput);
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', undefined, {
        httpOnly: true,
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(authResult);
    });
  });

  describe('refreshAccess', () => {
    it('should refresh access token successfully', async () => {
      const user = { id: 1, role: USER_TYPE.USER };
      const authResult = {
        accessToken: 'newAccessToken',
        expired_accessToken: 3600,
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(authResult);

      const result = await controller.refreshAccess(user);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        user.id,
        user.role,
      );
      expect(result).toEqual(authResult);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const res = mockResponse();
      const user = { id: 1 };

      mockAuthService.logout.mockResolvedValue(true);

      await controller.logout(res, user);

      expect(authService.logout).toHaveBeenCalledWith(user.id);
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith('Logout success!');
    });
  });

  describe('changePassword', () => {
    it('should change password first time successfully', async () => {
      const res = mockResponse();
      const user = { id: 1 };
      const changePasswordFirstTime: ChangePasswordFirstTimeDto = {
        newPassword: 'newPassword',
      };
      const authResult = { ...mockUser, state: true };

      mockAuthService.changePasswordFirstTime.mockResolvedValue(authResult);

      await controller.changePassword(res, user, changePasswordFirstTime);

      expect(authService.changePasswordFirstTime).toHaveBeenCalledWith(
        user,
        changePasswordFirstTime.newPassword,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(authResult);
    });

    it('should change password successfully', async () => {
      const res = mockResponse();
      const user = { id: 1 };
      const changePassword: ChangePasswordDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };
      const authResult = mockUser;

      mockAuthService.changePassword.mockResolvedValue(authResult);

      await controller.changePasswordNormal(res, user, changePassword);

      expect(authService.changePassword).toHaveBeenCalledWith(
        user,
        changePassword.oldPassword,
        changePassword.newPassword,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(authResult);
    });
  });
});
