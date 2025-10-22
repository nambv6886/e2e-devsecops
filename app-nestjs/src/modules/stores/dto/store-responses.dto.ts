import { ApiProperty } from '@nestjs/swagger';
import { IResponse } from '../../../models/interfaces/i-response';
import { IPagedResponse } from '../../../models/interfaces/i-paged-response';
import { ResponseMessage } from '../../../models/interfaces/response.message.model';
import { StoreInfo } from './store-info.dto';

export class CreateStoreResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty()
  store: StoreInfo;

  constructor(fields?: Partial<CreateStoreResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class GetStoreResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty()
  store: StoreInfo;

  constructor(fields?: Partial<GetStoreResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class UpdateStoreResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty()
  store: StoreInfo;

  constructor(fields?: Partial<UpdateStoreResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class DeleteStoreResponse implements IResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  constructor(fields?: Partial<DeleteStoreResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class GetStoreListResponse implements IPagedResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty()
  totalItemCount: number;

  @ApiProperty()
  pageIndex: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({ type: [StoreInfo] })
  stores: StoreInfo[];

  constructor(fields?: Partial<GetStoreListResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}

export class SearchStoresResponse implements IPagedResponse {
  @ApiProperty()
  responseMessage: ResponseMessage;

  @ApiProperty()
  totalItemCount: number;

  @ApiProperty()
  pageIndex: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({ type: [StoreInfo] })
  stores: StoreInfo[];

  @ApiProperty({ description: 'Search center latitude' })
  centerLatitude: number;

  @ApiProperty({ description: 'Search center longitude' })
  centerLongitude: number;

  @ApiProperty({ description: 'Search radius in kilometers' })
  radiusKm: number;

  constructor(fields?: Partial<SearchStoresResponse>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}
