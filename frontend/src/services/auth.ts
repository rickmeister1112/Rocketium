import { http } from './http';

interface SessionResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
}

interface CreateSessionRequest {
  name: string;
  userId?: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ProfileUpdateRequest {
  name: string;
}

interface ForgotPasswordRequest {
  email?: string;
}

interface ForgotPasswordResponse {
  code: string;
  message: string;
}

interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export const AuthApi = {
  async createSession(payload: CreateSessionRequest): Promise<SessionResponse> {
    const response = await http.post<ApiResponse<SessionResponse>>('/auth/token', payload);
    return response.data.data;
  },

  async register(payload: RegisterRequest): Promise<SessionResponse> {
    const response = await http.post<ApiResponse<SessionResponse>>('/auth/register', payload);
    return response.data.data;
  },

  async login(payload: LoginRequest): Promise<SessionResponse> {
    const response = await http.post<ApiResponse<SessionResponse>>('/auth/login', payload);
    return response.data.data;
  },

  async updateProfile(payload: ProfileUpdateRequest): Promise<SessionResponse> {
    const response = await http.patch<ApiResponse<SessionResponse>>('/auth/profile', payload);
    return response.data.data;
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await http.post<ForgotPasswordResponse>('/auth/forgot-password', payload);
    return response.data;
  },
};

