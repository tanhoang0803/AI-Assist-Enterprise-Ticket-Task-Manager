import { apiClient } from './api';
import { TaskStatus } from '@repo/types';

export { TaskStatus };

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  ticketId: string;
  assigneeId: string | null;
  assignee: { id: string; name: string; avatarUrl: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

type ApiWrap<T> = { data: T; timestamp: string };

export const tasksService = {
  async listByTicket(ticketId: string): Promise<Task[]> {
    const { data } = await apiClient.get<ApiWrap<Task[]>>(`/api/tickets/${ticketId}/tasks`);
    return data.data;
  },

  async create(ticketId: string, title: string): Promise<Task> {
    const { data } = await apiClient.post<ApiWrap<Task>>(`/api/tickets/${ticketId}/tasks`, {
      title,
    });
    return data.data;
  },

  async update(id: string, input: { title?: string; status?: TaskStatus }): Promise<Task> {
    const { data } = await apiClient.patch<ApiWrap<Task>>(`/api/tasks/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/tasks/${id}`);
  },
};
