import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { LogsService, AuditAction } from '../logs/logs.service';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';

const taskSelect = {
  id: true,
  title: true,
  status: true,
  ticketId: true,
  assigneeId: true,
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: LogsService,
  ) {}

  async findByTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, deletedAt: null },
      select: { id: true },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

    return this.prisma.task.findMany({
      where: { ticketId },
      select: taskSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(ticketId: string, dto: CreateTaskDto, userId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, deletedAt: null },
      select: { id: true },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        ticketId,
        assigneeId: dto.assigneeId,
      },
      select: taskSelect,
    });

    this.logs.log({
      action: AuditAction.CREATED,
      entityType: 'TASK',
      entityId: task.id,
      userId,
      metadata: { title: task.title, ticketId },
    });

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, select: { id: true } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
      },
      select: taskSelect,
    });

    const changedFields = Object.keys(dto).filter((k) => (dto as Record<string, unknown>)[k] !== undefined);
    if (changedFields.length > 0) {
      this.logs.log({
        action: AuditAction.UPDATED,
        entityType: 'TASK',
        entityId: id,
        userId,
        metadata: { fields: changedFields },
      });
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true, title: true, ticketId: true },
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    await this.prisma.task.delete({ where: { id } });

    this.logs.log({
      action: AuditAction.DELETED,
      entityType: 'TASK',
      entityId: id,
      userId,
      metadata: { title: task.title, ticketId: task.ticketId },
    });
  }
}
