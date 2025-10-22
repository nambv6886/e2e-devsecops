import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StoreType } from '../enums/store-type.enum';

export class CreateStoreDto {
  @ApiProperty({ description: 'Store name', example: 'Winmart Plaza' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Store type',
    enum: StoreType,
    example: StoreType.SUPERMARKET,
  })
  @IsEnum(StoreType)
  type: StoreType;

  @ApiProperty({
    description: 'Store address',
    example: '123 Nguyen Trai, Hanoi',
  })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Latitude', example: 21.028511 })
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: 105.804817 })
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Store rating',
    example: 4.5,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  rating?: number = 0;
}
