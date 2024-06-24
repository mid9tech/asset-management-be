import { InputType, Field } from '@nestjs/graphql';
import { GENDER, LOCATION, USER_TYPE } from 'src/shared/enums';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  gender: GENDER;

  @Field({ nullable: true })
  joinedDate: string;

  @Field({ nullable: true })
  dateOfBirth: string;

  @Field(() => String, { nullable: true })
  type: USER_TYPE;

  @Field({ nullable: true })
  location: LOCATION;
}
