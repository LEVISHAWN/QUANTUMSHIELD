import { api } from '../lib/api';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/register', { email, password });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    await api.post('/auth/logout');
  },

  verifyToken: async () => {
    try {
      const response = await api.get<{ valid: boolean }>('/auth/verify');
      return response.data.valid;
    } catch {
      return false;
    }
  }
};
