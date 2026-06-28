import { User } from "../../domain/entities/user.entities";
import { User as PrismaUser } from "@prisma/client";

export class UserMapper {
  static toDomain(user: PrismaUser,): User {
    return new User(
      user.id,
      user.email,
      user.passwordHash,
      user.firstName,
      user.lastName,
      user.emailVerified,
      user.createdAt,
      user.updatedAt
    );
  }
}
