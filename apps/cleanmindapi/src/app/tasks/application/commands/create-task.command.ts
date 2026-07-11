export class CreateTaskCommand {
  constructor(
    public readonly userId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly isImportant: boolean,
    public readonly isUrgent: boolean,
    public readonly dueDate: Date | null,
  ) {}
}
