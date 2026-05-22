import { createContext } from 'react';
import type { AuthState, LoginRequest } from '@/modules/auth/types';

export interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
