import { CreateAssetInput } from './create-asset.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAssetInput extends PartialType(CreateAssetInput) {
  @Field(() => Int)
  id: number;
}
