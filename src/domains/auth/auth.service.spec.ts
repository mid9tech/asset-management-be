import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { USER_TYPE } from '../../shared/enums';
import { PrismaService } from '../../services/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { LoginInput } from './dto/login-input.dto';

const mockUser = { id: 1, username: 'test', password: '1234567' };

const mockResponse = {
  accessToken: 'mockAccessToken',
  expiredAccessToken: 123456789,
  user: mockUser,
  refreshToken: 'mockRefreshToken',
  expiredRefreshToken: 123456789,
};

const mockAuthService = {
  login: jest.fn().mockResolvedValue(mockResponse),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        JwtService,
        UsersService,
        PrismaService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return tokens on login', async () => {
    const result = await service.login(mockUser);
    expect(result).toEqual(mockResponse);
  });
});
