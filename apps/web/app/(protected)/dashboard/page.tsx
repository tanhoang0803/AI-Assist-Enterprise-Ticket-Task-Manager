import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Kanban board — coming in Phase 2</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {(['Open', 'In Progress', 'Done'] as const).map((col) => (
          <div key={col} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {col}
            </h2>
            <div className="space-y-2">
              <p className="text-xs text-gray-400 italic">No tickets yet</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
