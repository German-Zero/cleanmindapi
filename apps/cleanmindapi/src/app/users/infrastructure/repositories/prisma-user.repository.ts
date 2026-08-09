import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { PrismaService } from "../../../shared/infrastructure/prisma/prisma.service";
import { UserMapper } from "../mappers/user.mapper";
import { UserCapacityReachedException } from "../../domain/exceptions/user-capacity-reached.exception";

const BETA_REGISTRATION_LOCK_NAMESPACE = 20_260_806;
const BETA_REGISTRATION_LOCK_KEY = 1;

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  count(): Promise<number> {
    return this.prisma.user.count();
  }

  async createWithinLimit(user: User, maxUsers: number): Promise<User> {
    const created = await this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw<Array<{ lock: string }>>`
        SELECT pg_advisory_xact_lock(
          ${BETA_REGISTRATION_LOCK_NAMESPACE}::integer,
          ${BETA_REGISTRATION_LOCK_KEY}::integer
        )::text AS lock
      `;

      const userCount = await transaction.user.count();
      if (userCount >= maxUsers) {
        throw new UserCapacityReachedException(maxUsers);
      }

      return transaction.user.create({
        data: UserMapper.toPersistence(user),
      });
    });

    return UserMapper.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: {
        id: user.id!,
      },
      data: UserMapper.toPersistence(user),
    });

    return UserMapper.toDomain(updated);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async existsById(id: string): Promise<boolean> {
  const user = await this.prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  return !!user;
}

  async findByEmail(email: Email): Promise<User |null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
      select: {
        id: true,
      },
    });

    return !!user;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
