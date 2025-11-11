import { http } from './http';
import type { Comment, Design, DesignMeta } from '../types/design';

export interface DesignCreateRequest {
  name: string;
  width: number;
  height: number;
  elements: Design['elements'];
}

export interface DesignUpdateRequest {
  name?: string;
  width?: number;
  height?: number;
  elements?: Design['elements'];
  thumbnailUrl?: string;
}

export interface CommentCreateRequest {
  authorName: string;
  authorId?: string;
  message: string;
  mentions?: string[];
  x?: number;
  y?: number;
}

export interface CommentUpdateRequest {
  message: string;
  mentions?: string[];
  x?: number;
  y?: number;
}

interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export const DesignApi = {
  async list(search?: string): Promise<DesignMeta[]> {
    const response = await http.get<ApiResponse<DesignMeta[]>>('/designs', { params: { search } });
    return response.data.data;
  },
  async create(payload: DesignCreateRequest): Promise<Design> {
    const response = await http.post<ApiResponse<Design>>('/designs', payload);
    return response.data.data;
  },
  async get(id: string): Promise<Design> {
    const response = await http.get<ApiResponse<Design>>(`/designs/${id}`);
    return response.data.data;
  },
  async update(id: string, payload: DesignUpdateRequest): Promise<Design> {
    const response = await http.put<ApiResponse<Design>>(`/designs/${id}`, payload);
    return response.data.data;
  },
  async delete(id: string): Promise<{ id: string }> {
    const response = await http.delete<ApiResponse<{ id: string }>>(`/designs/${id}`);
    return response.data.data;
  },
  async requestAccess(id: string): Promise<{ status: string }> {
    const response = await http.post<ApiResponse<{ status: string }>>(`/designs/${id}/access-requests`);
    return response.data.data;
  },
  async respondAccess(id: string, userId: string, action: 'approve' | 'deny'): Promise<Design> {
    const response = await http.post<ApiResponse<Design>>(`/designs/${id}/access-requests/${userId}`, { action });
    return response.data.data;
  },
  async listComments(id: string): Promise<Comment[]> {
    const response = await http.get<ApiResponse<Comment[]>>(`/designs/${id}/comments`);
    return response.data.data;
  },
  async createComment(id: string, payload: CommentCreateRequest): Promise<Comment> {
    const response = await http.post<ApiResponse<Comment>>(`/designs/${id}/comments`, payload);
    return response.data.data;
  },
  async updateComment(designId: string, commentId: string, payload: CommentUpdateRequest): Promise<Comment> {
    const response = await http.put<ApiResponse<Comment>>(`/designs/${designId}/comments/${commentId}`, payload);
    return response.data.data;
  },
};

