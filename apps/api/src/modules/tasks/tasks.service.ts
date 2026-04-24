import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

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

  async create(ticketId: string, dto: CreateTaskDto) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, deletedAt: null },
      select: { id: true },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

    return this.prisma.task.create({
      data: {
        title: dto.title,
        ticketId,
        assigneeId: dto.assigneeId,
      },
      select: taskSelect,
    });
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id }, select: { id: true } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
      },
      select: taskSelect,
    });
  }

  async remove(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, select: { id: true } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    await this.prisma.task.delete({ where: { id } });
  }
}
