import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DiscordOAuthCallbackRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  state!: string;
}
