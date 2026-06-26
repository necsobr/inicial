import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario, UserRole } from '../types';
import { getToken, getOriginalToken, saveToken, saveOriginalToken, clearOriginalToken } from '../services/api';
import { authService } from '../services/authService';

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  impersonando: boolean;
  login: (email: string, senha: string) => Promise<Usuario | null>;
  logout: () => Promise<void>;
  loginComo: (u: Usuario) => Promise<void>;
  voltarParaAdmin: () => Promise<void>;
  registrar: (dados: { nome: string; empresa: string; email: string; telefone: string; equipeId: string }) => Promise<Usuario | null>;
  registrarNovoGrupo: (dados: { nome: string; empresa: string; email: string; telefone: string; nomeGrupo: string; regional: string; cidade: string }) => Promise<Usuario | null>;
  atualizarPerfil: (dados: Partial<Pick<Usuario, 'nome' | 'email' | 'telefone' | 'empresa'>>) => Promise<void>;
  alterarPapel: (usuarioId: string, novoPapel: UserRole) => Promise<void>;
  setUsuario: (u: Usuario | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const rotaPorPapel: Record<string, string> = {
  admin: '/admin', coordenador: '/coordenador', trio: '/trio', membro: '/membro', producao: '/producao',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [impersonando, setImpersonando] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { setCarregando(false); return; }
    setImpersonando(!!getOriginalToken());
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
    clearOriginalToken();
    setImpersonando(false);
    setUsuario(null);
  };

  const loginComo = async (alvo: Usuario): Promise<void> => {
    const tokenAtual = getToken();
    if (tokenAtual) saveOriginalToken(tokenAtual);
    const { usuario: novo } = await authService.loginComo(alvo.id);
    setUsuario(novo);
    setImpersonando(true);
    window.location.href = rotaPorPapel[novo.papel] ?? '/';
  };

  const voltarParaAdmin = async (): Promise<void> => {
    const tokenOriginal = getOriginalToken();
    if (!tokenOriginal) return;
    saveToken(tokenOriginal);
    clearOriginalToken();
    setImpersonando(false);
    const u = await authService.me();
    setUsuario(u);
    window.location.href = '/admin';
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
      usuario, carregando, impersonando,
      login, logout, loginComo, voltarParaAdmin,
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
