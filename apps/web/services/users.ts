import { apiClient } from './api';

export interface AssignableUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

type ApiWrap<T> = { data: T; timestamp: string };

export const usersService = {
  async listAssignable(): Promise<AssignableUser[]> {
    const { data } = await apiClient.get<ApiWrap<AssignableUser[]>>('/api/users/assignable');
    return data.data;
  },
};
