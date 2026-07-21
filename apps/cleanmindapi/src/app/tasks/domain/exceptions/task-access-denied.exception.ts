import { ForbiddenException } from "@nestjs/common";

export class TaskAccessDeniedException extends ForbiddenException {
  constructor() {
    super('You do not have permission to access this task.')
  }
}
