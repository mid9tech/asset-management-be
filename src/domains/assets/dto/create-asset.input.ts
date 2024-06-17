import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateAssetInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
