import { User } from "../../domain/entities/user.entities";

export abstract class UserRepositoryPort {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(user: User): Promise<User>;
}
