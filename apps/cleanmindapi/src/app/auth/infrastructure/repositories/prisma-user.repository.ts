import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { User } from "../../domain/entities/user.entities";
import { UserRepositoryPort } from "./user.repository";

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

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

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    return new User(
      created.id,
      created.email,
      created.passwordHash,
      created.firstName,
      created.lastName,
      created.emailVerified,
      created.createdAt,
      created.updatedAt
    );
  }
}
