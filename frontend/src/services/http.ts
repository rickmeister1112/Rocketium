import axios, { AxiosHeaders } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const SESSION_STORAGE_KEY = 'design-editor-session';

export const http = axios.create({
  baseURL,
  withCredentials: false,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        window.dispatchEvent(new Event('session-expired'));
      } catch {
        // ignore storage issues
      }
    }
    const fallback = {
      code: 'ERROR',
      message: 'Something went wrong',
      details: error.message,
    };
    const structured = error.response?.data ?? fallback;
    return Promise.reject(structured);
  },
);

http.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored) as { token?: string };
        if (session?.token) {
          const headers = AxiosHeaders.from(config.headers);
          headers.set('Authorization', `Bearer ${session.token}`);
          config.headers = headers;
        }
      }
    } catch {
      // noop: fall through without headers if parsing fails
    }
  }
  return config;
});

