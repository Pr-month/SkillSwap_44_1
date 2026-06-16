import {Gender} from '../../users/users.enums';

export class RegisterResponseDto {
    id: string;

    email: string;

    name: string;

    gender: Gender;

    city: string;

    birthdate: Date;

    about?: string;

    avatar?: string;

    wantToLearn?: string[];

    skills?: string[];

    favouriteSkills?: string[];

    roleId: string;
}