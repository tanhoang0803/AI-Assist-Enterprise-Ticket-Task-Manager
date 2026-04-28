import { Test, TestingModule } from '@nestjs/testing';
import { LogsService, AuditAction } from './logs.service';
import { PrismaService } from '@database/prisma/prisma.service';

const mockPrisma = {
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('LogsService', () => {
  let service: LogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LogsService>(LogsService);
    jest.clearAllMocks();
  });

  describe('log()', () => {
    it('calls prisma.auditLog.create fire-and-forget', () => {
      mockPrisma.auditLog.create.mockResolvedValue({});

      service.log({
        action: AuditAction.CREATED,
        entityType: 'TICKET',
        entityId: 'ticket-1',
        userId: 'user-1',
        metadata: { title: 'Test ticket' },
      });

      // synchronous — create is called immediately (promise not awaited)
      expect(mockPrisma.auditLog.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: AuditAction.CREATED,
          entityType: 'TICKET',
          entityId: 'ticket-1',
          userId: 'user-1',
        }),
      });
    });

    it('swallows prisma errors without throwing', async () => {
      mockPrisma.auditLog.create.mockRejectedValue(new Error('DB down'));

      expect(() =>
        service.log({
          action: AuditAction.DELETED,
          entityType: 'TICKET',
          entityId: 'ticket-1',
          userId: 'user-1',
        }),
      ).not.toThrow();

      // allow the rejected promise's catch handler to run
      await Promise.resolve();
    });
  });

  describe('findAll()', () => {
    it('returns paginated data with meta', async () => {
      const fakeLogs = [{ id: '1', action: AuditAction.CREATED, entityType: 'TICKET', entityId: 'ticket-1', userId: 'user-1', metadata: null, user: null, createdAt: new Date() }];
      mockPrisma.auditLog.findMany.mockResolvedValue(fakeLogs);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(fakeLogs);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('filters by entityType and entityId when provided', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.findAll({ entityType: 'TICKET', entityId: 'abc', page: 1, limit: 10 });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entityType: 'TICKET', entityId: 'abc' },
          skip: 0,
          take: 10,
        }),
      );
    });
  });
});
