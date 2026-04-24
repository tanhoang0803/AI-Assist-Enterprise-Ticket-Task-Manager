'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TicketStatus, TicketPriority, UserRole } from '@repo/types';
import { isOverdue } from '@repo/utils';
import { formatDate } from '@repo/utils';
import { useTickets, useDeleteTicket } from '@/features/tickets/hooks/useTickets';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { TicketStatusBadge } from '@/features/tickets/components/TicketStatusBadge';
import { TicketPriorityBadge } from '@/features/tickets/components/TicketPriorityBadge';
import { CreateTicketModal } from '@/features/tickets/components/CreateTicketModal';
import { useUIStore } from '@/store/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import type { TicketFilters } from '@/services/tickets';

export default function TicketsPage() {
  const { isCreateTicketModalOpen, openCreateTicketModal, closeCreateTicketModal } = useUIStore();
  const { data: currentUser } = useCurrentUser();
  const { mutate: deleteTicket } = useDeleteTicket();

  const [filters, setFilters] = useState<TicketFilters>({ page: 1, limit: 20 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, isLoading, isError } = useTickets({
    ...filters,
    search: debouncedSearch || undefined,
  });

  const tickets = data?.data ?? [];
  const meta = data?.meta;
  const isPrivileged =
    currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;

  const setFilter = <K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteTicket(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {meta ? `${meta.total} ticket${meta.total !== 1 ? 's' : ''}` : ' '}
          </p>
        </div>
        <button
          onClick={openCreateTicketModal}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search tickets..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilter('status', (e.target.value as TicketStatus) || undefined)
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {Object.values(TicketStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          value={filters.priority ?? ''}
          onChange={(e) =>
            setFilter('priority', (e.target.value as TicketPriority) || undefined)
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          {Object.values(TicketPriority).map((p) => (
            <option key={p} value={p}>
              {p[0] + p.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        {/* Quick-filter buttons */}
        {currentUser && (
          <button
            onClick={() =>
              setFilter(
                'assigneeId',
                filters.assigneeId === currentUser.id ? undefined : currentUser.id,
              )
            }
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              filters.assigneeId === currentUser.id
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Assigned to me
          </button>
        )}
        <button
          onClick={() => setFilter('overdue', filters.overdue ? undefined : true)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            filters.overdue
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Overdue
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading tickets...</div>
        ) : isError ? (
          <div className="p-12 text-center text-sm text-red-500">
            Failed to load tickets. Check your connection.
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            No tickets found.{' '}
            <button onClick={openCreateTicketModal} className="text-blue-600 hover:underline">
              Create one.
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Assignee
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Due
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Created
                </th>
                {isPrivileged && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                    >
                      {ticket.title}
                    </Link>
                    {ticket._count.tasks > 0 && (
                      <span className="ml-2 text-xs text-gray-400">
                        {ticket._count.tasks} task{ticket._count.tasks !== 1 ? 's' : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TicketStatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3">
                    <TicketPriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {ticket.assignee?.name ?? (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {ticket.dueDate ? (
                      <span
                        className={
                          isOverdue(ticket.dueDate) &&
                          ticket.status !== TicketStatus.DONE &&
                          ticket.status !== TicketStatus.CLOSED
                            ? 'font-medium text-red-600'
                            : 'text-gray-500'
                        }
                      >
                        {formatDate(ticket.dueDate)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(ticket.createdAt)}</td>
                  {isPrivileged && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(ticket.id, ticket.title)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))
              }
              disabled={meta.page <= 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  page: Math.min(meta.totalPages, (f.page ?? 1) + 1),
                }))
              }
              disabled={meta.page >= meta.totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CreateTicketModal isOpen={isCreateTicketModalOpen} onClose={closeCreateTicketModal} />
    </div>
  );
}
