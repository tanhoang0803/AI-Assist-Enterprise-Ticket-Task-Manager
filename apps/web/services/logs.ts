import { apiClient } from './api';

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  userId: string;
  user: { id: string; name: string; avatarUrl: string | null };
  createdAt: string;
}

export interface LogsResponse {
  data: AuditLogEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface LogsQuery {
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
}

export const logsService = {
  async list(params: LogsQuery = {}): Promise<LogsResponse> {
    const query = new URLSearchParams();
    if (params.entityType) query.set('entityType', params.entityType);
    if (params.entityId) query.set('entityId', params.entityId);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const res = await apiClient.get<LogsResponse>(`/logs?${query.toString()}`);
    return res.data;
  },
};
