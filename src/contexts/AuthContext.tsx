import React, { createContext, useContext, useState } from 'react';
import type { Usuario } from '../types';
import { useStore } from './StoreContext';

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
  atualizarPerfil: (dados: Partial<Pick<Usuario, 'nome' | 'email' | 'telefone'>>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { usuarios } = useStore();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const login = (email: string, senha: string): boolean => {
    if (senha !== '123456') return false;
    const encontrado = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!encontrado) return false;
    setUsuario(encontrado);
    return true;
  };

  const logout = () => setUsuario(null);

  const atualizarPerfil = (dados: Partial<Pick<Usuario, 'nome' | 'email' | 'telefone'>>) => {
    if (!usuario) return;
    setUsuario({ ...usuario, ...dados });
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, atualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
