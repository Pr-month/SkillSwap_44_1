import { Gender } from '../../users/users.enums';
import {
  IsString,
  IsArray,
  MinLength,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class RegisterRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  cityId: string;

  @IsString()
  birthdate: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsArray()
  wantToLearn?: string[];

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsArray()
  favouriteSkills?: string[];
}
