import { Injectable } from '@nestjs/common';
import {
  SaveWhiteboardDocument,
  WHITEBOARD_VERSION,
  WhiteboardDocument,
} from '../../domain/models/whiteboard.model';
import { WhiteboardRepository } from '../../domain/repositories/whiteboard.repository';

@Injectable()
export class WhiteboardService {
  constructor(private readonly repository: WhiteboardRepository) {}

  async get(userId: string): Promise<WhiteboardDocument> {
    return (
      (await this.repository.findByUserId(userId)) ?? {
        version: WHITEBOARD_VERSION,
        elements: [],
        backgroundImage: null,
        savedColors: [],
        updatedAt: null,
      }
    );
  }

  async save(
    userId: string,
    document: SaveWhiteboardDocument,
  ): Promise<WhiteboardDocument> {
    return this.repository.upsert(userId, document);
  }
}
