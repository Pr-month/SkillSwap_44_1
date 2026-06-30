import { User } from '../../users/entities/user.entity';

export class RegisterResponseDto {
  user: User;
  accessToken: string;
  refreshToken: string;
}
