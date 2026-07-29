import { User } from "../../../../users/domain/entities/user.entity";

export abstract class GetCurrentUserPort {
  abstract execute(userId: string): Promise<User>;
}
