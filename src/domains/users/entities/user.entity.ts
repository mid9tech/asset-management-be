import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { GENDER, LOCATION, USER_TYPE } from '../../../shared/enums';

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  staffCode: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  username: string;

  // @Field(() => String)
  password: string;

  @Field(() => String)
  @IsEnum(GENDER)
  gender: string;

  salt: string;

  refreshToken: string;

  @Field(() => String)
  joinedDate: string;

  @Field(() => String)
  dateOfBirth: string;

  @Field(() => String)
  @IsEnum(USER_TYPE)
  type: USER_TYPE;

  @Field(() => Boolean)
  state: boolean;

  @Field(() => String)
  @IsEnum(LOCATION)
  location: LOCATION;
}
