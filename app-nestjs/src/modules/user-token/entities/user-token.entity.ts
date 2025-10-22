import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';

@Index('idx_user_id', ['userId'])
@Entity('user-token')
export class UserTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  type: string;

  @Column({ name: 'raw_token' })
  rawToken: string;

  @Column({ name: 'expire_time', type: 'timestamp' })
  expireTime: Date;
}
