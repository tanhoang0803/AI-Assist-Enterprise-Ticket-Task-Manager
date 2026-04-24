import type { Metadata } from 'next';
import { KanbanBoard } from '@/features/tickets/components/KanbanBoard';

export const metadata: Metadata = { title: 'Kanban Board' };

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Drag tickets between columns to update status
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
