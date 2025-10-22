import { ApiProperty } from '@nestjs/swagger';

export class StoreResponseDto {
  @ApiProperty({ description: 'Store ID' })
  id: string;

  @ApiProperty({ description: 'Store name' })
  name: string;

  @ApiProperty({ description: 'Store type', example: 'supermarket' })
  type: string;

  @ApiProperty({ description: 'Store address' })
  address: string;

  @ApiProperty({ description: 'Latitude coordinate', example: 21.028511 })
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate', example: 105.804817 })
  longitude: number;

  @ApiProperty({ description: 'Store rating', example: 4.5 })
  rating: number;

  @ApiProperty({
    description: 'Distance from search point in meters',
    example: 1500,
  })
  distance?: number;

  @ApiProperty({ description: 'Whether the store is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Store creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Store last update date' })
  updatedAt: Date;
}
