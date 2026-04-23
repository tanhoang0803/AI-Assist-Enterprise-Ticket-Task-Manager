'use client';

import { cn } from '@repo/utils';
import { TicketPriority } from '@repo/types';

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  [TicketPriority.LOW]: {
    label: 'Low',
    className: 'bg-gray-50 text-gray-600 ring-gray-700/10',
  },
  [TicketPriority.MEDIUM]: {
    label: 'Medium',
    className: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  },
  [TicketPriority.HIGH]: {
    label: 'High',
    className: 'bg-orange-50 text-orange-700 ring-orange-700/10',
  },
  [TicketPriority.CRITICAL]: {
    label: 'Critical',
    className: 'bg-red-50 text-red-700 ring-red-700/10',
  },
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = priorityConfig[priority];
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
