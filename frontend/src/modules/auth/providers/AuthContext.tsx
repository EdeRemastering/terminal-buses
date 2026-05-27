import { createContext } from 'react';
import type { Role } from '@/common/types';
import type { AuthState, LoginRequest } from '@/modules/auth/types';

export interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  setPreviewRole: (role: Role | null) => void;
  clearPreviewRole: () => void;
  effectiveRole: Role | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
