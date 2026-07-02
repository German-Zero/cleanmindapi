import { User } from "../entities/user.entity";
import { Email } from "../value-objects/email.vo";

export abstract class UserRepository {
  abstract create(user: User): Promise<User>;
  abstract update(user: User): Promise<User>;
  abstract findById(id: string): Promise<User | null>
  abstract existsById(id: string): Promise<boolean>;
  abstract findByEmail(email: Email): Promise<User | null>
  abstract existsByEmail(email: Email): Promise<boolean>
  abstract delete(id: string): Promise<void>
}
