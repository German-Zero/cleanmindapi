import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CraeteTaskRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsBoolean()
  isImportant!: boolean;

  @IsBoolean()
  isUrgent!: boolean;

  @IsDateString()
  dueDate?: string;
}
