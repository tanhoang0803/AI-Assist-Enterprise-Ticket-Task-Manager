'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { TicketStatus } from '@repo/types';
import { useKanbanTickets, useMoveTicket } from '../hooks/useKanban';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { Ticket } from '@/services/tickets';

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: TicketStatus.OPEN, label: 'Open' },
  { status: TicketStatus.IN_PROGRESS, label: 'In Progress' },
  { status: TicketStatus.DONE, label: 'Done' },
];

const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.OPEN, TicketStatus.DONE],
  [TicketStatus.DONE]: [TicketStatus.IN_PROGRESS],
  [TicketStatus.CLOSED]: [],
};

const COLUMN_IDS = new Set<string>(COLUMNS.map((c) => c.status));

export function KanbanBoard() {
  const { data, isLoading, isError } = useKanbanTickets();
  const { mutate: moveTicket } = useMoveTicket();
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const tickets = data?.data ?? [];
  const byStatus = (status: TicketStatus) => tickets.filter((t) => t.status === status);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTicket((active.data.current as { ticket?: Ticket })?.ticket ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTicket(null);
    if (!over) return;

    const ticket = (active.data.current as { ticket?: Ticket })?.ticket;
    if (!ticket) return;

    // Resolve target column: over.id is either a column status or a card id
    const targetStatus: TicketStatus = COLUMN_IDS.has(String(over.id))
      ? (over.id as TicketStatus)
      : (tickets.find((t) => t.id === over.id)?.status ?? ticket.status);

    if (ticket.status === targetStatus) return;

    const allowed = VALID_TRANSITIONS[ticket.status] ?? [];
    if (!allowed.includes(targetStatus)) return;

    moveTicket({ id: ticket.id, status: targetStatus });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Loading board...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-500">
        Failed to load tickets.
      </div>
    );
  }

  const allowedTargets = activeTicket
    ? new Set([...VALID_TRANSITIONS[activeTicket.status], activeTicket.status])
    : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {COLUMNS.map(({ status, label }) => (
          <KanbanColumn
            key={status}
            id={status}
            label={label}
            tickets={byStatus(status)}
            isDropDisabled={!!allowedTargets && !allowedTargets.has(status)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeTicket && <KanbanCard ticket={activeTicket} overlay />}
      </DragOverlay>
    </DndContext>
  );
}
