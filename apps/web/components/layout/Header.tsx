'use client';

import type { Claims } from '@auth0/nextjs-auth0';
import { Bell } from 'lucide-react';
import { initials } from '@repo/utils';

interface Props {
  user: Claims;
}

export function Header({ user }: Props) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture as string}
              alt={user.name as string}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initials((user.name as string) ?? 'U')}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user.name as string}</p>
            <p className="text-xs text-gray-500">{user.email as string}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
