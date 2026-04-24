'use client';

import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/users';

export function useAssignableUsers() {
  return useQuery({
    queryKey: ['users', 'assignable'],
    queryFn: () => usersService.listAssignable(),
    staleTime: 5 * 60 * 1000,
  });
}
