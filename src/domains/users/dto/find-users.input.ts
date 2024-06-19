import { InputType, Field } from '@nestjs/graphql';
import { IsDateString, IsEnum } from 'class-validator';
import { GENDER, USER_TYPE } from '../../../shared/enums';
import { BasePagingRequest } from 'src/shared/generics';

@InputType()
export class FindUsersInput extends BasePagingRequest {
  @Field(() => String, {nullable: true})
  @IsEnum(USER_TYPE)
  type: USER_TYPE;

  @Field(() => String, { nullable: true, defaultValue: 'firstName' })
  sort: string;

}

