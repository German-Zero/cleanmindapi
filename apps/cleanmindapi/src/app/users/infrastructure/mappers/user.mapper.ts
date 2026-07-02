
import { User as PrismaUser } from "@prisma/client";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { UserRole } from "../../domain/enums/user-role.enum";
import { AuthProvider } from "../../domain/enums/auth-provider.enum";


export class UserMapper {
  static toDomain(user: PrismaUser): User {
    return new User(
      user.id,
      user.name,
      new Email(user.email),
      user.passwordHash,
      user.provider as AuthProvider,
      user.role as UserRole,
      user.emailVerified,
      user.avatarUrl,
      user.createdAt,
      user.updatedAt,
      user.lastLoginAt,
    )
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      passwordHash: user.passwordHash,
      provider: user.provider,
      role: user.role,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt
    }
  }
}
