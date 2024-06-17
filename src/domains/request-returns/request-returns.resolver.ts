import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RequestReturnsService } from './request-returns.service';
import { RequestReturn } from './entities/request-return.entity';
import { CreateRequestReturnInput } from './dto/create-request-return.input';
import { UpdateRequestReturnInput } from './dto/update-request-return.input';

@Resolver(() => RequestReturn)
export class RequestReturnsResolver {
  constructor(private readonly requestReturnsService: RequestReturnsService) {}

  @Mutation(() => RequestReturn)
  createRequestReturn(
    @Args('createRequestReturnInput')
    createRequestReturnInput: CreateRequestReturnInput,
  ) {
    return this.requestReturnsService.create(createRequestReturnInput);
  }

  @Query(() => [RequestReturn], { name: 'requestReturns' })
  findAll() {
    return this.requestReturnsService.findAll();
  }

  @Query(() => RequestReturn, { name: 'requestReturn' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.requestReturnsService.findOne(id);
  }

  @Mutation(() => RequestReturn)
  updateRequestReturn(
    @Args('updateRequestReturnInput')
    updateRequestReturnInput: UpdateRequestReturnInput,
  ) {
    return this.requestReturnsService.update(
      updateRequestReturnInput.id,
      updateRequestReturnInput,
    );
  }

  @Mutation(() => RequestReturn)
  removeRequestReturn(@Args('id', { type: () => Int }) id: number) {
    return this.requestReturnsService.remove(id);
  }
}
