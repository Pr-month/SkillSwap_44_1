import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne
} from 'typeorm';

import { Gender } from '../users.enums';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 100, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  about: string | null;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column({ type: 'varchar', length: 30 })
  city: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'varchar', length: 100, nullable: true })
  avatar: string | null;

  @Column({ type: 'varchar', length: 100, array: true })
  skills: string[];

  @Column({ type: 'varchar', length: 100, array: true, name: 'want_to_learn' })
  wantToLearn: string[];

  @Column({ type: 'varchar', length: 100, array: true, name: 'favourite_skills' })
  favouriteSkills: string[];

  @Column({
    type: 'bigint',
    name: 'role_id',
  })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({
    name: 'role_id',
  })
  role: Role;


  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'refresh_token_hash',
  })
  refreshTokenHash: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
