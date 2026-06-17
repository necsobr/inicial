import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario, UserRole } from '../types';
import { getToken } from '../services/api';
import { authService } from '../services/authService';

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<Usuario | null>;
  logout: () => Promise<void>;
  registrar: (dados: { nome: string; empresa: string; email: string; telefone: string; equipeId: string }) => Promise<Usuario | null>;
  registrarNovoGrupo: (dados: { nome: string; empresa: string; email: string; telefone: string; nomeGrupo: string; regional: string; cidade: string }) => Promise<Usuario | null>;
  atualizarPerfil: (dados: Partial<Pick<Usuario, 'nome' | 'email' | 'telefone' | 'empresa'>>) => Promise<void>;
  alterarPapel: (usuarioId: string, novoPapel: UserRole) => Promise<void>;
  setUsuario: (u: Usuario | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setCarregando(false); return; }
    authService.me()
      .then(u => setUsuario(u))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const login = async (email: string, senha: string): Promise<Usuario | null> => {
    try {
      const { usuario: u } = await authService.login(email, senha);
      setUsuario(u);
      return u;
    } catch {
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUsuario(null);
  };

  const registrar = async (dados: {
    nome: string; empresa: string; email: string;
    telefone: string; equipeId: string;
  }): Promise<Usuario | null> => {
    try {
      const u = await authService.registrar(dados);
      setUsuario(u);
      return u;
    } catch {
      return null;
    }
  };

  const registrarNovoGrupo = async (dados: {
    nome: string; empresa: string; email: string; telefone: string;
    nomeGrupo: string; regional: string; cidade: string;
  }): Promise<Usuario | null> => {
    try {
      const u = await authService.registrarNovoGrupo(dados);
      setUsuario(u);
      return u;
    } catch {
      return null;
    }
  };

  const atualizarPerfil = async (
    dados: Partial<Pick<Usuario, 'nome' | 'email' | 'telefone' | 'empresa'>>
  ): Promise<void> => {
    if (!usuario) return;
    const atualizado = await authService.atualizarPerfil(dados);
    setUsuario(atualizado);
  };

  const alterarPapel = async (usuarioId: string, novoPapel: UserRole): Promise<void> => {
    await authService.alterarPapel(usuarioId, novoPapel);
  };

  return (
    <AuthContext.Provider value={{
      usuario, carregando, login, logout,
      registrar, registrarNovoGrupo,
      atualizarPerfil, alterarPapel, setUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
