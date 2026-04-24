'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@repo/ui';
import { TicketStatus, TicketPriority, TicketCategory } from '@repo/types';
import { useUpdateTicket } from '../hooks/useTickets';
import { useAssignableUsers } from '../hooks/useUsers';
import type { Ticket, UpdateTicketInput } from '@/services/tickets';

const VALID_NEXT: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.OPEN, TicketStatus.DONE],
  [TicketStatus.DONE]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [],
};

interface Props {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

function ticketToForm(t: Ticket): UpdateTicketInput {
  return {
    title: t.title,
    description: t.description ?? '',
    status: t.status,
    priority: t.priority,
    category: t.category,
    assigneeId: t.assigneeId ?? undefined,
    dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
  };
}

export function EditTicketModal({ ticket, isOpen, onClose }: Props) {
  const { mutate: updateTicket, isPending } = useUpdateTicket();
  const { data: users = [] } = useAssignableUsers();
  const [form, setForm] = useState<UpdateTicketInput>(() => ticketToForm(ticket));
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(ticketToForm(ticket));
    setError('');
  }, [ticket]);

  const set = <K extends keyof UpdateTicketInput>(k: K, v: UpdateTicketInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const availableStatuses = [ticket.status, ...VALID_NEXT[ticket.status]];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    const payload: UpdateTicketInput = {
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      category: form.category,
      assigneeId: form.assigneeId ?? null,
      dueDate: (form.dueDate as string) || null,
    };
    updateTicket(
      { id: ticket.id, input: payload },
      {
        onSuccess: onClose,
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to save changes.');
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Ticket" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title ?? ''}
            onChange={(e) => set('title', e.target.value)}
            className={inputClass}
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={4}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as TicketStatus)}
              className={inputClass}
            >
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => set('priority', e.target.value as TicketPriority)}
              className={inputClass}
            >
              {Object.values(TicketPriority).map((p) => (
                <option key={p} value={p}>
                  {p[0] + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value as TicketCategory)}
              className={inputClass}
            >
              {Object.values(TicketCategory).map((c) => (
                <option key={c} value={c}>
                  {c[0] + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              value={(form.dueDate as string) ?? ''}
              onChange={(e) => set('dueDate', e.target.value || null)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Assignee</label>
          <select
            value={form.assigneeId ?? ''}
            onChange={(e) => set('assigneeId', e.target.value || undefined)}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
