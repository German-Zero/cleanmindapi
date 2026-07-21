import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { PomodoroService } from '../../application/services/pomodoro.service';
import {
  PomodoroBreakType,
  PomodoroSession,
  PomodoroSettings,
  PomodoroSummary,
} from '../../domain/models/pomodoro.model';
import { FinishPomodoroSessionRequest } from '../requests/finish-pomodoro-session.request';
import { StartPomodoroSessionRequest } from '../requests/start-pomodoro-session.request';
import { UpdatePomodoroSettingsRequest } from '../requests/update-pomodoro-settings.request';

@UseGuards(JwtAuthGuard)
@Controller('pomodoro')
export class PomodoroController {
  constructor(private readonly pomodoro: PomodoroService) {}

  @Get('settings')
  async getSettings(@CurrentUser() user: JwtPayload): Promise<PomodoroSettings> {
    return this.pomodoro.getSettings(user.sub);
  }

  @Patch('settings')
  async updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() request: UpdatePomodoroSettingsRequest,
  ): Promise<PomodoroSettings> {
    return this.pomodoro.updateSettings(user.sub, request);
  }

  @Get('sessions/active')
  async getActiveSession(
    @CurrentUser() user: JwtPayload,
  ): Promise<PomodoroSession | null> {
    return this.pomodoro.getActiveSession(user.sub);
  }

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  async startSession(
    @CurrentUser() user: JwtPayload,
    @Body() request: StartPomodoroSessionRequest,
  ): Promise<PomodoroSession> {
    return this.pomodoro.startSession(
      user.sub,
      request.taskId ?? null,
      request.breakType ?? PomodoroBreakType.SHORT,
    );
  }

  @Patch('sessions/:id/complete')
  async completeSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() request: FinishPomodoroSessionRequest,
  ): Promise<PomodoroSession> {
    return this.pomodoro.completeSession(
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
    return this.pomodoro.interruptSession(
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
    return this.pomodoro.cancelSession(user.sub, id);
  }

  @Get('summary')
  async getSummary(
    @CurrentUser() user: JwtPayload,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ): Promise<PomodoroSummary> {
    return this.pomodoro.getSummary(user.sub, days);
  }
}
