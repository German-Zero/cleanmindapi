import {
  SaveWhiteboardDocument,
  WhiteboardDocument,
} from '../models/whiteboard.model';

export abstract class WhiteboardRepository {
  abstract findByUserId(userId: string): Promise<WhiteboardDocument | null>;
  abstract upsert(
    userId: string,
    document: SaveWhiteboardDocument,
  ): Promise<WhiteboardDocument>;
}
