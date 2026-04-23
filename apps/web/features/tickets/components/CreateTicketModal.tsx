'use client';

import { useState } from 'react';
import { Modal } from '@repo/ui';
import { TicketPriority, TicketCategory } from '@repo/types';
import { useCreateTicket } from '../hooks/useTickets';
import type { CreateTicketInput } from '@/services/tickets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const defaultForm: CreateTicketInput = {
  title: '',
  description: '',
  priority: TicketPriority.MEDIUM,
  category: TicketCategory.OTHER,
};

export function CreateTicketModal({ isOpen, onClose }: Props) {
  const { mutate: createTicket, isPending } = useCreateTicket();
  const [form, setForm] = useState<CreateTicketInput>(defaultForm);
  const [error, setError] = useState('');

  const set = <K extends keyof CreateTicketInput>(k: K, v: CreateTicketInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleClose = () => {
    setForm(defaultForm);
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    createTicket(
      { ...form, description: form.description || undefined },
      {
        onSuccess: handleClose,
        onError: () => setError('Failed to create ticket. Please try again.'),
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Ticket" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputClass}
            placeholder="Brief title for the ticket"
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
            placeholder="Optional — describe the issue or request"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            value={form.dueDate ?? ''}
            onChange={(e) => set('dueDate', e.target.value || undefined)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
