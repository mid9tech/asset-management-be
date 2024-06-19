import { CreateRequestReturnInput } from './create-request-return.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRequestReturnInput extends PartialType(
  CreateRequestReturnInput,
) {
  @Field(() => Int)
  id: number;
}
