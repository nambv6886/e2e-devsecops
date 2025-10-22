import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { StoreEntity } from '../../stores/entities/store.entity';

@Entity('user_favorites')
@Unique('uk_user_store', ['user', 'store'])
export class UserFavoriteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  store: StoreEntity;

  @CreateDateColumn()
  createdAt: Date;
}
