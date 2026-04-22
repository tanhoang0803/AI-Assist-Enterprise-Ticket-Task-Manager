import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { QueryProviders } from '@/components/providers/QueryProviders';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'AI-Assist Manager',
    template: '%s — AI-Assist Manager',
  },
  description: 'Enterprise ticket and task management powered by AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <UserProvider>
          <QueryProviders>{children}</QueryProviders>
        </UserProvider>
      </body>
    </html>
  );
}
