import { ApiProperty } from '@nestjs/swagger';
import { IPagedRequest } from '../interfaces/i-paged-request';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { MessageCode } from '../../common/constants/message-code.constant';
import { Transform } from 'class-transformer';

export class GetListRequest implements IPagedRequest {
  @ApiProperty()
  @IsNotEmpty({ message: MessageCode.GET_LIST_PAGE_INDEX_REQUIRED })
  @IsNumber({}, { message: MessageCode.GET_LIST_PAGE_INDEX_NOT_NUMBER })
  @Transform(({ value }) => Number(value))
  pageIndex: number;

  @ApiProperty()
  @IsNumber({}, { message: MessageCode.GET_LIST_PAGE_SIZE_NOT_NUMBER })
  @IsNotEmpty({ message: MessageCode.GET_LIST_PAGE_SIZE_REQUIRED })
  @Transform(({ value }) => Number(value))
  pageSize: number;

  @ApiProperty()
  orderBy: string;

  constructor(fields?: Partial<GetListRequest>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}
