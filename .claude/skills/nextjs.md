# Skill: Next.js 14 App Router Patterns

## Page (Server Component)

```typescript
// app/tickets/page.tsx
import { getAccessToken } from '@auth0/nextjs-auth0';
import { TicketList } from '@/components/ticket/TicketList';

export const metadata = { title: 'Tickets — AI-Assist Manager' };

export default async function TicketsPage() {
  const { accessToken } = await getAccessToken();
  const tickets = await fetch(`${process.env.API_URL}/tickets`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 30 },
  }).then(r => r.json());

  return <TicketList initialTickets={tickets} />;
}
```

## Client Component with React Query

```typescript
'use client';
import { useTickets } from '@/features/tickets/hooks/useTickets';

export function TicketList({ initialTickets }: Props) {
  const { data: tickets } = useTickets({ initialData: initialTickets });

  return (
    <ul>
      {tickets?.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </ul>
  );
}
```

## React Query Hook Pattern

```typescript
// features/tickets/hooks/useTickets.ts
import { useQuery } from '@tanstack/react-query';
import { ticketApi } from '../services/ticketApi';

export const TICKETS_QUERY_KEY = ['tickets'] as const;

export function useTickets(options?: { initialData?: Ticket[] }) {
  return useQuery({
    queryKey: TICKETS_QUERY_KEY,
    queryFn: ticketApi.getAll,
    initialData: options?.initialData,
    staleTime: 30_000,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ticketApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY }),
  });
}
```

## API Service Layer

```typescript
// features/tickets/services/ticketApi.ts
import { apiClient } from '@/services/api';
import type { Ticket, CreateTicketDto } from '@types/ticket';

export const ticketApi = {
  getAll: () => apiClient.get<Ticket[]>('/tickets').then(r => r.data),
  getOne: (id: string) => apiClient.get<Ticket>(`/tickets/${id}`).then(r => r.data),
  create: (dto: CreateTicketDto) => apiClient.post<Ticket>('/tickets', dto).then(r => r.data),
  update: (id: string, dto: Partial<CreateTicketDto>) =>
    apiClient.patch<Ticket>(`/tickets/${id}`, dto).then(r => r.data),
  remove: (id: string) => apiClient.delete(`/tickets/${id}`),
};
```

## Zustand Store Pattern

```typescript
// store/uiStore.ts
import { create } from 'zustand';

interface UIState {
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateModalOpen: false,
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
}));
```

## Layout Pattern

```typescript
// app/layout.tsx
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { QueryProviders } from '@/components/providers/QueryProviders';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <QueryProviders>
            {children}
          </QueryProviders>
        </UserProvider>
      </body>
    </html>
  );
}
```

## cn() Utility

```typescript
// utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Protected Page

```typescript
import { withPageAuthRequired } from '@auth0/nextjs-auth0';

export default withPageAuthRequired(async function DashboardPage() {
  return <Dashboard />;
}, { returnTo: '/dashboard' });
```
