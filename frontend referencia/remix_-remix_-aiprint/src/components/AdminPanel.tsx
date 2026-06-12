/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, Shield, Server, FileText, Plus, Trash2, Edit, Save, X, 
  Layers, CheckCircle, RefreshCw, Key, HelpCircle 
} from 'lucide-react';
import { User, Team, PrintAPI, PrintOrder, SponsorQueueItem, UserRole } from '../types';

interface AdminPanelProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  teams: Team[];
  onUpdateTeams: (teams: Team[]) => void;
  apis: PrintAPI[];
  onUpdateApis: (apis: PrintAPI[]) => void;
  orders: PrintOrder[];
  sponsors: SponsorQueueItem[];
}

export default function AdminPanel({
  users,
  onUpdateUsers,
  teams,
  onUpdateTeams,
  apis,
  onUpdateApis,
  orders,
  sponsors
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'kpis' | 'users' | 'teams' | 'apis' | 'production'>('kpis');

  // Form states for creating/editing Users
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('trio');
  const [newUserTeam, setNewUserTeam] = useState('');

  // Form states for Teams
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeamOpen, setNewTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeamMember, setSelectedTeamMember] = useState('');

  // Form states for APIs
  const [newApiOpen, setNewApiOpen] = useState(false);
  const [newApiName, setNewApiName] = useState('');
  const [newApiEndpoint, setNewApiEndpoint] = useState('');
  const [newApiToken, setNewApiToken] = useState('');

  // Calculations for summary statistics
  const totalUsersCount = users.length;
  const activeTeamsCount = teams.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'aguardando' || o.status === 'em impressão').length;
  const sponsorCount = sponsors.length;

  // --- Users Actions ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    
    // Check if email already belongs to a user
    if (users.some(u => u.email === newUserEmail)) {
      alert('Já existe um usuário com este e-mail!');
      return;
    }

    const assignedRole = newUserRole;
    const isExternal = assignedRole === 'admin' || assignedRole === 'producao';
    const finalTeam = isExternal ? 'Nenhuma' : (newUserTeam || 'Nenhuma');

    const created: User = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: assignedRole,
      team: finalTeam
    };

    onUpdateUsers([...users, created]);

    // If a valid team was assigned, add their email to the team members list
    if (finalTeam !== 'Nenhuma') {
      const updatedTeams = teams.map(t => {
        if (t.name === finalTeam) {
          return { ...t, members: [...t.members, newUserEmail] };
        }
        return t;
      });
      onUpdateTeams(updatedTeams);
    }

    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('trio');
    setNewUserTeam('');
    setNewUserOpen(false);
  };

  const handleStartEditUser = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSaveEditUser = () => {
    if (!editingUser) return;
    
    const assignedRole = editingUser.role;
    const isExternal = assignedRole === 'admin' || assignedRole === 'producao';
    if (isExternal) {
      editingUser.team = 'Nenhuma';
    }

    const oldUser = users.find(u => u.id === editingUser.id);
    const oldTeamName = oldUser?.team || 'Nenhuma';
    const newTeamName = editingUser.team || 'Nenhuma';

    let updatedTeams = [...teams];

    // Remove from previous team's members array
    if (oldTeamName !== 'Nenhuma' && oldTeamName !== newTeamName) {
      updatedTeams = updatedTeams.map(t => {
        if (t.name === oldTeamName) {
          return { ...t, members: t.members.filter(m => m !== editingUser.email) };
        }
        return t;
      });
    }

    // Add to new team's members array if it's a valid team and changing
    if (newTeamName !== 'Nenhuma' && oldTeamName !== newTeamName) {
      updatedTeams = updatedTeams.map(t => {
        if (t.name === newTeamName) {
          if (!t.members.includes(editingUser.email)) {
             return { ...t, members: [...t.members, editingUser.email] };
          }
        }
        return t;
      });
    }

    onUpdateTeams(updatedTeams);

    const updated = users.map(u => u.id === editingUser.id ? editingUser : u);
    onUpdateUsers(updated);
    setEditingUser(null);
  };

  const handleRemoveUser = (id: string, userEmail: string) => {
    if (userEmail === 'admin@aiprint.com') {
      alert('Você não pode remover o administrador padrão do sistema!');
      return;
    }
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      // Also remove them from any teams
      const updatedTeams = teams.map(t => ({
        ...t,
        members: t.members.filter(m => m !== userEmail)
      }));
      onUpdateTeams(updatedTeams);
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  // --- Teams Actions ---
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;

    const created: Team = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      members: []
    };

    onUpdateTeams([...teams, created]);
    setNewTeamName('');
    setNewTeamOpen(false);
  };

  const handleRemoveTeam = (id: string) => {
    if (confirm('Deseja excluir esta equipe?')) {
      onUpdateTeams(teams.filter(t => t.id !== id));
    }
  };

  const handleAddMemberToTeam = (teamId: string, memberEmail: string) => {
    if (!memberEmail) return;
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    if (team.members.includes(memberEmail)) {
      alert('Este usuário já participa desta equipe!');
      return;
    }

    // Since a user can only belong to one team, remove them from any other team first
    const updated = teams.map(t => {
      if (t.id === teamId) {
        return { ...t, members: [...t.members, memberEmail] };
      }
      return { ...t, members: t.members.filter(m => m !== memberEmail) };
    });

    onUpdateTeams(updated);

    // Also update user's team property in users state
    const updatedUsers = users.map(u => {
      if (u.email === memberEmail) {
        return { ...u, team: team.name };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
  };

  const handleRemoveMemberFromTeam = (teamId: string, memberEmail: string) => {
    const updated = teams.map(t => {
      if (t.id === teamId) {
        return { ...t, members: t.members.filter(m => m !== memberEmail) };
      }
      return t;
    });
    onUpdateTeams(updated);

    // Update user's team state
    const updatedUsers = users.map(u => {
      if (u.email === memberEmail) {
        return { ...u, team: 'Nenhuma' };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
  };

  // --- APIs Actions ---
  const handleCreateApi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiName || !newApiEndpoint || !newApiToken) return;

    const created: PrintAPI = {
      id: `api-${Date.now()}`,
      name: newApiName,
      endpoint: newApiEndpoint,
      token: newApiToken
    };

    onUpdateApis([...apis, created]);
    setNewApiName('');
    setNewApiEndpoint('');
    setNewApiToken('');
    setNewApiOpen(false);
  };

  const handleRemoveApi = (id: string) => {
    if (confirm('Remover integração de API de impressão?')) {
      onUpdateApis(apis.filter(a => a.id !== id));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Painel do Administrador Geral</h1>
          <p className="text-sm text-slate-500">Controle completo de acessos, segurança, parcerias e conexões externas da rede AIprint.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E63946] animate-pulse" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modo Integrado Ativo</span>
        </div>
      </div>

      {/* Tabs list glassmorphism layout */}
      <div className="flex flex-wrap gap-2 mb-8 p-2 rounded-2xl glass-card">
        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'kpis' ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <ActivityIcon className="h-4 w-4" />
          <span>Visão Geral</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Usuários ({totalUsersCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'teams' ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Grupos de Fichas ({activeTeamsCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('apis')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'apis' ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Integrar APIs ({apis.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'production' ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Auditoria Produção</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. Visão Geral (KPI cards with glassmorphism) */}
      {activeTab === 'kpis' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl p-6 shadow-xl glass-card transition-all duration-300 hover:scale-[1.02] hover:bg-white/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 mb-4">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Usuários Cadastrados</p>
              <h4 className="text-3xl font-extrabold text-slate-800 mt-1">{totalUsersCount}</h4>
              <p className="text-[11px] text-slate-400 mt-1">Colaborando no sistema</p>
            </div>

            <div className="rounded-3xl p-6 shadow-xl glass-card transition-all duration-300 hover:scale-[1.02] hover:bg-white/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Grupos de Fichas</p>
              <h4 className="text-3xl font-extrabold text-slate-800 mt-1">{activeTeamsCount}</h4>
              <p className="text-[11px] text-slate-400 mt-1">Lotes de referência ativos</p>
            </div>

            <div className="rounded-3xl p-6 shadow-xl glass-card transition-all duration-300 hover:scale-[1.02] hover:bg-white/50 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E63946]/10 text-[#E63946] mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Pedidos Pendentes</p>
                <h4 className="text-3xl font-extrabold text-slate-800 mt-1">{pendingOrdersCount}</h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Em fila ou impressão ativa</p>
            </div>

            <div className="rounded-3xl p-6 shadow-xl glass-card transition-all duration-300 hover:scale-[1.02] hover:bg-white/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Parceiros Patrocinadores</p>
              <h4 className="text-3xl font-extrabold text-slate-800 mt-1">{sponsorCount}</h4>
              <p className="text-[11px] text-slate-400 mt-1">Inscritos ou faturados</p>
            </div>
          </div>

          {/* Quick Informational section */}
          <div className="rounded-3xl p-6 shadow-xl glass-card space-y-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-[#E63946]" />
              Guia de Controle AIprint
            </h3>
            <p className="text-slate-600 text-sm max-w-4xl">
              Como administrador, você dita os rumos de acesso. Todas as simulações executadas pelos perfis (como envio de PDF por Coordenador, pagamento de boleto simulado pelo Patrocinador e autorização rápida por parte da Produção) modificam em tempo real estas métricas e refletem-se mutuamente. Use os botões das abas acima para testar e auditar alterações.
            </p>
          </div>
        </div>
      )}

      {/* 2. Gestão de Usuários */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center p-4 rounded-2xl glass-card shadow-md">
            <h3 className="font-bold text-slate-800">Contas Ativas e Níveis de Permissão</h3>
            <button
              onClick={() => setNewUserOpen(!newUserOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Usuário</span>
            </button>
          </div>

          {/* New User Form overlay / card */}
          {newUserOpen && (
            <div className="rounded-3xl p-6 shadow-xl glass-card">
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Cadastrar Novo Usuário</h4>
                  <button type="button" onClick={() => setNewUserOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="block w-full text-xs rounded-lg border border-slate-200 bg-white/50 p-2 text-slate-800 outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">E-mail</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="Ex: joao@aiprint.com"
                      className="block w-full text-xs rounded-lg border border-slate-200 bg-white/50 p-2 text-slate-800 outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nível de Acesso</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => {
                        const role = e.target.value as UserRole;
                        setNewUserRole(role);
                        if (role === 'admin' || role === 'producao') {
                          setNewUserTeam('');
                        }
                      }}
                      className="block w-full text-xs rounded-lg border border-slate-200 bg-white/50 p-2 text-slate-800 outline-none focus:border-[#E63946]"
                    >
                      <option value="admin">Administrador (ADM)</option>
                      <option value="patrocinador">Membro</option>
                      <option value="coordenador">Coordenador de Comunicação</option>
                      <option value="producao">Operador de Produção</option>
                      <option value="trio">Trio de Apoio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Equipe / Grupo</label>
                    <select
                      value={(newUserRole === 'admin' || newUserRole === 'producao') ? '' : newUserTeam}
                      onChange={(e) => setNewUserTeam(e.target.value)}
                      disabled={newUserRole === 'admin' || newUserRole === 'producao'}
                      className={`block w-full text-xs rounded-lg border border-slate-200 bg-white/50 p-2 text-slate-800 outline-none focus:border-[#E63946] ${(newUserRole === 'admin' || newUserRole === 'producao') ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                    >
                      <option value="">Nenhuma</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                    {(newUserRole === 'admin' || newUserRole === 'producao') && (
                      <p className="text-[10px] text-amber-600 mt-1 font-semibold">ADM e Produção são operadores essenciais e não participam de equipes.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewUserOpen(false)}
                    className="text-xs px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="text-xs px-4 py-2 bg-[#E63946] hover:bg-[#d62839] text-white font-bold rounded-lg"
                  >
                    Adicionar Usuário
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* User List Glass Table */}
          <div className="overflow-x-auto rounded-3xl glass-card shadow-xl">
            <table className="min-w-full divide-y divide-slate-200/40">
              <thead className="bg-[#E63946]/5">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Acesso</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Organização / Equipe</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                      {editingUser?.id === user.id ? (
                        <input
                          type="text"
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          className="border border-slate-300 rounded px-2 py-1 bg-white"
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser?.id === user.id ? (
                        <select
                          value={editingUser.role}
                          onChange={(e) => {
                            const nextRole = e.target.value as UserRole;
                            const isExternal = nextRole === 'admin' || nextRole === 'producao';
                            setEditingUser({
                              ...editingUser,
                              role: nextRole,
                              team: isExternal ? 'Nenhuma' : editingUser.team
                            });
                          }}
                          className="border border-slate-300 rounded px-1.5 py-1 bg-white text-xs outline-none focus:border-[#E63946]"
                        >
                          <option value="admin">Administrador</option>
                          <option value="patrocinador">Membro</option>
                          <option value="coordenador">Coordenador de Comunicação</option>
                          <option value="producao">Produção</option>
                          <option value="trio">Trio de Apoio</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-white/60 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800 capitalize">
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {editingUser?.id === user.id ? (
                        editingUser.role === 'admin' || editingUser.role === 'producao' ? (
                          <span className="text-xs text-amber-600 font-semibold italic">Não aplicável (Externo)</span>
                        ) : (
                          <select
                            value={editingUser.team || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, team: e.target.value })}
                            className="border border-slate-300 rounded px-1.5 py-1 bg-white text-xs outline-none focus:border-[#E63946]"
                          >
                            <option value="Nenhuma">Nenhuma</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                          </select>
                        )
                      ) : (
                        user.team || 'Nenhuma'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {editingUser?.id === user.id ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={handleSaveEditUser} className="text-emerald-600 hover:text-emerald-800" title="Salvar">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditingUser(null)} className="text-red-600 hover:text-red-800" title="Cancelar">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleStartEditUser(user)} className="text-indigo-600 hover:text-indigo-800" title="Editar">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleRemoveUser(user.id, user.email)} className="text-[#E63946] hover:text-red-800" title="Excluir">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Gestão de Equipes */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Left panel: Team list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center p-4 rounded-2xl glass-card shadow-md">
              <h3 className="font-bold text-slate-800">Grupos de Fichas e Faturamento</h3>
              <button
                onClick={() => setNewTeamOpen(!newTeamOpen)}
                className="flex items-center gap-1 text-xs font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus className="h-3 w-3" />
                <span>Criar Grupo</span>
              </button>
            </div>

            {newTeamOpen && (
              <form onSubmit={handleCreateTeam} className="rounded-2xl p-4 shadow-md space-y-3 glass-card">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Configurar Nome do Grupo de Fichas</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Ex: Colegiado de Fichas de Referência Centro"
                    className="flex-grow text-xs rounded-lg border border-slate-200 bg-white/50 p-2 text-slate-800 outline-none focus:border-[#E63946]"
                  />
                  <button type="submit" className="text-xs bg-[#E63946] hover:bg-[#d62839] text-white px-4 py-2 rounded-lg font-bold">
                    Salvar
                  </button>
                </div>
              </form>
            )}

            {/* Teams display production sheets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => {
                const teamUsers = users.filter(u => u.team === team.name);
                const coordinatorsCount = teamUsers.filter(u => u.role === 'coordenador').length;
                const trioCount = teamUsers.filter(u => u.role === 'trio').length;
                const sponsorsCount = teamUsers.filter(u => u.role === 'patrocinador').length;
                const isFormulationValid = coordinatorsCount === 1 && trioCount === 3;

                return (
                  <div key={team.id} className="rounded-3xl p-5 shadow-xl glass-card flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-800 text-base">{team.name}</h4>
                          <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-extrabold uppercase ${
                            isFormulationValid 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isFormulationValid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span>{isFormulationValid ? 'Formulação Válida' : 'Formulação Pendente'}</span>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveTeam(team.id)} className="text-slate-400 hover:text-[#E63946] transition-colors" title="Deletar Equipe">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Rule criteria values */}
                      <div className="bg-slate-50/50 border border-slate-200/30 p-3 rounded-xl mb-4 text-[10.5px] text-slate-600 space-y-1.5">
                        <div className="flex justify-between">
                          <span>1 Coordenador:</span>
                          <span className={coordinatorsCount === 1 ? 'text-emerald-600 font-extrabold' : 'text-slate-500 font-bold'}>
                            {coordinatorsCount} / 1 {coordinatorsCount === 1 ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Exatamente 3 Trio de Apoio:</span>
                          <span className={trioCount === 3 ? 'text-emerald-600 font-extrabold' : 'text-slate-500 font-bold'}>
                            {trioCount} / 3 {trioCount === 3 ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Membros:</span>
                          <span className="text-slate-600 font-extrabold">{sponsorsCount}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Membros Integrados ({team.members.length})</p>
                        {team.members.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Sem nenhum membro vinculado ainda.</p>
                        ) : (
                          <div className="divide-y divide-slate-100/10">
                            {team.members.map((email) => {
                              const foundUser = users.find(u => u.email === email);
                              return (
                                <div key={email} className="flex items-center justify-between py-1.5 text-xs">
                                  <span className="text-slate-700 truncate" title={email}>
                                    {foundUser?.name || email} ({foundUser?.role || 'N/A'})
                                  </span>
                                  <button
                                    onClick={() => handleRemoveMemberFromTeam(team.id, email)}
                                    className="text-red-500 hover:text-red-700 font-bold p-1 text-[10px]"
                                    title="Remover da Equipe"
                                  >
                                    Remover
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Add member select box */}
                  <div className="mt-4 pt-3 border-t border-slate-200/15 flex flex-col gap-1.5 animate-in fade-in">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adicionar Integrante Elegível</label>
                    <select
                      id={`select-team-add-member-${team.id}`}
                      defaultValue=""
                      onChange={(e) => {
                        handleAddMemberToTeam(team.id, e.target.value);
                        e.target.value = ""; // Reset
                      }}
                      className="w-full text-[11px] rounded border border-slate-200 bg-white/40 p-1.5 text-slate-800 outline-none focus:border-[#E63946]"
                    >
                      <option value="" disabled>Conectar integrante...</option>
                      {users
                        .filter(u => !team.members.includes(u.email) && (u.role === 'coordenador' || u.role === 'patrocinador' || u.role === 'trio'))
                        .map(u => (
                          <option key={u.id} value={u.email}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                    <p className="text-[9px] text-slate-400 font-mono mt-1 select-none">Somente Coordenador, Membros e Trio de Apoio são convocáveis para grupos.</p>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Informational block */}
          <div className="rounded-3xl p-6 shadow-xl glass-card h-fit space-y-4">
            <h4 className="text-md font-bold text-slate-800">Regras de Organização & Grupos</h4>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                As equipes e grupos de trabalho na rede AIprint possuem atribuições específicas de cooperação logística e marketing local:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Coordenador:</strong> Administra e lidera as ações do grupo.</li>
                <li><strong>Membros:</strong> Financiam e viabilizam a produção das fichas de produção.</li>
                <li><strong>Trio de Apoio:</strong> Realiza a distribuição física e a logística local.</li>
              </ul>
              <p className="font-semibold text-indigo-600">
                Atenção: Os usuários Administradores e operadores de Produção atuam no nível de suporte e funcionamento do sistema, não integrando grupos de faturamento físico ou logístico.
              </p>
            </div>
            <div className="p-3 bg-[#E63946]/5 rounded-lg border border-[#E63946]/10 text-xs text-[#E63946]">
              <strong>Ajuda:</strong> Se um novo integrante do Trio ou Membro não aparecer para conexão na lista à esquerda, cadastre ou atualize a conta dele na aba <strong>Usuários</strong>.
            </div>
          </div>
        </div>
      )}

      {/* 4. Configuração de APIs */}
      {activeTab === 'apis' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center p-4 rounded-2xl glass-card shadow-md">
            <div>
              <h3 className="font-bold text-slate-800">Integração Gráfica e APIs de Impressão</h3>
              <p className="text-xs text-slate-500">Credencie endpoints de terceiros para o envio automatizado de PDFs pós aprovação.</p>
            </div>
            <button
              onClick={() => setNewApiOpen(!newApiOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-3.5 py-2 rounded-lg transition-all shadow shadow-red-500/10"
            >
              <Plus className="h-4 w-4" />
              <span>Conectar API</span>
            </button>
          </div>

          {/* Add API Form */}
          {newApiOpen && (
            <div className="rounded-3xl p-6 shadow-xl glass-card">
              <form onSubmit={handleCreateApi} className="space-y-4 max-w-xl">
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-[#E63946]" />
                    Adicionar Credencial de Disparo Gráfico
                  </h4>
                  <button type="button" onClick={() => setNewApiOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome identificador da Gráfica / API</label>
                    <input
                      type="text"
                      required
                      value={newApiName}
                      onChange={(e) => setNewApiName(e.target.value)}
                      placeholder="Ex: PrintMaster Lote Rápido"
                      className="block w-full text-xs rounded-lg border border-slate-200 bg-white/50 p-2 text-slate-800 outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Endpoint de Rest API (HTTPS)</label>
                    <input
                      type="url"
                      required
                      value={newApiEndpoint}
                      onChange={(e) => setNewApiEndpoint(e.target.value)}
                      placeholder="https://api.graficalider.com/v2/print_jobs"
                      className="block w-full text-xs rounded-lg border border-slate-200 bg-white/50 p-2 text-slate-800 outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Bearer Token / Chave Secreta</label>
                    <input
                      type="text"
                      required
                      value={newApiToken}
                      onChange={(e) => setNewApiToken(e.target.value)}
                      placeholder="g_live_secret_key_•••••••••••••••"
                      className="block w-full text-xs rounded-lg border border-slate-200 bg-white/50 p-2 text-slate-800 outline-none focus:border-[#E63946]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewApiOpen(false)}
                    className="text-xs px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-500"
                  >
                    Recusar
                  </button>
                  <button
                    type="submit"
                    className="text-xs px-4 py-1.5 bg-[#E63946] text-white font-bold rounded-lg shadow"
                  >
                    Configurar Token
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of configured APIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apis.map((a) => (
              <div key={a.id} className="relative rounded-3xl p-5 shadow-xl glass-card">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex items-center rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200 uppercase">
                    API Ativa
                  </span>
                  <button onClick={() => handleRemoveApi(a.id)} className="text-slate-400 hover:text-red-500" title="Apagar Chave">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">{a.name}</h4>
                <div className="text-xs text-slate-400 space-y-1.5 mt-2">
                  <div className="bg-white/40 p-2 rounded border border-white/30 font-mono text-[10px] text-slate-600 truncate">
                    <strong>URL:</strong> {a.endpoint}
                  </div>
                  <div className="bg-white/40 p-2 rounded border border-white/30 font-mono text-[10px] text-slate-600 truncate">
                    <strong>Token:</strong> bearer {a.token.substring(0, 8)}••••••••••
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Auditoria de Produção */}
      {activeTab === 'production' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl glass-card shadow-md">
            <h3 className="font-bold text-slate-800">Histórico e Status de Todos os Pedidos</h3>
            <p className="text-xs text-slate-500">Visualização de auditoria sobre a fila integrada enviada por coordenadores.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl glass-card shadow-xl">
            <table className="min-w-full divide-y divide-slate-200/40">
              <thead className="bg-[#E63946]/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Arquivo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tipo Papel</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Cópias</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Enviado por</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Data Envio</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20 text-sm">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">Nenhum pedido de ficha de produção cadastrado no momento.</td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">#{o.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{o.filename}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{o.paperType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-800 font-bold">{o.copies}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">{o.sentBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{o.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                          o.status === 'entregue'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'em impressão'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback icon to prevent missing import crash
function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
