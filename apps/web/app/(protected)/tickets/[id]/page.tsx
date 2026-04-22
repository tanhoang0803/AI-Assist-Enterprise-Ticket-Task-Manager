import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Ticket Detail' };

export default function TicketDetailPage({ params }: Props) {
  if (!params.id) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ticket #{params.id}</h1>
        <p className="mt-1 text-sm text-gray-500">Ticket detail — wired up in Phase 1.8</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700">Description</h2>
            <p className="mt-2 text-sm text-gray-400 italic">No content yet</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700">AI Analysis</h2>
            <p className="mt-2 text-sm text-gray-400 italic">AI processing — Phase 3</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700">Details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-gray-900">—</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Priority</dt>
                <dd className="font-medium text-gray-900">—</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Assignee</dt>
                <dd className="font-medium text-gray-900">—</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
