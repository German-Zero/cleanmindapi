import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { Public } from '../../../shared/security/decorators/public.decorator';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { DiscordConnectionService } from '../../application/services/discord-connection.service';
import { DiscordOAuthCallbackRequest } from '../requests/discord-oauth-callback.request';

@Controller('notifications/discord')
@UseGuards(JwtAuthGuard)
export class DiscordConnectionController {
  constructor(
    private readonly connections: DiscordConnectionService,
    private readonly config: ConfigService,
  ) {}

  @Get('connection')
  async getConnection(@CurrentUser() user: JwtPayload) {
    const connection = await this.connections.findByUserId(user.sub);

    return connection
      ? {
          connected: true,
          discordUserId: connection.discordUserId,
          username: connection.username,
          globalName: connection.globalName,
          connectedAt: connection.connectedAt,
        }
      : { connected: false };
  }

  @Post('connection')
  async createConnection(@CurrentUser() user: JwtPayload) {
    return {
      authorizationUrl: await this.connections.createAuthorizationUrl(user.sub),
    };
  }

  @Delete('connection')
  @HttpCode(HttpStatus.NO_CONTENT)
  async disconnect(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.connections.disconnect(user.sub);
  }

  @Post('test')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendTestMessage(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.connections.sendTestMessage(user.sub);
  }

  @Get('callback')
  @Public()
  async callback(
    @Query() query: DiscordOAuthCallbackRequest,
    @Res() response: Response,
  ): Promise<void> {
    await this.connections.completeConnection(query.code, query.state);

    const successUrl = new URL(
      this.config.get<string>('notifications.discord.successUrl') ??
        '/settings',
      this.config.getOrThrow<string>('auth.frontend.url'),
    );
    successUrl.searchParams.set('discord', 'connected');

    response.redirect(HttpStatus.SEE_OTHER, successUrl.toString());
  }
}
