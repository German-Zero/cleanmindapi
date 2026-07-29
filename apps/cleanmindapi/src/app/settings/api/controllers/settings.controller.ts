import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../../../shared/security/decorators/current-user.decorator";
import { JwtPayload } from "../../../auth/application/common/jwt-payload";
import { JwtAuthGuard } from "../../../shared/security/guards/jwt-auth.guard";

import { GetSettingsPort } from "../../application/ports/inbound/get-settings.port";
import { UpdateThemePort } from "../../application/ports/inbound/update-theme.port";
import { UpdateNotificationPreferencesPort } from "../../application/ports/inbound/update-notification-preferences.port";
import { UpdateMotivationalPreferencesPort } from "../../application/ports/inbound/update-motivational-preferences.port";

import { UserSettingsResponse } from "../../application/common/responses/user-settings.response";

import { UpdateNotificationPreferencesRequest } from "../requests/update-notification-preferences.request";
import { UpdateThemeRequest } from "../requests/update-theme.request";
import { UpdateMotivationalPreferencesRequest } from "../requests/update-motivational-preferences.request";

import { GetSettingsCommand } from "../../application/commands/get-settings.command";
import { UpdateThemeCommand } from "../../application/commands/update-theme.command";
import { UpdateNotificationPreferencesCommand } from "../../application/commands/update-notification-preferences.command";
import { UpdateMotivationalPreferencesCommand } from "../../application/commands/update-motivational-preferences.command";

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly getSettings: GetSettingsPort,
    private readonly updateTheme: UpdateThemePort,
    private readonly updateNotifications: UpdateNotificationPreferencesPort,
    private readonly updateMotivation: UpdateMotivationalPreferencesPort,
  ) {}

  @Get()
  async get(@CurrentUser() user: JwtPayload): Promise<UserSettingsResponse> {
    return this.getSettings.execute(new GetSettingsCommand(user.sub))
  }

  @Patch('theme')
  async updateThemePreference(
    @CurrentUser() user: JwtPayload,
    @Body() req: UpdateThemeRequest
  ): Promise<UserSettingsResponse> {
    return this.updateTheme.execute(new UpdateThemeCommand(
      user.sub,
      req.theme,
      req.backgroundMotion,
    ))
  }

  @Patch('notifications')
  async updateNotificationPreferences(
    @CurrentUser() user: JwtPayload,
    @Body() req: UpdateNotificationPreferencesRequest,
  ): Promise<UserSettingsResponse> {
    return this.updateNotifications.execute(
      new UpdateNotificationPreferencesCommand(
        user.sub,
        req.emailNotifications,
        req.whatsappNotifications,
        req.discordNotifications,
        req.taskNotificationFrequency,
      )
    )
  }

  @Patch('motivation')
  async updateMotivationPreferences(
    @CurrentUser() user: JwtPayload,
    @Body() req: UpdateMotivationalPreferencesRequest
  ): Promise<UserSettingsResponse> {
    return this.updateMotivation.execute(
      new UpdateMotivationalPreferencesCommand(
        user.sub,
        req.motivationalMessages,
        req.motivationFrequency,
      )
    )
  }
}
