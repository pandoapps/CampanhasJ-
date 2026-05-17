import { useState, useCallback } from 'react';
import { authService } from '../services/api';

interface AuthState {
  token: string | null;
  user: { name: string; email: string; role: 'candidate' | 'admin' } | null;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    token: localStorage.getItem('token'),
    user: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    setAuth({ token: data.token, user: data.user });
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  }, []);

  return { ...auth, login, logout, isAuthenticated: !!auth.token };
}
