import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { Status } from '../enum/status.enum';

@Entity('requests')
export class Requests {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @Column({
    name: 'is_read',
    type: 'boolean',
    default: false,
  })
  isRead: boolean;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @ManyToOne(() => Skill, { nullable: false })
  @JoinColumn({ name: 'offered_skill_id' })
  offeredSkill: Skill;

  @ManyToOne(() => Skill, { nullable: false })
  @JoinColumn({ name: 'requested_skill_id' })
  requestedSkill: Skill;
}