import {
  ObjectType,
  Field,
  Int,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { GENDER, LOCATION, USER_TYPE } from 'src/shared/enums';

@ObjectType()
export class User {
  @Field((type) => ID)
  id: number;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  staffCode: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  @IsEnum(GENDER)
  gender: string;

  @Field(() => String)
  salt: string;

  @Field(() => String, { nullable: true })
  refreshToken: string;

  @Field(() => GraphQLISODateTime)
  joinedDate: Date;

  @Field(() => String)
  @IsEnum(USER_TYPE)
  type: USER_TYPE;

  @Field(() => GraphQLISODateTime)
  dateOfBirth: string;

  @Field(() => Boolean)
  state: boolean;

  @Field(() => String)
  @IsEnum(LOCATION)
  location: LOCATION;
}
