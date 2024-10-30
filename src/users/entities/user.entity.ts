// users.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { AuthLogin, AuthSocialLogin } from '../../auths/entities/auth.entity';
import { UserProfile } from './user_profile.entity';

// User 엔티티
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 8 })
  name: string;

  @Column({ type: 'int' })
  role: number;

  @Column({ type: 'int' })
  login_type: number;

  @Column({ type: 'bool', default: false })
  set_profile: boolean;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @OneToMany(() => AuthLogin, (login) => login.user, { cascade: true })
  logins: AuthLogin[];

  @OneToMany(() => AuthSocialLogin, (socialLogin) => socialLogin.user, { cascade: true })
  socialLogins: AuthSocialLogin[];
}