'use client';

import { cn } from '@repo/utils';
import { TicketStatus } from '@repo/types';

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  [TicketStatus.OPEN]: {
    label: 'Open',
    className: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  },
  [TicketStatus.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 ring-amber-700/10',
  },
  [TicketStatus.DONE]: {
    label: 'Done',
    className: 'bg-green-50 text-green-700 ring-green-700/10',
  },
  [TicketStatus.CLOSED]: {
    label: 'Closed',
    className: 'bg-gray-50 text-gray-600 ring-gray-700/10',
  },
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
