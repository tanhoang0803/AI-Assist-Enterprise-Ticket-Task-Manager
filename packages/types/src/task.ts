export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  ticketId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  assigneeId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  status?: TaskStatus;
  assigneeId?: string;
}
