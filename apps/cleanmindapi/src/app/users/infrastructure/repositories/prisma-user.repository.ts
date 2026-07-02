import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { PrismaService } from "../../../shared/infrastructure/prisma/prisma.service";
import { UserMapper } from "../mappers/user.mapper";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: UserMapper.toPersistence(user),
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
