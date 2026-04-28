'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsService } from '@/services/attachments';

const key = (ticketId: string) => ['attachments', ticketId];

export function useAttachments(ticketId: string) {
  return useQuery({
    queryKey: key(ticketId),
    queryFn: () => attachmentsService.list(ticketId),
    enabled: !!ticketId,
  });
}

export function useUploadAttachment(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentsService.upload(ticketId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(ticketId) }),
  });
}

export function useDeleteAttachment(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(ticketId) }),
  });
}
