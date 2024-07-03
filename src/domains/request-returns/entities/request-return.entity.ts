import { ObjectType, Field, Int } from '@nestjs/graphql';
import { REQUEST_RETURN_STATE } from '@prisma/client';
import { IsEnum } from 'class-validator';

@ObjectType()
export class RequestReturn {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  assetId: number;

  @Field(() => Int)
  assignmentId: number;

  @Field(() => Int)
  requestedById: number;

  @Field(() => Int, { nullable: true })
  acceptedById: number;

  @Field(() => String)
  assignedDate: string;

  @Field(() => String, { nullable: true })
  returnedDate: string;

  @Field(() => String)
  @IsEnum(REQUEST_RETURN_STATE)
  state: string;

  @Field(() => Boolean)
  isRemoved: boolean;
}
