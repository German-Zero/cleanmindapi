export class TaskNotFoundException extends Error {
  constructor() {
    super('Task Not Found.')
  }
}
