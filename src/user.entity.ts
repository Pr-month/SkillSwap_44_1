import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'refresh_token_hash', nullable: true, select: false })
  refreshTokenHash: string | null;
}
