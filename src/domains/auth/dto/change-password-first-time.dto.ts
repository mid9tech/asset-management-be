import { IsString } from 'class-validator';

export class ChangePasswordFirstTimeDto {
  @IsString()
  newPassword: string;
}
