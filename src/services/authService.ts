import { api, saveToken, clearToken, getToken, getAdminToken, saveAdminToken, clearAdminToken } from './api';
import { mapUser, type ApiUser } from './mappers';
import type { Usuario } from '../types';

interface LoginResponse {
  data: { user: ApiUser; token: string };
}

interface UserResponse {
  data: ApiUser;
}

export const authService = {
  async login(email: string, senha: string): Promise<{ usuario: Usuario; token: string }> {
    const res = await api.post<LoginResponse>('/auth/login', { email, password: senha });
    saveToken(res.data.token);
    return { usuario: mapUser(res.data.user), token: res.data.token };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout').catch(() => {});
    clearToken();
  },

  async me(): Promise<Usuario> {
    const res = await api.get<UserResponse>('/auth/me');
    return mapUser(res.data);
  },

  async registrar(dados: {
    nome: string; empresa: string; email: string;
    telefone: string; equipeId: string;
  }): Promise<Usuario> {
    const res = await api.post<UserResponse>('/auth/register', {
      name: dados.nome,
      company: dados.empresa,
      email: dados.email,
      phone: dados.telefone,
      team_id: Number(dados.equipeId),
      password: '123456',
      password_confirmation: '123456',
    });
    return mapUser(res.data);
  },

  async registrarNovoGrupo(dados: {
    nome: string; empresa: string; email: string; telefone: string;
    nomeGrupo: string; regional: string; cidade: string;
  }): Promise<Usuario> {
    const res = await api.post<UserResponse>('/auth/register-group', {
      name: dados.nome,
      company: dados.empresa,
      email: dados.email,
      phone: dados.telefone,
      group_name: dados.nomeGrupo,
      regional: dados.regional,
      city: dados.cidade,
      password: '123456',
      password_confirmation: '123456',
    });
    return mapUser(res.data);
  },

  async atualizarPerfil(dados: Partial<{ nome: string; email: string; telefone: string; empresa: string }>): Promise<Usuario> {
    const body: Record<string, string> = {};
    if (dados.nome)     body.name    = dados.nome;
    if (dados.email)    body.email   = dados.email;
    if (dados.telefone) body.phone   = dados.telefone;
    if (dados.empresa)  body.company = dados.empresa;
    const res = await api.put<UserResponse>('/auth/profile', body);
    return mapUser(res.data);
  },

  async alterarPapel(usuarioId: string, novoPapel: string): Promise<Usuario> {
    const res = await api.put<UserResponse>(`/users/${usuarioId}/role`, { role: novoPapel });
    return mapUser(res.data);
  },

  async loginAs(usuarioId: string): Promise<{ usuario: Usuario; token: string }> {
    const current = getToken();
    if (current) saveAdminToken(current);
    const res = await api.post<LoginResponse>(`/users/${usuarioId}/impersonate`);
    saveToken(res.data.token);
    return { usuario: mapUser(res.data.user), token: res.data.token };
  },

  async exitLoginAs(): Promise<Usuario> {
    const adminToken = getAdminToken();
    if (!adminToken) throw new Error('Nenhuma sessão de admin salva.');
    saveToken(adminToken);
    clearAdminToken();
    const res = await api.get<UserResponse>('/auth/me');
    return mapUser(res.data);
  },
};
