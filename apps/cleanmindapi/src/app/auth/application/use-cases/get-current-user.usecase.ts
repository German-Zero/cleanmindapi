import { Injectable } from "@nestjs/common";
import { GetCurrentUserPort } from "../ports/inbound/get-current-user.port";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { User } from "../../../users/domain/entities/user.entity";
import { UserNotFoundException } from "../../../users/domain/exceptions/user-not-found.exception";

@Injectable()
export class GetCurrentUserUseCase implements GetCurrentUserPort {
  constructor(
    private readonly users: UserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.users.findById(userId);

    if (!user) throw new UserNotFoundException();

    return user;
  }
}
