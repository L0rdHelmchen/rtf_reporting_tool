// RTF Reporting Tool - Users API Service
import api from './api';

export interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
}

export interface UpdateUserPayload {
  role?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
}

class UsersApiService {
  async listUsers(): Promise<UserData[]> {
    const res = await api.get('/users');
    return res.data?.data?.users ?? [];
  }

  async createUser(payload: CreateUserPayload): Promise<UserData> {
    const res = await api.post('/users', payload);
    return res.data?.data;
  }

  async updateUser(id: string, payload: UpdateUserPayload): Promise<UserData> {
    const res = await api.put(`/users/${id}`, payload);
    return res.data?.data;
  }

  async deactivateUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  async resetPassword(id: string, password: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`, { password });
  }
}

export const usersApi = new UsersApiService();
