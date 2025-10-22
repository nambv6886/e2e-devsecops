import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUserFavoriteDto {
  @ApiProperty({
    description: 'Store ID to add to favorites',
    example: 'uuid-string',
  })
  @IsNotEmpty()
  @IsUUID()
  storeId: string;
}
