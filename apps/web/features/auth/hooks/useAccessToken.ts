'use client';

import { useSession } from 'next-auth/react';

export function useAccessToken() {
  const { data: session } = useSession();
  return { data: session?.accessToken ?? null };
}
