
import { NotificationFrequency } from '../enums/notification-frequency.enum';
import { MotivationFrequency } from '../enums/motivation-frequency.enum';
import { Theme } from '../enums/theme.enum';

interface UserSettingsProps {
  id?: string;

  userId: string;

  theme: Theme;

  emailNotifications: boolean;
  whatsappNotifications: boolean;
  discordNotifications: boolean;

  taskNotificationFrequency: NotificationFrequency;

  motivationalMessages: boolean;
  motivationFrequency: MotivationFrequency;

  createdAt?: Date;
  updatedAt?: Date;
}

export class UserSettings {
  private readonly _id?: string;

  private readonly _userId: string;

  private _theme: Theme;

  private _emailNotifications: boolean;
  private _whatsappNotifications: boolean;
  private _discordNotifications: boolean;

  private _taskNotificationFrequency: NotificationFrequency;

  private _motivationalMessages: boolean;
  private _motivationFrequency: MotivationFrequency;

  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    props: UserSettingsProps,
  ) {
    this._id = props.id;

    this._userId = props.userId;

    this._theme = props.theme;

    this._emailNotifications =
      props.emailNotifications;

    this._whatsappNotifications =
      props.whatsappNotifications;

    this._discordNotifications =
      props.discordNotifications;

    this._taskNotificationFrequency =
      props.taskNotificationFrequency;

    this._motivationalMessages =
      props.motivationalMessages;

    this._motivationFrequency =
      props.motivationFrequency;

    this._createdAt =
      props.createdAt ?? new Date();

    this._updatedAt =
      props.updatedAt ?? new Date();
  }

  static createDefault(
    userId: string,
  ): UserSettings {
    return new UserSettings({
      userId,

      theme: Theme.LUNAR_MIND,

      emailNotifications: true,
      whatsappNotifications: false,
      discordNotifications: false,

      taskNotificationFrequency:
        NotificationFrequency.DAILY,

      motivationalMessages: true,
      motivationFrequency:
        MotivationFrequency.DAILY,
    });
  }

  static restore(
    props: UserSettingsProps,
  ): UserSettings {
    return new UserSettings(props);
  }

  changeTheme(theme: Theme): void {
    this._theme = theme;

    this.touch();
  }

  updateNotificationChannels(
    email: boolean,
    whatsapp: boolean,
    discord: boolean,
  ): void {
    this._emailNotifications = email;
    this._whatsappNotifications = whatsapp;
    this._discordNotifications = discord;

    this.touch();
  }

  changeTaskNotificationFrequency(
    frequency: NotificationFrequency,
  ): void {
    this._taskNotificationFrequency = frequency;

    this.touch();
  }

  updateMotivationalMessages(
    enabled: boolean,
    frequency: MotivationFrequency,
  ): void {
    this._motivationalMessages = enabled;

    this._motivationFrequency = enabled
      ? frequency
      : MotivationFrequency.DISABLED;

    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  get id(): string | undefined {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get theme(): Theme {
    return this._theme;
  }

  get emailNotifications(): boolean {
    return this._emailNotifications;
  }

  get whatsappNotifications(): boolean {
    return this._whatsappNotifications;
  }

  get discordNotifications(): boolean {
    return this._discordNotifications;
  }

  get taskNotificationFrequency(): NotificationFrequency {
    return this._taskNotificationFrequency;
  }

  get motivationalMessages(): boolean {
    return this._motivationalMessages;
  }

  get motivationFrequency(): MotivationFrequency {
    return this._motivationFrequency;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
