import { ApiProperty } from '@nestjs/swagger';
import { StoreResponseDto } from './store-response.dto';

export class SearchStoresResponseDto {
  @ApiProperty({ type: [StoreResponseDto] })
  stores: StoreResponseDto[];

  @ApiProperty({ description: 'Total number of stores found' })
  totalCount: number;

  @ApiProperty({ description: 'Current page index' })
  pageIndex: number;

  @ApiProperty({ description: 'Number of items per page' })
  pageSize: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Search center latitude' })
  centerLatitude: number;

  @ApiProperty({ description: 'Search center longitude' })
  centerLongitude: number;

  @ApiProperty({ description: 'Search radius in kilometers' })
  radiusKm: number;
}
