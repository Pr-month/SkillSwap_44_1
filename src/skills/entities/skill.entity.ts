import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'bigint', name: 'category_id' })
  categoryId: number;

  @Column('text', {
    array: true,
    nullable: true,
    default: () => "'{}'",
  })
  images: string[] | null;

  @Column({ type: 'bigint', name: 'owner_id' })
  ownerId: number;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Category, (category) => category.skills)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
