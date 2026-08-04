import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtServiceService } from './jwt.service';

describe('JwtServiceService', () => {
  it('rechaza un refresh token inválido como sesión vencida', async () => {
    const jwt = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('invalid token')),
    } as unknown as JwtService;
    const config = {
      get: jest.fn().mockReturnValue('refresh-secret'),
    } as unknown as ConfigService;
    const service = new JwtServiceService(jwt, config);

    await expect(service.verifyRefreshToken('invalid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
