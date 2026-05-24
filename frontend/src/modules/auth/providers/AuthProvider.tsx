import { useState, useEffect, type ReactNode } from 'react';

import type { AuthState, LoginRequest } from '@/modules/auth/types';
import { loginUser } from '@/modules/auth/api/loginUser';
import { logoutUser } from '@/modules/auth/api/logoutUser';
import { getCurrentUser } from '@/modules/auth/api/getCurrentUser';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Al montar, verifica si hay un token guardado y valida con el backend
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const { user } = await getCurrentUser();
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token invalido o expirado, limpiar y mostrar login
          console.log('[Auth] DEBUG: token invalido, redirigiendo a login');
          localStorage.removeItem('auth_token');
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { user, token } = await loginUser(data);
      localStorage.setItem('auth_token', token);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    logoutUser();
    localStorage.removeItem('auth_token');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
