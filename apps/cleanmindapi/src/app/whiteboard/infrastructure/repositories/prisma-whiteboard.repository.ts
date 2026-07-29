import { Injectable } from '@nestjs/common';
import { Prisma, Whiteboard } from '@prisma/client';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import {
  SaveWhiteboardDocument,
  WhiteboardDocument,
  WhiteboardElement,
} from '../../domain/models/whiteboard.model';
import { WhiteboardRepository } from '../../domain/repositories/whiteboard.repository';

@Injectable()
export class PrismaWhiteboardRepository implements WhiteboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<WhiteboardDocument | null> {
    const document = await this.prisma.whiteboard.findUnique({
      where: { userId },
    });

    return document ? this.toDomain(document) : null;
  }

  async upsert(
    userId: string,
    document: SaveWhiteboardDocument,
  ): Promise<WhiteboardDocument> {
    const data = {
      version: document.version,
      elements: document.elements as unknown as Prisma.InputJsonValue,
      backgroundImage: document.backgroundImage,
      savedColors: document.savedColors,
    };
    const saved = await this.prisma.whiteboard.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    return this.toDomain(saved);
  }

  private toDomain(document: Whiteboard): WhiteboardDocument {
    return {
      version: 3,
      elements: document.elements as unknown as WhiteboardElement[],
      backgroundImage: document.backgroundImage,
      savedColors: document.savedColors,
      updatedAt: document.updatedAt,
    };
  }
}
