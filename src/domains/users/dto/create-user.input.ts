import { InputType, Field } from '@nestjs/graphql';
import { IsDateString, IsEnum } from 'class-validator';
import { GENDER, LOCATION, USER_TYPE } from 'src/shared/enums';

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

  @Field({ nullable: true })
  @IsEnum(LOCATION)
  location: LOCATION;
}
