import { Gender } from '../users.enums';

// здесь описываются все поля, передаваемые с фронта на сервер
export class CreateUserDto {
  email: string;
  password: string;
  name: string;

  birthdate?: Date;
  gender?: Gender;
  city?: string;
}
