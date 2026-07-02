import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
  setAccessToken(
    res: Response,
    token: string,
    expiresIn: number,
  ): void {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn * 1000,
    });
  }

  setRefreshToken(
    res: Response,
    token: string,
    expiresIn: number,
  ): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn * 1000,
    });
  }

  clearTokens(
    res: Response,
  ): void {
    res.clearCookie('accessToken');

    res.clearCookie('refreshToken');
  }
}
