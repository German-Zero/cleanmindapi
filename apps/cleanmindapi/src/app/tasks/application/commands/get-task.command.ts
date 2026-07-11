export class GetTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly userId: string,
  ) {}
}
