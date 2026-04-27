import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { TicketStatus, UserRole } from '@repo/types';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import type { CreateTicketDto } from './dto/create-ticket.dto';
import type { UpdateTicketDto } from './dto/update-ticket.dto';
import type { TicketQueryDto } from './dto/ticket-query.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { LogsService, AuditAction } from '../logs/logs.service';

const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.OPEN, TicketStatus.DONE],
  [TicketStatus.DONE]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [],
};

const ticketSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  category: true,
  dueDate: true,
  reporterId: true,
  reporter: { select: { id: true, name: true, avatarUrl: true } },
  assigneeId: true,
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  aiCategory: true,
  aiPriority: true,
  aiSummary: true,
  aiProcessedAt: true,
  _count: { select: { tasks: true } },
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly logs: LogsService,
  ) {}

  async create(dto: CreateTicketDto, reporter: AuthUser) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        category: dto.category,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        reporterId: reporter.id,
      },
      select: ticketSelect,
    });

    void this.notifications.onTicketCreated(ticket);
    if (ticket.assigneeId) {
      void this.notifications.onTicketAssigned(ticket, null);
    }

    this.logs.log({
      action: AuditAction.CREATED,
      entityType: 'TICKET',
      entityId: ticket.id,
      userId: reporter.id,
      metadata: { title: ticket.title, priority: ticket.priority },
    });
    if (ticket.assigneeId) {
      this.logs.log({
        action: AuditAction.ASSIGNED,
        entityType: 'TICKET',
        entityId: ticket.id,
        userId: reporter.id,
        metadata: { assigneeId: ticket.assigneeId },
      });
    }

    return ticket;
  }

  async findAll(query: TicketQueryDto) {
    const {
      status,
      priority,
      category,
      assigneeId,
      search,
      overdue,
      dueBefore,
      dueAfter,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    // Build dueDate range filter; dueBefore/dueAfter override the overdue implicit lt
    const dueDateFilter: { lt?: Date; gt?: Date } = {};
    if (overdue) dueDateFilter.lt = new Date();
    if (dueBefore) dueDateFilter.lt = new Date(dueBefore);
    if (dueAfter) dueDateFilter.gt = new Date(dueAfter);

    // overdue implies status not closed — unless caller explicitly picked a status
    const statusCondition = status
      ? { status }
      : overdue
        ? { status: { notIn: [TicketStatus.DONE, TicketStatus.CLOSED] } }
        : {};

    const where = {
      deletedAt: null,
      ...statusCondition,
      ...(priority && { priority }),
      ...(category && { category }),
      ...(assigneeId && { assigneeId }),
      ...(Object.keys(dueDateFilter).length > 0 && { dueDate: dueDateFilter }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        select: ticketSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, deletedAt: null },
      select: ticketSelect,
    });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, requester: AuthUser) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, reporterId: true, assigneeId: true },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);

    const isPrivileged =
      requester.role === UserRole.ADMIN || requester.role === UserRole.MANAGER;
    const isInvolved =
      ticket.reporterId === requester.id || ticket.assigneeId === requester.id;

    if (!isPrivileged && !isInvolved) {
      throw new ForbiddenException('You do not have permission to update this ticket');
    }

    if (dto.status !== undefined && dto.status !== (ticket.status as unknown as TicketStatus)) {
      const allowed = VALID_TRANSITIONS[ticket.status as unknown as TicketStatus];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${ticket.status} to ${dto.status}`,
        );
      }
    }

    const previousAssigneeId = ticket.assigneeId;
    const previousStatus = ticket.status;

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        }),
      },
      select: ticketSelect,
    });

    const changedFields = Object.keys(dto).filter((k) => (dto as Record<string, unknown>)[k] !== undefined);
    if (changedFields.length > 0) {
      this.logs.log({
        action: AuditAction.UPDATED,
        entityType: 'TICKET',
        entityId: updated.id,
        userId: requester.id,
        metadata: { fields: changedFields },
      });
    }

    if (dto.assigneeId !== undefined && updated.assigneeId !== previousAssigneeId) {
      void this.notifications.onTicketAssigned(updated, previousAssigneeId);
      this.logs.log({
        action: AuditAction.ASSIGNED,
        entityType: 'TICKET',
        entityId: updated.id,
        userId: requester.id,
        metadata: { assigneeId: updated.assigneeId },
      });
    }

    if (dto.status !== undefined && dto.status !== (previousStatus as unknown as TicketStatus)) {
      void this.notifications.onTicketStatusChanged(updated, previousStatus);
      this.logs.log({
        action: AuditAction.STATUS_CHANGED,
        entityType: 'TICKET',
        entityId: updated.id,
        userId: requester.id,
        metadata: { from: previousStatus, to: updated.status },
      });
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, title: true },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);

    await this.prisma.ticket.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logs.log({
      action: AuditAction.DELETED,
      entityType: 'TICKET',
      entityId: id,
      userId,
      metadata: { title: ticket.title },
    });
  }
}
