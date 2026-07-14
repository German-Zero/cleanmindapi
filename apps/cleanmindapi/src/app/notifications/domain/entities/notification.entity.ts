import { NotificationType } from "../enums/notification-type.enum";

interface NotificationProps {
  recipient: string;
  title: string;
  message: string;
  type: NotificationType
}

export class Notification {
  private readonly _recipient: string;
  private readonly _title: string;
  private readonly _message: string;
  private readonly _type: NotificationType;

  private constructor(props: NotificationProps) {
    this._recipient = props.recipient;
    this._title = props.title;
    this._message = props.message;
    this._type = props.type;
  }

  static create(props: NotificationProps): Notification {
    return new Notification(props)
  }

  get recipient(): string {
    return this._recipient;
  }

  get title(): string {
    return this._title;
  }

  get message(): string {
    return this._message;
  }

  get type(): NotificationType {
    return this._type;
  }
}
