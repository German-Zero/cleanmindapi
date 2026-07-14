import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './dashboard/dashboard.module';
import { TaskModule } from './tasks/tasks.module';
import { SettingsModule } from './settings/settings.module';

import config from './shared/infrastructure/config';
import { NotificationModule } from './notifications/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      cache: true,
      expandVariables: true,
    }),
    UsersModule,
    AuthModule,
    SharedModule,
    SettingsModule,
    TaskModule,
    DashboardModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
