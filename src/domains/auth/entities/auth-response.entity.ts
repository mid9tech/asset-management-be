import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field({ nullable: true })
  accessToken: string;

  @Field(() => Float, { nullable: true })
  expired_accessToken: number;

  @Field({ nullable: true })
  refreshToken: string;

  @Field(() => Float, { nullable: true })
  expired_refreshToken: number;
}
