export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TicketCategory {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  SUPPORT = 'SUPPORT',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  OTHER = 'OTHER',
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assigneeId?: string;
  reporterId: string;
  dueDate?: string;
  aiCategory?: string;
  aiPriority?: string;
  aiSummary?: string;
  aiProcessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDto {
  title: string;
  description?: string;
  priority?: TicketPriority;
  category?: TicketCategory;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assigneeId?: string;
  dueDate?: string;
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
