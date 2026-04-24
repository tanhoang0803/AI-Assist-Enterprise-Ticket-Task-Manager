'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService, type Task, TaskStatus } from '@/services/tasks';

const key = (ticketId: string) => ['tasks', ticketId];

export function useTasks(ticketId: string) {
  return useQuery({
    queryKey: key(ticketId),
    queryFn: () => tasksService.listByTicket(ticketId),
    enabled: !!ticketId,
  });
}

export function useCreateTask(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => tasksService.create(ticketId, title),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key(ticketId) });
      void qc.invalidateQueries({ queryKey: ['tickets', ticketId] });
      void qc.invalidateQueries({ queryKey: ['kanban'] });
    },
  });
}

export function useUpdateTask(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; title?: string; status?: TaskStatus }) =>
      tasksService.update(id, input),
    onMutate: async ({ id, ...input }) => {
      await qc.cancelQueries({ queryKey: key(ticketId) });
      const previous = qc.getQueryData<Task[]>(key(ticketId));
      qc.setQueryData<Task[]>(key(ticketId), (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...input } : t)) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(key(ticketId), context.previous);
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: key(ticketId) }),
  });
}

export function useDeleteTask(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key(ticketId) });
      void qc.invalidateQueries({ queryKey: ['tickets', ticketId] });
      void qc.invalidateQueries({ queryKey: ['kanban'] });
    },
  });
}
