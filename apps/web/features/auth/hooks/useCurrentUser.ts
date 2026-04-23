'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useAuth } from './useAuth';
import type { UserRole } from '@repo/types';

export interface DbUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

type ApiWrap<T> = { data: T; timestamp: string };

async function fetchMe(): Promise<DbUser> {
  const { data } = await apiClient.get<ApiWrap<DbUser>>('/api/users/me');
  return data.data;
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: fetchMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
