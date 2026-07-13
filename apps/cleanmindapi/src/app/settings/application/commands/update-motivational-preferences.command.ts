import { MotivationFrequency } from "../../domain/enums/motivation-frequency.enum";

export class UpdateMotivationalPreferencesCommand {
  constructor(
    public readonly userId: string,
    public readonly motivationalMessages: boolean,
    public readonly motivationFrequency: MotivationFrequency
  ) {}
}
