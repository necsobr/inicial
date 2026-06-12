/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, User as UserIcon, LogOut, Settings, Menu, X, Bell } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  hasAdminAccess: boolean;
  unreadCount: number;
}

export default function Navbar({
  currentUser,
  onLogout,
  onNavigate,
  currentView,
  hasAdminAccess,
  unreadCount
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('landing')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              AI<span className="text-[#E63946]">print</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="text-sm font-medium text-slate-600 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/40 border border-white/40">
                  <UserIcon className="h-4 w-4 text-[#E63946]" />
                  <span>
                    Olá, <strong className="text-slate-800">{currentUser.name}</strong> 
                    <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-[#E63946]/10 text-[#E63946] font-semibold capitalize">
                      {currentUser.role === 'admin' ? 'Administrador' : currentUser.role}
                    </span>
                  </span>
                </span>

                {/* Dashboard Shortcut link */}
                <button
                  id="btn-goto-dashboard"
                  onClick={() => handleNavClick('dashboard')}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentView === 'dashboard'
                      ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                >
                  Painel Principal
                </button>

                {/* Profile Shortcut link */}
                <button
                  id="btn-goto-profile"
                  onClick={() => handleNavClick('profile')}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentView === 'profile'
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                  title="Configurar meu e-mail, telefone e senha"
                >
                  Meu Perfil
                </button>

                {/* ADM Quick panel access */}
                {hasAdminAccess && (
                  <button
                    id="btn-goto-admin"
                    onClick={() => handleNavClick('admin')}
                    className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border transition-all duration-200 ${
                      currentView === 'admin'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'text-slate-700 bg-white/45 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Configurações e Administração Geral"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                )}

                {/* Trio Badge Icon link if we are Trio to jump and see notifications */}
                {currentUser.role === 'trio' && (
                  <button
                    id="btn-nav-notifications"
                    onClick={() => handleNavClick('dashboard')}
                    className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100/50 rounded-lg transition-all"
                    title="Notificações do Trio"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E63946] text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Logout */}
                <button
                  id="btn-logout-desktop"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#E63946] px-3 py-2 rounded-lg hover:bg-[#E63946]/5 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <button
                id="btn-login-entry"
                onClick={() => handleNavClick('login')}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#d62839] px-5 py-2.5 rounded-xl shadow-lg shadow-[#E63946]/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Acessar Plataforma</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && currentUser.role === 'trio' && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="relative p-2 text-slate-600 rounded-lg"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E63946] text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-3">
          {currentUser ? (
            <div className="space-y-3">
              <div className="pb-3 border-b border-slate-100">
                <p className="text-xs text-slate-400">Usuário ativo</p>
                <p className="font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
              </div>

              <button
                id="btn-mobile-nav-dashboard"
                onClick={() => handleNavClick('dashboard')}
                className="w-full text-left font-medium text-slate-700 hover:text-[#E63946] py-2 rounded-lg"
              >
                Painel Principal
              </button>

              <button
                id="btn-mobile-nav-profile"
                onClick={() => handleNavClick('profile')}
                className="w-full text-left font-medium text-slate-700 hover:text-[#E63946] py-2 rounded-lg"
              >
                Meu Perfil (Meus Dados)
              </button>

              {hasAdminAccess && (
                <button
                  id="btn-mobile-nav-admin"
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center gap-2 text-left font-medium text-slate-700 hover:text-[#E63946] py-2 rounded-lg"
                >
                  <Settings className="h-4 w-4" />
                  <span>Administração</span>
                </button>
              )}

              <button
                id="btn-logout-mobile"
                onClick={onLogout}
                className="w-full flex items-center gap-2 text-left font-medium text-slate-500 hover:text-[#E63946] py-2 border-t border-slate-100 mt-2 hover:bg-red-50 rounded-lg px-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-mobile-login-entry"
              onClick={() => handleNavClick('login')}
              className="w-full text-center font-semibold text-white bg-[#E63946] py-3 rounded-xl shadow-lg"
            >
              Entrar na Plataforma
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
