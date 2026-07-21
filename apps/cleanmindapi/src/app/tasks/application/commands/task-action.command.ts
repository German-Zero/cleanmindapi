export class TaskActionCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string
  ) {}
}
