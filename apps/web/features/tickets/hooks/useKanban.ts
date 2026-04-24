'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TicketStatus } from '@repo/types';
import { ticketsService, type TicketListResponse } from '@/services/tickets';

const KEY = 'kanban';

export function useKanbanTickets() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => ticketsService.list({ limit: 200 }),
    select: (data): TicketListResponse => ({
      ...data,
      data: data.data.filter((t) => t.status !== TicketStatus.CLOSED),
    }),
  });
}

export function useMoveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      ticketsService.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: [KEY] });
      const previous = qc.getQueryData<TicketListResponse>([KEY]);
      qc.setQueryData<TicketListResponse>([KEY], (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map((t) => (t.id === id ? { ...t, status } : t)) };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData([KEY], context.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: [KEY] });
      void qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
