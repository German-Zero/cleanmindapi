export const WHITEBOARD_VERSION = 3 as const;

export interface WhiteboardPoint {
  x: number;
  y: number;
}

interface WhiteboardElementBase {
  id: string;
  color: string;
}

export interface WhiteboardPathElement extends WhiteboardElementBase {
  type: 'path';
  points: WhiteboardPoint[];
  strokeWidth: number;
}

export interface WhiteboardShapeElement extends WhiteboardElementBase {
  type: 'rectangle' | 'circle' | 'arrow' | 'line';
  start: WhiteboardPoint;
  end: WhiteboardPoint;
  strokeWidth: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
}

export interface WhiteboardTextElement extends WhiteboardElementBase {
  type: 'text';
  position: WhiteboardPoint;
  text: string;
  font: 'subtle' | 'elegant' | 'sans';
  size: number;
}

export type WhiteboardElement =
  | WhiteboardPathElement
  | WhiteboardShapeElement
  | WhiteboardTextElement;

export interface WhiteboardDocument {
  version: typeof WHITEBOARD_VERSION;
  elements: WhiteboardElement[];
  backgroundImage: string | null;
  savedColors: string[];
  updatedAt: Date | null;
}

export type SaveWhiteboardDocument = Omit<WhiteboardDocument, 'updatedAt'>;
