import { InputType, Field } from '@nestjs/graphql';
import { IsDateString, IsEnum } from 'class-validator';
import { GENDER, USER_TYPE } from '../../../shared/enums';

@InputType()
export class CreateUserInput {
  @Field(() => String, {
    nullable: false,
  })
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  @IsEnum(GENDER)
  gender: GENDER;

  @Field()
  @IsDateString()
  joinedDate: string;

  @Field()
  @IsDateString()
  dateOfBirth: string;

  @Field(() => String)
  @IsEnum(USER_TYPE)
  type: USER_TYPE;
}
