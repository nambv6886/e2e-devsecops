import { ApiProperty } from "@nestjs/swagger";
import { ResponseStatus } from "./response.status.model";

export class ResponseMessage {
  @ApiProperty({ enum: ResponseStatus })
  public status: number;
  @ApiProperty()
  public messageCode: string;
  @ApiProperty()
  public message: string;
  @ApiProperty()
  public data: any;

  public constructor(fields: Partial<ResponseMessage>) {
    if (fields) {
      Object.assign(this, fields);
    }
  }
}