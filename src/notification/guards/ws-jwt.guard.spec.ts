import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../../auth/types/auth.types';
import { UserRole } from '../../users/users.enums';
import { WsJwtGuard } from './ws-jwt.guard';

describe('WsJwtGuard', () => {
  const verifyToken = jest.fn();
  const jwtService = {
    verify: verifyToken,
  } as unknown as JwtService;

  let guard: WsJwtGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new WsJwtGuard(jwtService);
  });

  it('возвращает payload для валидного JWT-токена', () => {
    const payload: IJwtPayload = {
      sub: 'user-id',
      email: 'user@example.com',
      roleId: UserRole.USER,
    };
    verifyToken.mockReturnValue(payload);

    expect(guard.verify('valid-token')).toEqual(payload);
    expect(verifyToken).toHaveBeenCalledWith('valid-token');
  });

  it.each([undefined, null, '', '   ', ['token']])(
    'отклоняет отсутствующий или некорректный токен: %p',
    (token) => {
      expect(() => guard.verify(token)).toThrow(
        new UnauthorizedException('JWT-токен не передан'),
      );
      expect(verifyToken).not.toHaveBeenCalled();
    },
  );

  it('отклоняет недействительный JWT-токен', () => {
    verifyToken.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    expect(() => guard.verify('invalid-token')).toThrow(
      new UnauthorizedException('Недействительный JWT-токен'),
    );
  });
});
