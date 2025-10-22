import { ApiProperty } from '@nestjs/swagger';
import { IResponse } from '../../../models/interfaces/i-response';
import { ResponseMessage } from '../../../models/interfaces/response.message.model';
import { LocationInfo } from './location-info.dto';

export class UpdateLocationResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty()
  location: LocationInfo;

  constructor(fields?: Partial<UpdateLocationResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class GetLocationResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty()
  location: LocationInfo;

  constructor(fields?: Partial<GetLocationResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}
