import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StoreType } from '../enums/store-type.enum';

export class SearchStoresDto {
  @ApiProperty({
    description: 'Latitude of the search center point',
    example: 21.028511,
    required: true,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude of the search center point',
    example: 105.804817,
    required: true,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Search radius in kilometers',
    example: 5,
    default: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  @Max(100)
  @Transform(({ value }) => Number(value))
  radius?: number = 5;

  @ApiProperty({
    description: 'Store name to search for (partial match)',
    example: 'Winmart',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Store type to filter by',
    enum: StoreType,
    example: StoreType.SUPERMARKET,
    required: false,
  })
  @IsOptional()
  @IsEnum(StoreType)
  type?: StoreType;

  @ApiProperty({
    description: 'Page index (1-based)',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Transform(({ value }) => Number(value))
  pageIndex?: number = 1;

  @ApiProperty({
    description: 'Page size (number of items per page)',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @Transform(({ value }) => Number(value))
  pageSize?: number = 10;
}
