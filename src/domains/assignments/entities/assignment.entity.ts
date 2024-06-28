import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Asset } from 'src/domains/assets/entities/asset.entity';
import { User } from 'src/domains/users/entities/user.entity';
import { ASSIGNMENT_STATE } from 'src/shared/enums';

@ObjectType()
export class Assignment {
  @Field(() => Int)
  id: number;

  @Field()
  assetCode: string;

  @Field()
  assetName: string;

  @Field(() => User, { name: 'assigner' })
  assigner: User;
  assignedById: number;

  @Field(() => User, { name: 'assignee' })
  assignee: User;
  assignedToId: number;

  @Field()
  state: ASSIGNMENT_STATE;

  @Field({ nullable: true })
  note: string;

  @Field()
  assignedDate: string;

  @Field(() => Asset, { name: 'asset' })
  asset: Asset;
  assetId: number;

  @Field({ nullable: true })
  assignedByUsername: string;

  @Field({ nullable: true })
  assignedToUsername: string;
}
