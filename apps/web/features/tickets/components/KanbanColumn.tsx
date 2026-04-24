'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Ticket } from '@/services/tickets';
import { KanbanCard } from './KanbanCard';

interface Props {
  id: string;
  label: string;
  tickets: Ticket[];
  isDropDisabled?: boolean;
}

export function KanbanColumn({ id, label, tickets, isDropDisabled = false }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: isDropDisabled });

  return (
    <div className="flex min-h-[480px] flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
          {tickets.length}
        </span>
      </div>

      <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 rounded-xl p-2 space-y-2 min-h-[120px] transition-colors ${
            isDropDisabled
              ? 'bg-gray-50 opacity-50'
              : isOver
                ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset'
                : 'bg-gray-50'
          }`}
        >
          {tickets.map((t) => (
            <KanbanCard key={t.id} ticket={t} />
          ))}
          {tickets.length === 0 && (
            <p className={`py-8 text-center text-xs italic ${isOver ? 'text-blue-400' : 'text-gray-400'}`}>
              {isOver ? 'Drop here' : 'No tickets'}
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
