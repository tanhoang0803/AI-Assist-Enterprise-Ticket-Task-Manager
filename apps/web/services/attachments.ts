import { apiClient } from './api';

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedById: string;
  ticketId: string;
  createdAt: string;
}

export const attachmentsService = {
  async list(ticketId: string): Promise<Attachment[]> {
    const res = await apiClient.get<Attachment[]>(`/tickets/${ticketId}/attachments`);
    return res.data;
  },

  async upload(ticketId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<Attachment>(
      `/tickets/${ticketId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/attachments/${id}`);
  },
};
