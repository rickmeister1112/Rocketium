import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const http = axios.create({
  baseURL,
  withCredentials: false,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const fallback = {
      code: 'ERROR',
      message: 'Something went wrong',
      details: error.message,
    };
    const structured = error.response?.data ?? fallback;
    return Promise.reject(structured);
  },
);

