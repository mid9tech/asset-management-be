import { IsDateString, IsEnum } from 'class-validator';

import { InputType, Field } from '@nestjs/graphql';
import { ASSET_STATE } from '@prisma/client';

@InputType()
export class UpdateAssetInput {
  @Field(() => String, { description: 'Name of the asset' })
  assetName: string;

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
