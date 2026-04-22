import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI-Assist Manager</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enterprise ticket &amp; task management powered by AI
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/api/auth/login"
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in with Auth0
          </a>
        </div>

        <p className="text-center text-xs text-gray-500">
          AI-Assist Enterprise Ticket &amp; Task Manager
        </p>
      </div>
    </div>
  );
}
