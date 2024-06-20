import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import { LoginInput } from './dto/login-input.dto';
import { IJwtPayload } from '../../shared/interfaces';
import { IsCorrectPW } from '../../shared/helpers';
import { USER_TYPE } from 'src/shared/enums';

jest.mock('../../shared/helpers');

describe('AuthService', () => {
  let service: AuthService;
  // let jwtService: JwtService;
  // let usersService: UsersService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUsersService = {
    findOneById: jest.fn(),
    findOneByUsername: jest.fn(),
    checkRefreshToken: jest.fn(),
    updateRefreshToken: jest.fn(),
    updatePassword: jest.fn(),
    updateState: jest.fn(),
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
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // jwtService = module.get<JwtService>(JwtService);
    // usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw an error if the user is not found', async () => {
      mockUsersService.findOneByUsername.mockResolvedValue(null);
      const loginInput: LoginInput = {
        username: 'wronguser',
        password: 'password',
      };

      await expect(service.login(loginInput)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the password is incorrect', async () => {
      mockUsersService.findOneByUsername.mockResolvedValue(mockUser);
      (IsCorrectPW as jest.Mock).mockResolvedValue(false);
      const loginInput: LoginInput = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      await expect(service.login(loginInput)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return tokens and user data on successful login', async () => {
      mockUsersService.findOneByUsername.mockResolvedValue(mockUser);
      (IsCorrectPW as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('accessToken');
      mockUsersService.updateRefreshToken.mockResolvedValue(true);

      const loginInput: LoginInput = {
        username: 'testuser',
        password: 'password',
      };
      const response = await service.login(loginInput);

      expect(response).toEqual(
        expect.objectContaining({
          accessToken: 'accessToken',
          refreshToken: 'accessToken',
          user: expect.objectContaining({
            id: mockUser.id,
            username: mockUser.username,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            role: mockUser.type,
            isActived: mockUser.state,
          }),
        }),
      );
    });
  });

  describe('validateUserByPayload', () => {
    it('should return a user if the payload is valid', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      const payload: IJwtPayload = { userId: 1, role: USER_TYPE.USER };

      const result = await service.validateUserByPayload(payload);
      expect(result).toEqual(mockUser);
    });
  });

  describe('validateUserByJwtRefreshToken', () => {
    it('should throw an error if the refresh token is invalid', async () => {
      mockUsersService.checkRefreshToken.mockResolvedValue(null);

      await expect(
        service.validateUserByJwtRefreshToken(1, 'wrongtoken'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return a user if the refresh token is valid', async () => {
      mockUsersService.checkRefreshToken.mockResolvedValue('validtoken');
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const result = await service.validateUserByJwtRefreshToken(
        1,
        'validtoken',
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('generateJwtToken', () => {
    it('should generate a JWT token', async () => {
      const payload: IJwtPayload = { userId: 1, role: USER_TYPE.USER };
      mockJwtService.sign.mockReturnValue('signedToken');

      const token = await service.generateJwtToken(payload, 3600, 'secret');
      expect(token).toBe('signedToken');
    });
  });

  describe('logout', () => {
    it('should return true if refresh token is cleared', async () => {
      mockUsersService.updateRefreshToken.mockResolvedValue(true);

      const result = await service.logout(1);
      expect(result).toBe(true);
    });
  });

  describe('refreshAccessToken', () => {
    it('should return a new access token', async () => {
      mockJwtService.sign.mockReturnValue('newAccessToken');

      const result = await service.refreshAccessToken(1, USER_TYPE.USER);
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        expired_accessToken: expect.any(Number),
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify the token', async () => {
      mockJwtService.verify.mockReturnValue(true);

      const result = await service.verifyToken('token', 'access');
      expect(result).toBe(true);
    });
  });

  describe('changePassword', () => {
    it('should throw an error if the old password is incorrect', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      (IsCorrectPW as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUser, 'wrongOldPassword', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the new password is the same as the old password', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      (IsCorrectPW as jest.Mock).mockResolvedValue(true);

      await expect(
        service.changePassword(mockUser, 'hashedpassword', 'hashedpassword'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update the password successfully', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      (IsCorrectPW as jest.Mock).mockResolvedValue(true);
      mockUsersService.updatePassword.mockResolvedValue(mockUser);

      const result = await service.changePassword(
        mockUser,
        'hashedpassword',
        'newPassword',
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.type,
          isActived: mockUser.state,
        }),
      );
    });
  });

  describe('changePasswordFirstTime', () => {
    it('should throw an error if the user already changed the password', async () => {
      const activeUser = { ...mockUser, state: true };
      mockUsersService.findOneById.mockResolvedValue(activeUser);

      await expect(
        service.changePasswordFirstTime(mockUser, 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the new password is the same as the old password', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      (IsCorrectPW as jest.Mock).mockResolvedValue(true);

      await expect(
        service.changePasswordFirstTime(mockUser, 'hashedpassword'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update the password and state successfully', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      (IsCorrectPW as jest.Mock).mockResolvedValue(false);
      mockUsersService.updatePassword.mockResolvedValue(mockUser);
      mockUsersService.updateState.mockResolvedValue({
        ...mockUser,
        state: true,
      });

      const result = await service.changePasswordFirstTime(
        mockUser,
        'newPassword',
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.type,
          isActived: true,
        }),
      );
    });
  });
});
