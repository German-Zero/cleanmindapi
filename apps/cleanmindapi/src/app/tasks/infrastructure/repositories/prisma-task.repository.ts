import { Injectable } from "@nestjs/common";
import { TaskRepository } from "../../domain/repositories/task.repository";
import { PrismaService } from "../../../shared/infrastructure/prisma/prisma.service";
import { Task } from "../../domain/entities/task.entity";
import { TaskMapper } from "../mappers/task.mapper";
import { TaskFilters } from "../../domain/queries/task.query";

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

    async create(task: Task): Promise<Task> {
      const created = await this.prisma.task.create({
        data: TaskMapper.toCreatePersistence(task),
      });

      return TaskMapper.toDomain(created);
    }

    async update(task: Task): Promise<Task> {
      const updated = await this.prisma.task.update({
        where: {
          id: task.id!,
        },
        data: TaskMapper.toUpdatePersistence(task),
      });

      return TaskMapper.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
      await this.prisma.task.delete({
        where: {
          id,
        },
      });
    }

    async findById(id: string): Promise<Task | null> {
      const task = await this.prisma.task.findUnique({
        where: {
          id,
        },
      });

      return task
        ? TaskMapper.toDomain(task)
        : null;
    }

async findAllByUser(
    userId: string,
    filters?: TaskFilters,
): Promise<Task[]> {

    const tasks =
        await this.prisma.task.findMany({
            where: {
                userId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.quadrant && { quadrant: filters.quadrant }),
                ...(filters?.dueDate && { dueDate: filters.dueDate }),
                ...(filters?.search && { OR:
                  [
                    { title: { contains: filters.search, mode: 'insensitive' }},
                    { description: { contains: filters.search, mode: 'insensitive' }},
                  ],
                }
              ),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    return tasks.map(task =>
        TaskMapper.toDomain(task),
    );
}

    async existsById(id: string): Promise<boolean> {
      const task = await this.prisma.task.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

      return !!task;
    }
}
