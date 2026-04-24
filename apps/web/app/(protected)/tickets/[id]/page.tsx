'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Pencil, Cpu } from 'lucide-react';
import { formatDate, formatDateTime, isOverdue } from '@repo/utils';
import { useTicket } from '@/features/tickets/hooks/useTickets';
import { TicketStatusBadge } from '@/features/tickets/components/TicketStatusBadge';
import { TicketPriorityBadge } from '@/features/tickets/components/TicketPriorityBadge';
import { EditTicketModal } from '@/features/tickets/components/EditTicketModal';
import { TaskChecklist } from '@/features/tickets/components/TaskChecklist';

interface Props {
  params: { id: string };
}

export default function TicketDetailPage({ params }: Props) {
  const { data: ticket, isLoading, isError } = useTicket(params.id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Loading ticket...
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-gray-500">
        <p>Ticket not found or you do not have access.</p>
        <Link href="/tickets" className="text-blue-600 hover:underline">
          Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/tickets" className="hover:text-gray-600">
          Tickets
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="max-w-xs truncate font-medium text-gray-700">{ticket.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold leading-tight text-gray-900">{ticket.title}</h1>
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">
          {/* Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700">Description</h2>
            {ticket.description ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                {ticket.description}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-gray-400">No description provided.</p>
            )}
          </div>

          {/* Tasks */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <TaskChecklist ticketId={ticket.id} />
          </div>

          {/* AI Analysis */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-500" />
              <h2 className="text-sm font-semibold text-gray-700">AI Analysis</h2>
            </div>
            {ticket.aiSummary ? (
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p>{ticket.aiSummary}</p>
                {ticket.aiCategory && (
                  <p className="text-xs text-gray-400">Suggested category: {ticket.aiCategory}</p>
                )}
                {ticket.aiProcessedAt && (
                  <p className="text-xs text-gray-400">
                    Processed {formatDateTime(ticket.aiProcessedAt)}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm italic text-gray-400">
                AI analysis will appear here after processing — Phase 3.
              </p>
            )}
          </div>
        </div>

        {/* Details sidebar */}
        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Details</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Status
                </dt>
                <dd className="mt-1">
                  <TicketStatusBadge status={ticket.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Priority
                </dt>
                <dd className="mt-1">
                  <TicketPriorityBadge priority={ticket.priority} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Category
                </dt>
                <dd className="mt-1 font-medium text-gray-700">
                  {ticket.category[0] + ticket.category.slice(1).toLowerCase()}
                </dd>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Reporter
                </dt>
                <dd className="mt-1 font-medium text-gray-700">{ticket.reporter.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Assignee
                </dt>
                <dd className="mt-1 font-medium text-gray-700">
                  {ticket.assignee?.name ?? (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </dd>
              </div>

              {ticket.dueDate && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Due Date
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        isOverdue(ticket.dueDate) &&
                        ticket.status !== 'DONE' &&
                        ticket.status !== 'CLOSED'
                          ? 'text-red-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {formatDate(ticket.dueDate)}
                    </span>
                    {isOverdue(ticket.dueDate) &&
                      ticket.status !== 'DONE' &&
                      ticket.status !== 'CLOSED' && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Overdue
                        </span>
                      )}
                  </dd>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Created
                </dt>
                <dd className="mt-1 text-gray-500">{formatDateTime(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Last Updated
                </dt>
                <dd className="mt-1 text-gray-500">{formatDateTime(ticket.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <EditTicketModal
        ticket={ticket}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
}
