import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { RequestReturnsService } from './request-returns.service';
import { RequestReturn } from './entities/request-return.entity';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_TYPE } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';
import { RoleGuard } from 'src/common/guard/role.guard';
import { CurrentUserInterface } from 'src/shared/generics';
import { FindRequestReturnsInput } from './dto/find-request-returns.input';
import {
  returningFindRequestReturnsOutput,
  returningRequestReturns,
} from './returns';
import { returningInt } from 'src/shared/constants';
import { CreateRequestReturnInput } from './dto/create-request-return.input';
import { Asset } from '../assets/entities/asset.entity';
import { AssignmentsService } from '../assignments/assignments.service';
import { AssetsService } from '../assets/assets.service';
import { UsersService } from '../users/users.service';
import { Assignment } from '../assignments/entities/assignment.entity';
import { User } from '../users/entities/user.entity';

@Resolver(() => RequestReturn)
export class RequestReturnsResolver {
  constructor(
    private readonly requestReturnsService: RequestReturnsService,
    private readonly assetsService: AssetsService,
    private readonly assignmentService: AssignmentsService,
    private readonly userService: UsersService,
  ) {}

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(returningFindRequestReturnsOutput, { name: 'findRequestReturns' })
  async getRequestReturns(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('request') request: FindRequestReturnsInput,
  ) {
    const location = userReq.location;
    return this.requestReturnsService.findRequestReturns(request, location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(returningRequestReturns, { name: 'findOneRequestReturn' })
  async findOne(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('id', { type: returningInt }) id: number,
  ) {
    const location = userReq.location;
    return await this.requestReturnsService.findOne(id, location);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Mutation(returningRequestReturns, { name: 'createRequestReturn' })
  async createRequestReturn(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('request') request: CreateRequestReturnInput,
  ) {
    const location = userReq.location;
    return this.requestReturnsService.createRequestReturn(request, location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningRequestReturns, { name: 'completeRequestReturn' })
  async completeRequestReturn(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('id', { type: returningInt }) id: number,
  ) {
    return this.requestReturnsService.completeRequestReturn(
      id,
      userReq.location,
      userReq.id,
    );
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningRequestReturns, { name: 'deleteRequestReturn' })
  async deleteRequestReturn(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('id', { type: returningInt }) id: number,
  ) {
    return this.requestReturnsService.deleteRequestReturn(id, userReq.location);
  }

  @ResolveField(() => Asset)
  async asset(
    @Parent() requestReturn: RequestReturn,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return await this.assetsService.findOne(
      requestReturn.assetId,
      userReq.location,
    );
  }

  @ResolveField(() => Assignment)
  async assignment(
    @Parent() requestReturn: RequestReturn,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return await this.assignmentService.findOne(
      requestReturn.assignmentId,
      userReq.location,
    );
  }

  @ResolveField(() => User)
  async acceptedBy(@Parent() requestReturn: RequestReturn) {
    return await this.userService.findOne(requestReturn.acceptedById);
  }

  @ResolveField(() => User)
  async requestedBy(@Parent() requestReturn: RequestReturn) {
    return await this.userService.findOne(requestReturn.requestedById);
  }
}
