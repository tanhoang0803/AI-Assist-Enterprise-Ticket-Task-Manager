import { PrismaClient, UserRole, TicketStatus, TicketPriority, TicketCategory, TaskStatus, AuditAction } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Clean slate
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ─────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'TanQHoang Admin',
      role: UserRole.ADMIN,
      auth0Id: 'auth0|admin-placeholder',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      name: 'Alice Manager',
      role: UserRole.MANAGER,
      auth0Id: 'auth0|manager-placeholder',
    },
  });

  const member = await prisma.user.create({
    data: {
      email: 'member@example.com',
      name: 'Bob Member',
      role: UserRole.MEMBER,
      auth0Id: 'auth0|member-placeholder',
    },
  });

  console.log(`✓ Created 3 users`);

  // ── Tickets ────────────────────────────────────────────────
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Login page crashes on Safari',
      description: 'Users on Safari 17+ report a blank screen after submitting credentials. Happens consistently on iOS and macOS.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.CRITICAL,
      category: TicketCategory.BUG,
      reporterId: member.id,
      assigneeId: manager.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Add Kanban board drag-and-drop',
      description: 'Implement drag-and-drop functionality for the Kanban board using @dnd-kit/sortable. Columns: Open, In Progress, Done.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: TicketCategory.FEATURE,
      reporterId: manager.id,
      assigneeId: admin.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'API response time exceeds 2s on ticket list',
      description: 'GET /tickets with large datasets returns after 2-3 seconds. Needs query optimization and Redis caching.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: TicketCategory.PERFORMANCE,
      reporterId: admin.id,
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: 'Set up SendGrid email notifications',
      description: 'Integrate SendGrid to send email notifications when a ticket is assigned or its status changes.',
      status: TicketStatus.DONE,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.FEATURE,
      reporterId: manager.id,
      assigneeId: member.id,
      aiCategory: 'FEATURE',
      aiPriority: 'MEDIUM',
      aiSummary: 'Integrate SendGrid for automated email alerts on ticket assignment and status changes.',
      aiProcessedAt: new Date(),
    },
  });

  const ticket5 = await prisma.ticket.create({
    data: {
      title: 'JWT tokens exposed in browser logs',
      description: 'Console.log statements in auth middleware accidentally leak JWT tokens to browser dev tools. Security risk.',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.CRITICAL,
      category: TicketCategory.SECURITY,
      reporterId: member.id,
      assigneeId: admin.id,
    },
  });

  console.log(`✓ Created 5 tickets`);

  // ── Tasks ──────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      { title: 'Reproduce on Safari 17', ticketId: ticket1.id, status: TaskStatus.DONE, assigneeId: manager.id },
      { title: 'Check Auth0 SDK compatibility', ticketId: ticket1.id, status: TaskStatus.IN_PROGRESS, assigneeId: manager.id },
      { title: 'Write regression test', ticketId: ticket1.id, status: TaskStatus.TODO },

      { title: 'Install @dnd-kit/sortable', ticketId: ticket2.id, status: TaskStatus.DONE, assigneeId: admin.id },
      { title: 'Build draggable TicketCard', ticketId: ticket2.id, status: TaskStatus.IN_PROGRESS, assigneeId: admin.id },
      { title: 'Optimistic update on drop', ticketId: ticket2.id, status: TaskStatus.TODO },

      { title: 'Profile slow queries with EXPLAIN ANALYZE', ticketId: ticket3.id, status: TaskStatus.TODO, assigneeId: admin.id },
      { title: 'Add DB indexes', ticketId: ticket3.id, status: TaskStatus.TODO },
      { title: 'Implement Redis cache layer', ticketId: ticket3.id, status: TaskStatus.TODO },
    ],
  });

  console.log(`✓ Created tasks`);

  // ── Audit Logs ─────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { action: AuditAction.CREATED, entityType: 'TICKET', entityId: ticket1.id, userId: member.id },
      { action: AuditAction.ASSIGNED, entityType: 'TICKET', entityId: ticket1.id, userId: admin.id, metadata: { assigneeId: manager.id } },
      { action: AuditAction.CREATED, entityType: 'TICKET', entityId: ticket2.id, userId: manager.id },
      { action: AuditAction.STATUS_CHANGED, entityType: 'TICKET', entityId: ticket2.id, userId: admin.id, metadata: { from: 'OPEN', to: 'IN_PROGRESS' } },
      { action: AuditAction.CREATED, entityType: 'TICKET', entityId: ticket4.id, userId: manager.id },
      { action: AuditAction.AI_PROCESSED, entityType: 'TICKET', entityId: ticket4.id, userId: admin.id },
      { action: AuditAction.STATUS_CHANGED, entityType: 'TICKET', entityId: ticket4.id, userId: manager.id, metadata: { from: 'IN_PROGRESS', to: 'DONE' } },
    ],
  });

  console.log(`✓ Created audit logs`);
  console.log('\n✅ Seed complete');
  console.log(`   admin   → ${admin.email}`);
  console.log(`   manager → ${manager.email}`);
  console.log(`   member  → ${member.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
