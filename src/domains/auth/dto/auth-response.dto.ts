import { IsJWT, IsNumber, IsString } from 'class-validator';

export class AuthResponseDto {
  @IsString()
  @IsJWT()
  accessToken: string;

  @IsString()
  @IsJWT()
  refreshToken: string;

  @IsNumber()
  expiredAccessToken: number;

  @IsNumber()
  expiredRefreshToken: number;

  user: {
    id: number;
    username: string;
  };
}
