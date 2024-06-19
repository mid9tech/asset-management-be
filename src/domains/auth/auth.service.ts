import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/shared/interfaces';
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  create(createAuthDto: CreateAuthDto) {
    console.log(createAuthDto);
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    console.log(updateAuthDto);
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async validateUser(username: string, pass: string): Promise<any> {
    console.log(username);
    // This should call your user service to get the user and compare passwords
    const user = { username: 'test', password: 'hashedPassword' }; // Mocked user
    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    if (user && isPasswordMatching) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserByPayload(payload: JwtPayload): Promise<any> {
    console.log(payload);
    // return await this.usersService.findOneById(payload.userId);
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async refresh(token: string) {
    console.log(token);
    // Logic for refreshing the token
  }
}
