'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Pencil, Cpu, Calendar } from 'lucide-react';
import { formatDate, formatDateTime, isOverdue } from '@repo/utils';
import { useTicket, useAnalyzeTicket } from '@/features/tickets/hooks/useTickets';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { TicketStatusBadge } from '@/features/tickets/components/TicketStatusBadge';
import { TicketPriorityBadge } from '@/features/tickets/components/TicketPriorityBadge';
import { EditTicketModal } from '@/features/tickets/components/EditTicketModal';
import { TaskChecklist } from '@/features/tickets/components/TaskChecklist';
import { ActivityLog } from '@/features/tickets/components/ActivityLog';
import { AttachmentPanel } from '@/features/tickets/components/AttachmentPanel';

interface Props {
  params: { id: string };
}

export default function TicketDetailPage({ params }: Props) {
  const { data: ticket, isLoading, isError } = useTicket(params.id);
  const { mutate: analyzeTicket, isPending: isAnalyzing } = useAnalyzeTicket();
  const { mutate: syncCalendar, isPending: isSyncing, isSuccess: isSynced } = useMutation({
    mutationFn: (ticketId: string) =>
      apiClient.post(`/google/tickets/${ticketId}/calendar-sync`),
  });
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

          {/* Attachments */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <AttachmentPanel ticketId={ticket.id} />
          </div>

          {/* AI Analysis */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-500" />
                <h2 className="text-sm font-semibold text-gray-700">AI Analysis</h2>
              </div>
              <button
                onClick={() => analyzeTicket(ticket.id)}
                disabled={isAnalyzing}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                {isAnalyzing ? 'Queuing...' : 'Re-analyze'}
              </button>
            </div>
            {!ticket.aiProcessedAt ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
                <span>AI analysis pending...</span>
              </div>
            ) : (
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                {ticket.aiSummary && <p>{ticket.aiSummary}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  {ticket.aiCategory && (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 font-medium text-purple-700">
                      {ticket.aiCategory}
                    </span>
                  )}
                  {ticket.aiPriority && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                      {ticket.aiPriority} priority
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Processed {formatDateTime(ticket.aiProcessedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details sidebar */}
        <div className="space-y-5">
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

              {ticket.dueDate && ticket.assigneeId && (
                <div>
                  <button
                    onClick={() => syncCalendar(ticket.id)}
                    disabled={isSyncing}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {isSyncing ? 'Syncing...' : isSynced ? 'Synced ✓' : 'Sync to Calendar'}
                  </button>
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

          {/* Activity log */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Activity</h2>
            <ActivityLog ticketId={ticket.id} />
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
