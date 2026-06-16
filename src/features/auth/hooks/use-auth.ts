import { useContext } from 'react';

import { AuthContext } from '../components/AuthProvider';
import type { AuthState } from '../types';

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
