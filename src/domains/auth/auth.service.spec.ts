import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';

// Mock JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue('signedToken'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          useFactory: () => ({
            secret: 'test',
            signOptions: { expiresIn: '60s' },
          }),
        }),
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should validate user', async () => {
  //   const username = 'test';
  //   const password = 'password';
  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

  //   const result = await service.validateUser(username, password);
  //   expect(result).toEqual({ username: 'test' });
  // });

  // it('should return null if invalid user', async () => {
  //   jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
  //   const result = await service.validateUser('test', 'wrongPassword');
  //   expect(result).toBeNull();
  // });

  // it('should return access token on login', async () => {
  //   const user = { username: 'test', userId: 1 };
  //   const result = await service.login(user);
  //   expect(result).toEqual({ access_token: 'signedToken' });
  // });
});
