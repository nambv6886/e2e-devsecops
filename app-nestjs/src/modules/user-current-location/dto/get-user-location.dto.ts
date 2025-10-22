import { ApiProperty } from '@nestjs/swagger';

export class GetUserLocationDto {
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
}
