// auths.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

// AuthSocialLogin 엔티티
@Entity('auth_social_login')
export class AuthSocialLogin {
  @PrimaryGeneratedColumn()
  social_login_id: number;

  @ManyToOne(() => User, (user) => user.socialLogins)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 64, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 64 })
  external_id: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  refresh_token: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_date: Date;
}

// AuthLogin 엔티티
@Entity('auth_login')
export class AuthLogin {
  @PrimaryGeneratedColumn()
  login_id: number;

  @ManyToOne(() => User, (user) => user.logins)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 64, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 128 })
  password: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_date: Date;
}
