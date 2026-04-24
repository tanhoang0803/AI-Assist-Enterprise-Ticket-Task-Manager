'use client';

import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TicketStatus } from '@repo/types';
import { isOverdue, formatDate } from '@repo/utils';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import type { Ticket } from '@/services/tickets';

interface Props {
  ticket: Ticket;
  overlay?: boolean;
}

export function KanbanCard({ ticket, overlay = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { ticket },
    disabled: overlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDateOverdue =
    ticket.dueDate &&
    isOverdue(ticket.dueDate) &&
    ticket.status !== TicketStatus.DONE &&
    ticket.status !== TicketStatus.CLOSED;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm select-none cursor-grab active:cursor-grabbing transition-opacity ${
        isDragging ? 'opacity-30' : ''
      } ${overlay ? 'rotate-1 shadow-xl opacity-95' : ''}`}
    >
      <Link
        href={`/tickets/${ticket.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 leading-snug"
        tabIndex={-1}
      >
        {ticket.title}
      </Link>

      <div className="mt-2 flex items-center justify-between gap-2">
        <TicketPriorityBadge priority={ticket.priority} />
        {ticket.dueDate && (
          <span
            className={`text-xs ${dueDateOverdue ? 'font-medium text-red-600' : 'text-gray-400'}`}
          >
            {formatDate(ticket.dueDate)}
          </span>
        )}
      </div>

      {ticket.assignee && (
        <p className="mt-1.5 truncate text-xs text-gray-400">{ticket.assignee.name}</p>
      )}
    </div>
  );
}
