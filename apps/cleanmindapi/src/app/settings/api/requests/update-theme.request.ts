import { IsEnum } from "class-validator";
import { Theme } from "../../domain/enums/theme.enum";

export class UpdateThemeRequest {
  @IsEnum(Theme)
  theme!: Theme;
}
