import { IsBoolean, IsEnum } from "class-validator";
import { MotivationFrequency } from "../../domain/enums/motivation-frequency.enum";

export class UpdateMotivationalPreferencesRequest {
  @IsBoolean()
  motivationalMessages!: boolean;

  @IsEnum(MotivationFrequency)
  motivationFrequency!: MotivationFrequency
}
