import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export interface User {
  id: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const isValid = await authService.verifyToken();
      if (!isValid) {
        await logout();
      }
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      return true;
    } catch (err) {
      setError('Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
  };
};
