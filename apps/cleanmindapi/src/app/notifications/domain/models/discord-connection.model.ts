export interface DiscordConnection {
  userId: string;
  discordUserId: string;
  username: string;
  globalName: string | null;
  avatarHash: string | null;
  connectedAt: Date;
}

export interface DiscordProfile {
  id: string;
  username: string;
  globalName: string | null;
  avatarHash: string | null;
}
