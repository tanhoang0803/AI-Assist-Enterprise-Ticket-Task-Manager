'use client';

import { timeAgo } from '@repo/utils';
import { useTicketLogs } from '../hooks/useLogs';
import type { AuditLogEntry } from '@/services/logs';

interface Props {
  ticketId: string;
}

function actionLabel(entry: AuditLogEntry): string {
  const m = entry.metadata ?? {};
  switch (entry.action) {
    case 'CREATED':
      return entry.entityType === 'TASK' ? 'Created a task' : 'Created this ticket';
    case 'UPDATED':
      return entry.entityType === 'TASK' ? 'Updated a task' : 'Updated this ticket';
    case 'DELETED':
      return entry.entityType === 'TASK' ? 'Deleted a task' : 'Deleted this ticket';
    case 'STATUS_CHANGED': {
      const from = String(m.from ?? '');
      const to = String(m.to ?? '');
      return `Status: ${from} → ${to}`;
    }
    case 'ASSIGNED':
      return 'Assigned ticket';
    case 'UNASSIGNED':
      return 'Unassigned ticket';
    default:
      return entry.action.toLowerCase().replace('_', ' ');
  }
}

export function ActivityLog({ ticketId }: Props) {
  const { data, isLoading } = useTicketLogs(ticketId);
  const entries = data?.data ?? [];

  if (isLoading) {
    return <p className="text-sm italic text-gray-400">Loading activity...</p>;
  }

  if (entries.length === 0) {
    return <p className="text-sm italic text-gray-400">No activity yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start gap-2.5">
          {entry.user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.user.avatarUrl}
              alt={entry.user.name}
              className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
              {entry.user.name[0]?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{entry.user.name}</span>
              {' '}
              <span className="text-gray-500">{actionLabel(entry)}</span>
            </p>
            <p className="text-xs text-gray-400">{timeAgo(entry.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
