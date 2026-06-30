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
    type: 'text',
    default: Status.PENDING,
  })
  status: Status;

  @Column({
    name: 'is_read',
    type: 'boolean',
    default: false,
  })
  isRead: boolean;

  @Column({ name: 'sender_id', type: 'bigint' })
  senderId: string;

  @Column({ name: 'receiver_id', type: 'bigint' })
  receiverId: string;

  @Column({ name: 'offered_skill_id', type: 'bigint' })
  offeredSkillId: string;

  @Column({ name: 'requested_skill_id', type: 'bigint' })
  requestedSkillId: string;

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
