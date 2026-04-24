import { apiClient } from './api';
import type { TicketStatus, TicketPriority, TicketCategory } from '@repo/types';

export interface TicketUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  dueDate: string | null;
  reporterId: string;
  reporter: TicketUser;
  assigneeId: string | null;
  assignee: TicketUser | null;
  aiCategory: string | null;
  aiPriority: string | null;
  aiSummary: string | null;
  aiProcessedAt: string | null;
  _count: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface TicketListResponse {
  data: Ticket[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assigneeId?: string;
  search?: string;
  overdue?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  page?: number;
  limit?: number;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: TicketPriority;
  category?: TicketCategory;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assigneeId?: string | null;
  dueDate?: string | null;
}

type ApiWrap<T> = { data: T; timestamp: string };

export const ticketsService = {
  async list(filters: TicketFilters = {}): Promise<TicketListResponse> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
    );
    const { data } = await apiClient.get<ApiWrap<TicketListResponse>>('/api/tickets', { params });
    return data.data;
  },

  async getById(id: string): Promise<Ticket> {
    const { data } = await apiClient.get<ApiWrap<Ticket>>(`/api/tickets/${id}`);
    return data.data;
  },

  async create(input: CreateTicketInput): Promise<Ticket> {
    const { data } = await apiClient.post<ApiWrap<Ticket>>('/api/tickets', input);
    return data.data;
  },

  async update(id: string, input: UpdateTicketInput): Promise<Ticket> {
    const { data } = await apiClient.patch<ApiWrap<Ticket>>(`/api/tickets/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/tickets/${id}`);
  },
};
