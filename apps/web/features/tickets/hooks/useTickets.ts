'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ticketsService,
  type TicketFilters,
  type CreateTicketInput,
  type UpdateTicketInput,
} from '@/services/tickets';

const TICKETS_KEY = 'tickets';

export function useTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: [TICKETS_KEY, filters],
    queryFn: () => ticketsService.list(filters),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: [TICKETS_KEY, id],
    queryFn: () => ticketsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => ticketsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTicketInput }) =>
      ticketsService.update(id, input),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [TICKETS_KEY, id] });
      void qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });
}
