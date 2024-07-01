import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { ASSET_STATE } from '@prisma/client';
import { IsEnum } from 'class-validator';

@ObjectType()
export class Asset {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  assetCode: string;

  @Field(() => String)
  assetName: string;

  @Field(() => Int)
  categoryId: number;

  @Field(() => String)
  installedDate: string;

  @Field(() => Boolean)
  isRemoved: boolean;

  @Field(() => Boolean)
  isAllowRemoved: boolean;

  @Field(() => Boolean)
  isReadyAssigned: boolean;

  @Field(() => String)
  @IsEnum(ASSET_STATE)
  state: string;

  @Field(() => String)
  location: string;

  @Field(() => String, { nullable: true })
  specification: string;
}
