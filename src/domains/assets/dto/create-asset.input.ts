import { InputType, Int, Field } from '@nestjs/graphql';
import { ASSET_STATE } from '@prisma/client';
import { IsDateString, IsEnum } from 'class-validator';

@InputType()
export class CreateAssetInput {
  @Field(() => String, { description: 'Name of the asset' })
  assetName: string;

  @Field(() => Int, { description: 'ID of the category' })
  categoryId: number;

  @Field(() => String, {
    description: 'Specification of the asset',
    nullable: true,
  })
  specification: string;

  @Field(() => String, { description: 'Date the asset was installed' })
  @IsDateString()
  installedDate: string;

  @Field({ description: 'State of the asset' })
  @IsEnum(ASSET_STATE)
  state: string;
}
