import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsIn,
  IsInt,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  SaveWhiteboardDocument,
  WHITEBOARD_VERSION,
  WhiteboardElement,
  WhiteboardPoint,
} from '../../domain/models/whiteboard.model';

const SHAPES = ['rectangle', 'circle', 'arrow', 'line'];

class WhiteboardPointRequest implements WhiteboardPoint {
  @IsNumber({ allowInfinity: false, allowNaN: false })
  x!: number;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  y!: number;
}

class WhiteboardElementRequest {
  @IsString()
  @MaxLength(100)
  id!: string;

  @IsIn(['path', 'rectangle', 'circle', 'arrow', 'line', 'text'])
  type!: WhiteboardElement['type'];

  @Matches(/^#[0-9a-fA-F]{6}$/)
  color!: string;

  @ValidateIf((element) => element.type === 'path')
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20_000)
  @ValidateNested({ each: true })
  @Type(() => WhiteboardPointRequest)
  points?: WhiteboardPointRequest[];

  @ValidateIf((element) => SHAPES.includes(element.type))
  @IsDefined()
  @ValidateNested()
  @Type(() => WhiteboardPointRequest)
  start?: WhiteboardPointRequest;

  @ValidateIf((element) => SHAPES.includes(element.type))
  @IsDefined()
  @ValidateNested()
  @Type(() => WhiteboardPointRequest)
  end?: WhiteboardPointRequest;

  @ValidateIf((element) => element.type !== 'text')
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(1)
  @Max(100)
  strokeWidth?: number;

  @IsOptional()
  @IsIn(['solid', 'dashed', 'dotted'])
  strokeStyle?: 'solid' | 'dashed' | 'dotted';

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(500)
  cornerRadius?: number;

  @ValidateIf((element) => element.type === 'text')
  @IsDefined()
  @ValidateNested()
  @Type(() => WhiteboardPointRequest)
  position?: WhiteboardPointRequest;

  @ValidateIf((element) => element.type === 'text')
  @IsString()
  @MaxLength(5000)
  text?: string;

  @ValidateIf((element) => element.type === 'text')
  @IsIn(['subtle', 'elegant', 'sans'])
  font?: 'subtle' | 'elegant' | 'sans';

  @ValidateIf((element) => element.type === 'text')
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(8)
  @Max(300)
  size?: number;
}

export class SaveWhiteboardRequest implements SaveWhiteboardDocument {
  @IsInt()
  @Equals(WHITEBOARD_VERSION)
  version!: typeof WHITEBOARD_VERSION;

  @IsArray()
  @ArrayMaxSize(10_000)
  @ValidateNested({ each: true })
  @Type(() => WhiteboardElementRequest)
  elements!: WhiteboardElement[];

  @ValidateIf((_document, value) => value !== null)
  @IsString()
  @MaxLength(5_000_000)
  backgroundImage!: string | null;

  @IsArray()
  @ArrayMaxSize(5)
  @Matches(/^#[0-9a-fA-F]{6}$/, { each: true })
  savedColors!: string[];
}
