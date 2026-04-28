import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PrismaService } from '@database/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LogsService } from '../logs/logs.service';
import { TicketProducer } from '../ai/producers/ticket.producer';
import { TicketStatus, UserRole } from '@repo/types';
import type { AuthUser } from '@common/decorators/current-user.decorator';

const mockPrisma = {
  ticket: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

const mockNotifications = {
  onTicketCreated: jest.fn().mockResolvedValue(undefined),
  onTicketAssigned: jest.fn().mockResolvedValue(undefined),
  onTicketStatusChanged: jest.fn().mockResolvedValue(undefined),
};

const mockLogs = { log: jest.fn() };

const mockAiProducer = { enqueueAnalysis: jest.fn().mockResolvedValue(undefined) };

const adminUser: AuthUser = { id: 'user-admin', email: 'admin@test.com', name: 'Admin', sub: 'auth0|admin', role: UserRole.ADMIN };
const regularUser: AuthUser = { id: 'user-1', email: 'user@test.com', name: 'User', sub: 'auth0|user1', role: UserRole.MEMBER };

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: LogsService, useValue: mockLogs },
        { provide: TicketProducer, useValue: mockAiProducer },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    jest.clearAllMocks();
  });

  describe('findAll()', () => {
    it('returns paginated tickets with meta', async () => {
      const fakeTickets = [{ id: '1', title: 'Bug report', status: 'OPEN' }];
      mockPrisma.ticket.findMany.mockResolvedValue(fakeTickets);
      mockPrisma.ticket.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(fakeTickets);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('calculates skip correctly for page 2', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([]);
      mockPrisma.ticket.count.mockResolvedValue(0);

      await service.findAll({ page: 2, limit: 10 });

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('findOne()', () => {
    it('returns ticket when found', async () => {
      const ticket = { id: 'ticket-1', title: 'Test' };
      mockPrisma.ticket.findFirst.mockResolvedValue(ticket);

      const result = await service.findOne('ticket-1');

      expect(result).toEqual(ticket);
    });

    it('throws NotFoundException when ticket does not exist', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create()', () => {
    it('creates ticket and fires notifications + AI analysis', async () => {
      const ticket = {
        id: 'ticket-1',
        title: 'New bug',
        description: null,
        status: 'OPEN',
        priority: 'HIGH',
        assigneeId: null,
        reporterId: regularUser.id,
      };
      mockPrisma.ticket.create.mockResolvedValue(ticket);

      const result = await service.create(
        { title: 'New bug', priority: 'HIGH' as never, category: 'BUG' as never },
        regularUser,
      );

      expect(result).toEqual(ticket);
      expect(mockNotifications.onTicketCreated).toHaveBeenCalledTimes(1);
      expect(mockAiProducer.enqueueAnalysis).toHaveBeenCalledWith('ticket-1', 'New bug', null);
      expect(mockLogs.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityId: 'ticket-1', userId: regularUser.id }),
      );
    });
  });

  describe('update()', () => {
    it('throws ForbiddenException for unrelated user', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue({
        id: 'ticket-1',
        status: 'OPEN',
        reporterId: 'other-user',
        assigneeId: null,
      });

      await expect(
        service.update('ticket-1', { title: 'changed' }, regularUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException for invalid status transition', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue({
        id: 'ticket-1',
        status: 'OPEN',
        reporterId: regularUser.id,
        assigneeId: null,
      });

      await expect(
        service.update('ticket-1', { status: TicketStatus.CLOSED }, regularUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows admin to update any ticket', async () => {
      const updated = { id: 'ticket-1', title: 'Updated', status: 'OPEN', assigneeId: null };
      mockPrisma.ticket.findFirst.mockResolvedValue({
        id: 'ticket-1',
        status: 'OPEN',
        reporterId: 'other-user',
        assigneeId: null,
      });
      mockPrisma.ticket.update.mockResolvedValue(updated);

      const result = await service.update('ticket-1', { title: 'Updated' }, adminUser);

      expect(result).toEqual(updated);
    });
  });

  describe('remove()', () => {
    it('soft-deletes ticket and writes audit log', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue({ id: 'ticket-1', title: 'Old ticket' });
      mockPrisma.ticket.update.mockResolvedValue({});

      await service.remove('ticket-1', adminUser.id);

      expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
      );
      expect(mockLogs.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityId: 'ticket-1', userId: adminUser.id }),
      );
    });

    it('throws NotFoundException when ticket not found', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue(null);

      await expect(service.remove('nonexistent', adminUser.id)).rejects.toThrow(NotFoundException);
    });
  });
});
