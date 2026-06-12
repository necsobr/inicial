/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Lock, Shield, Save, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface UserProfileProps {
  currentUser: User;
  users: User[];
  onUpdateProfile: (updatedUser: User) => void;
  onBackToDashboard: () => void;
}

export default function UserProfile({
  currentUser,
  users,
  onUpdateProfile,
  onBackToDashboard
}: UserProfileProps) {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [password, setPassword] = useState(currentUser.password || '123456');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('O nome não pode estar vazio.');
      return;
    }

    if (!email.trim()) {
      setError('O e-mail não pode estar vazio.');
      return;
    }

    // Check if the new email is already taken by ANOTHER user
    const emailTaken = users.some(
      u => u.id !== currentUser.id && u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (emailTaken) {
      setError('Este e-mail já está sendo utilizado por outro usuário no sistema.');
      return;
    }

    setIsSaving(true);

    // Simulate saving delay for high-fidelity feel
    setTimeout(() => {
      const updatedUser: User = {
        ...currentUser,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim()
      };

      onUpdateProfile(updatedUser);
      setIsSaving(false);
      setSuccess('Seu perfil foi atualizado com sucesso! Suas novas credenciais estão salvas.');
    }, 800);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Personalizar Dados</h1>
          <p className="text-xs text-slate-500 mt-0.5">Mantenha seu e-mail e telefone de login atualizados.</p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white shadow-sm border border-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer hover:bg-slate-50"
        >
          Voltar ao Painel
        </button>
      </div>

      <div className="rounded-3xl p-8 shadow-xl glass-card border border-white/40 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E63946] text-white shadow-md shadow-[#E63946]/20">
            <span className="text-xl font-black">{name.trim().substring(0, 2).toUpperCase() || 'US'}</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">{name || 'Usuário'}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 bg-[#E63946]/10 text-[#E63946] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                <Shield className="h-3 w-3" />
                {currentUser.role === 'admin' ? 'Administrador' : currentUser.role}
              </span>
              <span className="text-xs text-slate-400 font-medium">| Grupo: {currentUser.team || 'Nenhum'}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-[#E63946] border border-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nome Completo / Empresa</label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-3 text-xs text-slate-800 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Grupo Associado</label>
              <div className="relative rounded-xl shadow-sm bg-slate-100 border border-slate-200/60 py-3 px-3 text-xs text-slate-500 font-semibold cursor-not-allowed">
                {currentUser.team || 'Nenhum'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Sua associação de grupo é controlada pelo administrador central.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">E-mail de Login</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Esse será seu novo e-mail para efetuar login no sistema.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Número de Telefone</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Telefone de contato para atualizações de faturamento.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Senha do Painel</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mudar senha"
                className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Guarde sua nova senha para logins futuros.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-[#E63946] py-3 px-6 text-xs font-extrabold text-white shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Salvando Alterações...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Meus Dados</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
