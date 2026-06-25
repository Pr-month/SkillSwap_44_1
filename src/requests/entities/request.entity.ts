import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Status } from "../enum/status.enum";
import { User } from "../../users/entities/user.entity";


@Entity('requests')
export class Requests {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => User)
    sender: User;

    @ManyToOne(() => User)
    receiver: User;

    @Column({ type: 'enum', enum: Status, default: Status.PENDING })
    status: Status;

    @Column({ type: 'text' })
    offeredSkill: string;

    @Column({ type: 'text' })
    requestedSkill: string;

    @Column({ type: 'boolean', default: false  })
    isRead: boolean;
}
