import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../users.enums';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column({
    type: 'enum',
    enum: UserRole,
    unique: true,
  })
  name: UserRole;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
