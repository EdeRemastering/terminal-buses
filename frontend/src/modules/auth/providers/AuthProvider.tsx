import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';

import type { Role } from '@/common/types';
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
    previewRole: null,
  });

  const effectiveRole = state.previewRole ?? state.user?.role ?? null;

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
            previewRole: null,
          });
         } catch {
          localStorage.removeItem('auth_token');
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            previewRole: null,
          });
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          previewRole: null,
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
        previewRole: null,
      });
      toast.success('Inicio de sesión exitoso');
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      toast.error('Credenciales inválidas. Intente de nuevo.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignorar errores de API al cerrar sesión, igual se limpia el estado local
    }
    localStorage.removeItem('auth_token');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      previewRole: null,
    });
    toast.info('Sesión cerrada');
  };

  const setPreviewRole = useCallback((role: Role | null) => {
    setState((prev) => ({ ...prev, previewRole: role }));
  }, []);

  const clearPreviewRole = useCallback(() => {
    setState((prev) => ({ ...prev, previewRole: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, effectiveRole, login, logout, setPreviewRole, clearPreviewRole }}>
      {children}
    </AuthContext.Provider>
  );
};
