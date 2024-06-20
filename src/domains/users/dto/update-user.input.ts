import { InputType, Field } from '@nestjs/graphql';
import { GENDER, USER_TYPE } from '@prisma/client';
import { IsDateString, IsEnum } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  @IsEnum(GENDER)
  gender: GENDER;

  @Field({ nullable: true })
  @IsDateString()
  joinedDate: string;

  @Field({ nullable: true })
  @IsDateString()
  dateOfBirth: string;

  @Field(() => String, { nullable: true })
  @IsEnum(USER_TYPE)
  type: USER_TYPE;
}
