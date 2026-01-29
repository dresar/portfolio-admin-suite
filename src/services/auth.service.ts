import { api } from '@/lib/api';
import { User } from '@/types';

export interface LoginCredentials {
  identifier: string;
  password: string;
  captcha?: string;
  captchaHash?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me/');
    return response.data;
  },

  getCaptcha: async (): Promise<{ captcha: string; hash: string }> => {
    const response = await api.get('/auth/captcha/');
    return response.data;
  },
  
  logout: async (): Promise<void> => {
      // In a stateless token system, we just delete the token client side.
      // But if there is a server side logout endpoint, call it.
      // The analysis mentioned /api/admin/logout/
      try {
        await api.get('/admin/logout/');
      } catch (error) {
          console.error("Logout failed on server", error);
      }
  }
};
