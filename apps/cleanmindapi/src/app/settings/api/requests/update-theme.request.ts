import { IsEnum, IsOptional } from "class-validator";
import { Theme } from "../../domain/enums/theme.enum";
import { BackgroundMotion } from "../../domain/enums/background-motion.enum";

export class UpdateThemeRequest {
  @IsEnum(Theme)
  theme!: Theme;

  @IsOptional()
  @IsEnum(BackgroundMotion)
  backgroundMotion?: BackgroundMotion;
}
