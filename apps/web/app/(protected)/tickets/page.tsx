import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Tickets' };

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track all tickets</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          New Ticket
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">Ticket list — wired up in Phase 1.7</p>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-400 italic">No tickets yet. Create your first ticket.</p>
        </div>
      </div>
    </div>
  );
}
