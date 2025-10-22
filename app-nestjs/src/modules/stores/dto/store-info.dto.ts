import { ApiProperty } from '@nestjs/swagger';
import { StoreEntity } from '../entities/store.entity';

export class StoreInfo {
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

  constructor(store?: StoreEntity) {
    if (store) {
      this.id = store.id;
      this.name = store.name;
      this.type = store.type;
      this.address = store.address;
      this.latitude = parseFloat(store.latitude as any);
      this.longitude = parseFloat(store.longitude as any);
      this.rating = parseFloat(store.rating as any);
      this.isActive = store.isActive;
      this.createdAt = store.createdAt;
      this.updatedAt = store.updatedAt;
    }
  }
}
