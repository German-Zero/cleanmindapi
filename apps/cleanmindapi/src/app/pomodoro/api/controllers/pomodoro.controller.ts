import { Body, Controller, DefaultValuePipe, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { PomodoroCommandPort } from '../../application/ports/inbound/pomodoro-command.port';
import { PomodoroQueryPort } from '../../application/ports/inbound/pomodoro-query.port';
import { PomodoroBreakType, PomodoroSession, PomodoroSettings, PomodoroState, PomodoroSummary } from '../../domain/models/pomodoro.model';
import { FinishPomodoroSessionRequest } from '../requests/finish-pomodoro-session.request';
import { StartPomodoroSessionRequest } from '../requests/start-pomodoro-session.request';
import { UpdatePomodoroSettingsRequest } from '../requests/update-pomodoro-settings.request';

@UseGuards(JwtAuthGuard)
@Controller('pomodoro')
export class PomodoroController {
  constructor(
    private readonly queries: PomodoroQueryPort,
    private readonly commands: PomodoroCommandPort,
  ) {}

  @Get('settings')
  async getSettings(
    @CurrentUser() user: JwtPayload,
  ): Promise<PomodoroSettings> {
    return this.queries.getSettings(user.sub);
  }

  @Patch('settings')
  async updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() request: UpdatePomodoroSettingsRequest,
  ): Promise<PomodoroSettings> {
    return this.commands.updateSettings(user.sub, request);
  }

  @Get('state')
  async getState(
    @CurrentUser() user: JwtPayload,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ): Promise<PomodoroState> {
    return this.queries.getState(user.sub, days);
  }

  @Get('sessions/active')
  async getActiveSession(
    @CurrentUser() user: JwtPayload,
  ): Promise<PomodoroSession | null> {
    return this.queries.getActiveSession(user.sub);
  }

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  async startSession(
    @CurrentUser() user: JwtPayload,
    @Body() request: StartPomodoroSessionRequest,
  ): Promise<PomodoroSession> {
    return this.commands.startSession(
      user.sub,
      request.taskId ?? null,
      request.breakType ?? PomodoroBreakType.SHORT,
    );
  }

  @Patch('sessions/:id/pause')
  async pauseSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<PomodoroSession> {
    return this.commands.pauseSession(user.sub, id);
  }

  @Patch('sessions/:id/resume')
  async resumeSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<PomodoroSession> {
    return this.commands.resumeSession(user.sub, id);
  }

  @Patch('sessions/:id/complete')
  async completeSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() request: FinishPomodoroSessionRequest,
  ): Promise<PomodoroSession> {
    return this.commands.completeSession(
      user.sub,
      id,
      request.actualFocusSeconds,
      request.actualBreakSeconds,
    );
  }

  @Patch('sessions/:id/interrupt')
  async interruptSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() request: FinishPomodoroSessionRequest,
  ): Promise<PomodoroSession> {
    return this.commands.interruptSession(
      user.sub,
      id,
      request.actualFocusSeconds,
      request.actualBreakSeconds,
    );
  }

  @Patch('sessions/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<PomodoroSession> {
    return this.commands.cancelSession(user.sub, id);
  }

  @Get('summary')
  async getSummary(
    @CurrentUser() user: JwtPayload,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ): Promise<PomodoroSummary> {
    return this.queries.getSummary(user.sub, days);
  }
}
