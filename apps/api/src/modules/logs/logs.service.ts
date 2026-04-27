import { Injectable, Logger } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma/prisma.service';
import type { LogQueryDto } from './dto/log-query.dto';

const logSelect = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  userId: true,
  user: { select: { id: true, name: true, avatarUrl: true } },
  createdAt: true,
} as const;

export { AuditAction };

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  log(params: {
    action: AuditAction;
    entityType: string;
    entityId: string;
    userId: string;
    metadata?: Record<string, unknown>;
  }): void {
    void this.prisma.auditLog
      .create({
        data: {
          ...params,
          metadata: params.metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch((err: unknown) => this.logger.error('Failed to write audit log', err));
  }

  async findAll(query: LogQueryDto) {
    const { entityType, entityId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        select: logSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
