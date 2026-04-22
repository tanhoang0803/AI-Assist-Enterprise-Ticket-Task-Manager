'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchAccessToken(): Promise<string> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) throw new Error('Failed to get access token');
  const data = await res.json() as { accessToken: string };
  return data.accessToken;
}

export function useAccessToken() {
  return useQuery({
    queryKey: ['auth', 'access-token'],
    queryFn: fetchAccessToken,
    staleTime: 55 * 60 * 1000, // 55 min — tokens expire at 60 min
    retry: false,
  });
}
