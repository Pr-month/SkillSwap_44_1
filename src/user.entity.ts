import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: "text"})
    name: string;

    @Column({unique: true, type: "text"})
    email: string;

    @Column({select: false, type: "text", name: "password_hash"})
    passwordHash: string;

    @Column({type: "text", nullable: true})
    about: string;

    @Column({type: "date"})
    birthdate: Date;

    @Column({type: "text"})
    city: string;

    @Column({type: "text"})
    gender: string;

    @Column({type: "text", nullable: true})
    avatar: string | null;

    @Column({type: "text", array: true})
    skills: string[];

    @Column({type: "text", array: true, name: "want_to_learn"})
    wantToLearn: string[];

    @Column({type: "text", array: true, name: "favourite_skills"})
    favouriteSkills: string[];

    @Column({type: "int8", name: "role_id"})
    roleId: number;

    @Column({type: "text", nullable: true, select: false, name: "refresh_token_hash"})
    refreshTokenHash: string | null;

    @CreateDateColumn({type: "timestamp", name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp", name: "updated_at"})
    updatedAt: Date;
}