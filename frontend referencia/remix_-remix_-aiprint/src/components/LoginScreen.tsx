/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, LogIn, Shield, Users, Award, BookOpen, Truck, UserPlus, CheckCircle, Phone, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { User, UserRole, Team } from '../types';

interface LoginScreenProps {
  onLogin: (email: string, role: string) => boolean; // returns success status
  users: User[];
  teams?: Team[];
  onRegister: (newUser: User) => void;
}

export default function LoginScreen({ onLogin, users, teams = [], onRegister }: LoginScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('123456'); // defaults or choose
  const [regPhone, setRegPhone] = useState('');
  const [regTeam, setRegTeam] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown search states
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  const handleAutofill = (selectedEmail: string) => {
    setIsRegisterMode(false);
    setEmail(selectedEmail);
    setPassword('123456');
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    // Determine user in system
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // We check if password is correct. If they registered and have a custom password,
    // let's validate it properly. If not, fallback to default '123456'.
    const correctPassword = user?.password || '123456';
    if (password !== correctPassword) {
      setError('Senha incorreta! Use a senha correta ou a padrão 123456.');
      return;
    }

    // Determine role based on user or fallback matching
    let role: UserRole = 'trio';
    if (user) {
      role = user.role;
    } else {
      if (email.includes('admin')) role = 'admin';
      else if (email.includes('patrocinador')) role = 'patrocinador';
      else if (email.includes('coordenador')) role = 'coordenador';
      else if (email.includes('producao')) role = 'producao';
      else if (email.includes('trio')) role = 'trio';
    }

    const success = onLogin(email, role);
    if (!success) {
      setError('Erro ao efetuar login. Usuário não cadastrado.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPassword || !regPhone) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Validate if user already exists
    const emailExists = users.some(u => u.email.toLowerCase() === regEmail.toLowerCase());
    if (emailExists) {
      setError('Este e-mail já está sendo utilizado por outro membro.');
      return;
    }

    const newSponsor: User = {
      id: `usr-${Date.now()}`,
      name: regName,
      email: regEmail,
      role: 'patrocinador',
      team: 'Nenhuma',
      password: regPassword,
      phone: regPhone,
      pendingTeamRequest: regTeam || undefined
    };

    onRegister(newSponsor);
    setSuccessMsg('Cadastro realizado com sucesso! Efetuando login...');
    
    // Auto-login after brief delay
    setTimeout(() => {
      onLogin(regEmail, 'patrocinador');
    }, 1200);
  };

  const shortcuts = [
    { label: 'ADM', email: 'admin@aiprint.com', icon: Shield, color: 'bg-red-500/10 text-red-600', hover: 'hover:bg-red-500/25' },
    { label: 'Membro', email: 'patrocinador@aiprint.com', icon: Award, color: 'bg-indigo-500/10 text-indigo-600', hover: 'hover:bg-indigo-500/25' },
    { label: 'Coordenador', email: 'coordenador@aiprint.com', icon: BookOpen, color: 'bg-emerald-500/10 text-emerald-600', hover: 'hover:bg-emerald-500/25' },
    { label: 'Produção', email: 'producao@aiprint.com', icon: Truck, color: 'bg-amber-500/10 text-amber-600', hover: 'hover:bg-amber-500/25' },
    { label: 'Trio', email: 'trio@aiprint.com', icon: Users, color: 'bg-purple-500/10 text-purple-600', hover: 'hover:bg-purple-500/25' },
  ];

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative blurred blobs to highlight glassmorphism */}
      <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-red-400/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
        {/* Main Glassmorphic Card */}
        <div className="relative rounded-3xl p-8 glass-card shadow-2xl">
          
          {/* Dual Tabs for Login and Register */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/80 rounded-2xl mb-8 border border-slate-200/45">
            <button
              onClick={() => { setIsRegisterMode(false); setError(''); setSuccessMsg(''); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isRegisterMode 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LogIn className="h-3.5 w-3.5 inline mr-1.5" />
              Entrar
            </button>
            <button
              onClick={() => { setIsRegisterMode(true); setError(''); setSuccessMsg(''); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isRegisterMode 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5 inline mr-1.5 text-[#E63946]" />
              Cadastrar-se (Membro)
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {isRegisterMode ? 'Torne-se Membro' : 'Acesse sua conta'}
            </h2>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {isRegisterMode 
                ? 'Crie sua conta para solicitar sua associação e patrocinar fichas do seu grupo' 
                : 'Inicie sessão com um e-mail cadastrado ou atalho'}
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3.5 mb-5 text-xs font-semibold text-[#E63946] border border-red-200">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-50 p-3.5 mb-5 text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isRegisterMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">E-mail</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@aiprint.com"
                    className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none animate-in duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Senha</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none animate-in duration-200"
                  />
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] py-3 text-xs font-bold text-white shadow-lg shadow-[#E63946]/20 hover:bg-[#d62839] hover:shadow-xl transition-all duration-300 transform active:scale-95 cursor-pointer mt-6"
              >
                <LogIn className="h-4 w-4" />
                <span>Entrar no Sistema</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Nome Completo / Empresa</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Coca-Cola S/A ou Carlos Silva"
                    className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none animate-in duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">E-mail</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="parceiro@empresa.com"
                    className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none animate-in duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Número de Telefone</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none animate-in duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Senha</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Escolha uma senha"
                    className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none animate-in duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Grupo Regional para Associação *</label>
                <div className="relative">
                  {/* Dropdown Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsTeamDropdownOpen(!isTeamDropdownOpen);
                      setTeamSearchQuery('');
                    }}
                    className="flex items-center justify-between w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-xs text-slate-800 text-left focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none cursor-pointer"
                  >
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Users className="h-4 w-4 text-[#E63946]" />
                    </div>
                    <span className="truncate">{regTeam || 'Pesquise ou selecione um grupo...'}</span>
                    {isTeamDropdownOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* Hidden field to enforce HTML form validation constraints */}
                  <input
                    type="hidden"
                    name="regTeamRequired"
                    value={regTeam}
                    required
                  />

                  {/* Dropdown List & Search Panel */}
                  {isTeamDropdownOpen && (
                    <div className="absolute z-30 mt-2 w-full rouded-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      {/* Search box within dropdown */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Pesquisar por grupos locais..."
                          value={teamSearchQuery}
                          onChange={(e) => setTeamSearchQuery(e.target.value)}
                          className="block w-full text-[11px] rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-slate-800 placeholder-slate-400 outline-none focus:border-[#E63946] focus:bg-white"
                        />
                      </div>

                      {/* Filtered items */}
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {teams.filter(t => t.name.toLowerCase().includes(teamSearchQuery.toLowerCase())).length === 0 ? (
                          <div className="py-3 text-center text-[11px] text-slate-400 italic">
                            Nenhum grupo encontrado.
                          </div>
                        ) : (
                          teams
                            .filter(t => t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()))
                            .map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  setRegTeam(t.name);
                                  setIsTeamDropdownOpen(false);
                                  setTeamSearchQuery('');
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#E63946]/5 hover:text-[#E63946] transition-colors flex items-center justify-between ${
                                  regTeam === t.name ? 'bg-[#E63946]/10 text-[#E63946] font-bold' : 'text-slate-700'
                                }`}
                              >
                                <span>{t.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono">ID: {t.id}</span>
                              </button>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-slate-400 leading-normal">
                  * Sua solicitação de ingresso será avaliada em tempo real pelo coordenador desta regional.
                </p>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-lg hover:bg-slate-800 transition-all duration-300 transform active:scale-95 cursor-pointer mt-6"
              >
                <UserPlus className="h-4 w-4 text-[#E63946]" />
                <span>Registrar-se como Membro</span>
              </button>
            </form>
          )}
        </div>

        {/* Shortcuts Autofill Glassmorphic Card */}
        <div className="rounded-3xl p-6 shadow-xl glass-card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">Atalhos de Simulação (Preenchimento Automático)</h3>
          
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5">
            {shortcuts.map((shortcut) => {
              const IconComp = shortcut.icon;
              return (
                <button
                  key={shortcut.label}
                  id={`btn-shortcut-${shortcut.label.toLowerCase()}`}
                  onClick={() => handleAutofill(shortcut.email)}
                  className={`flex items-center gap-1.5 p-2 rounded-xl border border-white/20 text-left transition-all duration-200 cursor-pointer ${shortcut.color} ${shortcut.hover} hover:scale-[1.02] shadow-sm`}
                >
                  <IconComp className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold leading-tight">{shortcut.label}</div>
                    <div className="text-[9px] text-slate-500 truncate max-w-[80px]">{shortcut.email.split('@')[0]}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-center text-[11px] text-slate-400">
            A senha para todos os usuários cadastrados é <strong className="text-[#E63946]">123456</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
