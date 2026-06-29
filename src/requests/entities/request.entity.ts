import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Status } from "../enum/status.enum";
import { User } from "../../users/entities/user.entity";
import { Skill } from "../../skills/entities/skill.entity";


@Entity('requests')
export class Requests {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User)
    sender: User;

    @ManyToOne(() => User)
    receiver: User;

    @Column({ type: 'enum', enum: Status, default: Status.PENDING })
    status: Status;

    @ManyToOne(() => Skill)
    offeredSkill: Skill;

    @ManyToOne(() => Skill)
    requestedSkill: Skill;

    @Column({ type: 'boolean', default: false  })
    isRead: boolean;
}

export class Request {}
