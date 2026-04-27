import { useQuery } from '@tanstack/react-query';
import { logsService } from '@/services/logs';

export function useTicketLogs(ticketId: string) {
  return useQuery({
    queryKey: ['logs', 'TICKET', ticketId],
    queryFn: () => logsService.list({ entityType: 'TICKET', entityId: ticketId, limit: 50 }),
    staleTime: 30_000,
  });
}
