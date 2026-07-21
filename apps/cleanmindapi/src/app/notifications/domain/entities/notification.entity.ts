import { NotificationType } from '../enums/notification-type.enum';
import { NotificationPayloadMap } from '../models/notification-payload.model';

interface NotificationProps<
  T extends NotificationType,
> {
  recipient: string;

  type: T;

  payload: NotificationPayloadMap[T];
}

export class Notification<
  T extends NotificationType =
    NotificationType,
> {
  private readonly _recipient: string;

  private readonly _type: T;

  private readonly _payload:
    NotificationPayloadMap[T];

  private constructor(
    props: NotificationProps<T>,
  ) {
    this._recipient = props.recipient;
    this._type = props.type;
    this._payload = props.payload;
  }

  static create<
    T extends NotificationType,
  >(
    props: NotificationProps<T>,
  ): Notification<T> {
    return new Notification(props);
  }

  get recipient(): string {
    return this._recipient;
  }

  get type(): T {
    return this._type;
  }

  get payload(): Readonly<
    NotificationPayloadMap[T]
  > {
    return this._payload;
  }
}
