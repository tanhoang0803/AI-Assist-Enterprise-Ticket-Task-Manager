import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

// Inject Auth0 access token before every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const res = await fetch('/api/auth/token');
    if (res.ok) {
      const { accessToken } = await res.json() as { accessToken: string };
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch {
    // no token — unauthenticated request proceeds without header
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/api/auth/login';
    }
    return Promise.reject(error);
  },
);
