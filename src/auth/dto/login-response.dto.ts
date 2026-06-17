import { UserEntity } from '../../user.entity';

export class LoginResponseDto {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}
