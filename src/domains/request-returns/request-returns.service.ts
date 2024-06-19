import { Injectable } from '@nestjs/common';
import { CreateRequestReturnInput } from './dto/create-request-return.input';
import { UpdateRequestReturnInput } from './dto/update-request-return.input';

@Injectable()
export class RequestReturnsService {
  create(createRequestReturnInput: CreateRequestReturnInput) {
    return createRequestReturnInput;
  }

  findAll() {
    return `This action returns all requestReturns`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requestReturn`;
  }

  update(id: number, updateRequestReturnInput: UpdateRequestReturnInput) {
    return `This action updates a #${id} requestReturn: ${updateRequestReturnInput}`;
  }

  remove(id: number) {
    return `This action removes a #${id} requestReturn`;
  }
}
