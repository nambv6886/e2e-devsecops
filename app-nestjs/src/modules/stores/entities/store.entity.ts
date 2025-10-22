import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('stores')
@Index('idx_name', ['name'])
@Index('idx_type', ['type'])
@Index('idx_location', ['location'], { spatial: true }) // Spatial index
export class StoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['supermarket', 'gas_station', 'eatery', 'pharmacy', 'other'],
  })
  type: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({
    type: 'point',
    spatialFeatureType: 'Point',
    srid: 4326,
    select: false,
  })
  location: string; // TypeORM store as WKT: 'POINT(lng lat)' - select: false to avoid AsText() error in MySQL 8+

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0.0 })
  rating: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
