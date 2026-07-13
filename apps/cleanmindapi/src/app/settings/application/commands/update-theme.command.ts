import { Theme } from "../../domain/enums/theme.enum";

export class UpdateThemeCommand {
  constructor(
    public readonly userId: string,
    public readonly theme: Theme,
  ) {}
}
