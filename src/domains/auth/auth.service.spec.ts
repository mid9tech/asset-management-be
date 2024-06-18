import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { USER_TYPE } from '../../shared/enums';
import { PrismaService } from '../../services/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { LoginInput } from './dto/login-input.dto';

// Mock data
const mockUser = { id: 1, username: 'test', password: '1234567' };
const mockJwtPayload = { userId: 1, role: USER_TYPE.USER };
const mockJwtService = {
  sign: () => 'signedToken',
};
const mockUsersService = {
  findOneById: (id: number) =>
    id === mockUser.id ? Promise.resolve(mockUser) : Promise.resolve(null),
  checkRefreshToken: (userId: number, refreshToken: string) =>
    userId === mockUser.id && refreshToken === 'refreshToken'
      ? Promise.resolve(true)
      : Promise.resolve(false),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, JwtService, UsersService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user by payload', async () => {
    const mockUserId = 1; // Make sure this user exists in your test setup
    const result = await service.validateUserByPayload({
      userId: mockUserId,
      role: USER_TYPE.USER,
    });
    expect(result).toEqual(mockUser);
  });

  it('should validate user by JWT refresh token', async () => {
    await expect(
      service.validateUserByJwtRefreshToken(mockUser.id, 'refreshToken'),
    ).resolves.toBeUndefined();
  });

  it('should return access token on login', async () => {
    const result = await service.login(mockUser);
    expect(result).toEqual({ access_token: 'signedToken' });
  });
});
