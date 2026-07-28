import { Theme } from "../../domain/enums/theme.enum";
import { BackgroundMotion } from "../../domain/enums/background-motion.enum";

export class UpdateThemeCommand {
  constructor(
    public readonly userId: string,
    public readonly theme: Theme,
    public readonly backgroundMotion?: BackgroundMotion,
  ) {}
}
