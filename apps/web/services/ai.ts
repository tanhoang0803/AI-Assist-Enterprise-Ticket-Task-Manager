import { apiClient } from './api';

export const aiService = {
  async analyzeTicket(ticketId: string): Promise<{ queued: boolean; ticketId: string }> {
    const res = await apiClient.post<{ queued: boolean; ticketId: string }>(
      `/ai/analyze/${ticketId}`,
    );
    return res.data;
  },
};
