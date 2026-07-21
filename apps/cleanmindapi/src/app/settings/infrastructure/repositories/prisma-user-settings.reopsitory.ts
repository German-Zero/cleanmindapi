import { Injectable } from "@nestjs/common";
import { UserSettingsRepository } from "../../domain/repositories/user-settings.repository";
import { PrismaService } from "../../../shared/infrastructure/prisma/prisma.service";
import { UserSettings } from "../../domain/entities/user-settings.entity";
import { UserSettingsMapper } from "../mappers/user-settings.mapper";

@Injectable()
export class PrismaUserSettingsRepository implements UserSettingsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByUserId(userId: string): Promise<UserSettings | null> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId, },
    });

    return settings
      ? UserSettingsMapper.toDomain(settings)
      : null;
  }

  async create(settings: UserSettings): Promise<UserSettings> {
    const created = await this.prisma.userSettings.create({
      data: UserSettingsMapper.toCreatePersistence(settings)
    })

    return UserSettingsMapper.toDomain(created)
  }

  async update(settings: UserSettings): Promise<UserSettings> {
    const updated = await this.prisma.userSettings.update({
      where: { userId: settings.userId },
      data: UserSettingsMapper.toUpdatePersistence(settings),
    });

    return UserSettingsMapper.toDomain(updated)
  }
}
