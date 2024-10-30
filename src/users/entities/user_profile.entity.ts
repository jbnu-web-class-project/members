import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_profile')
export class UserProfile {
  @PrimaryGeneratedColumn()
  profile_id: number;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 8 })
  nickname: string;

  @Column({ type: 'varchar', length: 16 })
  phone: string;

  @Column({ type: 'varchar', length: 128 })
  address: string;

  @Column({ type: 'varchar', length: 128 })
  profile_img: string;

  @Column({ type: 'int' })
  prefer_sports: number;

  @Column({ type: 'int' })
  prefer_team: number;

  @CreateDateColumn({ type: 'timestamp' })
  join_date: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_date: Date;
}