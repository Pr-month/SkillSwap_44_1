// изменил на энтити из users
import {User} from '../../users/entities/user.entity'

export class LoginResponseDto {
  // старый вариант
  // user: UserEntity;
  // изменил на энтити изusers
  user: User;
  accessToken: string;
  refreshToken: string;
}
