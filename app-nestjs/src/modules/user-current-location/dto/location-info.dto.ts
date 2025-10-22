import { ApiProperty } from '@nestjs/swagger';
import { UserCurrentLocationEntity } from '../entities/user-current-location.entity';

export class LocationInfo {
  @ApiProperty({
    description: 'User ID',
    example: 'uuid-string',
  })
  userId: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 37.7749,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -122.4194,
  })
  longitude: number;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2025-10-07T10:00:00Z',
  })
  updatedAt: Date;

  constructor(location?: UserCurrentLocationEntity) {
    if (location) {
      this.userId = location.userId;
      this.latitude = parseFloat(location.latitude as any);
      this.longitude = parseFloat(location.longitude as any);
      this.updatedAt = location.updatedAt;
    }
  }
}
