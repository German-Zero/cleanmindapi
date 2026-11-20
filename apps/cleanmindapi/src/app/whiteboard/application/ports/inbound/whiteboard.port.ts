import { SaveWhiteboardDocument, WhiteboardDocument } from '../../../domain/models/whiteboard.model';

export abstract class WhiteboardPort {
  abstract get(userId: string): Promise<WhiteboardDocument>;
  abstract save(
    userId: string,
    document: SaveWhiteboardDocument,
  ): Promise<WhiteboardDocument>;
}
