import { TaskQuadrant } from '../enums/task-quadrant.enum';
import { TaskStatus } from '../enums/task-status.enum';

interface CreateTaskProps {
  userId: string;
  title: string;
  description?: string | null;
  isImportant: boolean;
  isUrgent: boolean;
  dueDate?: Date | null;
}

export class Task {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private _title: string,
    private _description: string | null,
    private _isImportant: boolean,
    private _isUrgent: boolean,
    private _quadrant: TaskQuadrant,
    private _status: TaskStatus,
    private _dueDate: Date | null,
    private _completedAt: Date | null,
    public readonly _createdAt: Date | null,
    private _updatedAt: Date | null,
  ) {}

  static create(props: CreateTaskProps): Task {
      return new Task(
          null,
          props.userId,
          props.title,
          props.description ?? null,
          props.isImportant,
          props.isUrgent,
          this.calculateQuadrant(
              props.isImportant,
              props.isUrgent,
          ),
          TaskStatus.TODO,
          props.dueDate ?? null,
          null,
          null,
          null,
      );
  }

  static restore(props: {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    isImportant: boolean;
    isUrgent: boolean;
    quadrant: TaskQuadrant;
    status: TaskStatus;
    dueDate: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return new Task(
      props.id,
      props.userId,
      props.title,
      props.description,
      props.isImportant,
      props.isUrgent,
      props.quadrant,
      props.status,
      props.dueDate,
      props.completedAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  update(data: {
    title: string;
    description?: string | null;
    isImportant: boolean;
    isUrgent: boolean;
    dueDate?: Date | null;
  }): void {

    this._title = data.title;
    this._description = data.description ?? null;

    this.updateQuadrant(
        data.isImportant,
        data.isUrgent,
    );

    this._dueDate = data.dueDate ?? null;
  }

  start(): void {
    if (this._status === TaskStatus.COMPLETED) {
      return;
    }

    this._status = TaskStatus.IN_PROGRESS;
  }

  complete(): void {
    this._status = TaskStatus.COMPLETED;

    this._completedAt = new Date();
  }

  reopen(): void {
    this._status = TaskStatus.TODO;

    this._completedAt = null;
  }

  private updateQuadrant(
    important: boolean,
    urgent: boolean,
  ): void {
      this._isImportant = important;
      this._isUrgent = urgent;

      this._quadrant = Task.calculateQuadrant(
          important,
          urgent,
      );
  }


  private static calculateQuadrant(
    important: boolean,
    urgent: boolean,
  ): TaskQuadrant {

    if (important && urgent) {
      return TaskQuadrant.DO;
    }

    if (important && !urgent) {
      return TaskQuadrant.PLAN;
    }

    if (!important && urgent) {
      return TaskQuadrant.DELEGATE;
    }

    return TaskQuadrant.DELETE;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | null {
    return this._description;
  }

  get isImportant(): boolean {
    return this._isImportant;
  }

  get isUrgent(): boolean {
    return this._isUrgent;
  }

  get quadrant(): TaskQuadrant {
    return this._quadrant;
  }

  get status(): TaskStatus {
    return this._status;
  }

  get dueDate(): Date | null {
    return this._dueDate;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get id(): string | null {
  return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get createdAt(): Date | null {
  return this._createdAt;
}

  get updatedAt(): Date | null {
    return this._updatedAt;
  }

}
