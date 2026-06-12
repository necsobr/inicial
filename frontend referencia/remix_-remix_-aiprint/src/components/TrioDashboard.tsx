/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, Check, UserPlus, Award, CheckCircle2, AlertTriangle, Sparkles, Filter, Trash2 } from 'lucide-react';
import { NotificationItem } from '../types';

interface TrioDashboardProps {
  notifications: NotificationItem[];
  onUpdateNotifications: (notifications: NotificationItem[]) => void;
}

export default function TrioDashboard({
  notifications,
  onUpdateNotifications
}: TrioDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'member' | 'sponsor' | 'delivery'>('all');

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    onUpdateNotifications(updated);
  };

  const handleMarkSingleRead = (id: string) => {
    const updated = notifications.map(n => {
      if (n.id === id) {
        return { ...n, read: true };
      }
      return n;
    });
    onUpdateNotifications(updated);
  };

  const handleRemoveSingle = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    onUpdateNotifications(updated);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'member': 
        return <UserPlus className="h-5 w-5 text-indigo-500" />;
      case 'sponsor': 
        return <Award className="h-5 w-5 text-[#E63946]" />;
      case 'delivery': 
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default: 
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };

  const getCategoryTheme = (type: string, read: boolean) => {
    const base = 'glass-card border-l-4 rounded-r-3xl rounded-l-md ';
    if (read) return base + 'border-slate-350 opacity-60';
    switch(type) {
      case 'member': return base + 'border-indigo-500 shadow-indigo-500/5';
      case 'sponsor': return base + 'border-[#E63946] shadow-[#E63946]/5';
      case 'delivery': return base + 'border-emerald-500 shadow-emerald-500/5';
      default: return base + 'border-amber-400 shadow-amber-400/5';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Painel do Trio de Apoio</h1>
          <p className="text-sm text-slate-500 mt-1 mt-1">Acompanhe alertas em lote do status logístico, novas marcas e alteração de recursos em tempo real.</p>
        </div>
        
        {unreadCount > 0 && (
          <button
            id="btn-trio-mark-all-read"
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Marcar Todas como Lidas ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Grid Filter Category selections */}
      <div className="flex flex-wrap gap-2 mb-6 p-2 rounded-2xl glass-card">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            filter === 'all' ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20' : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <span>Todos</span>
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            filter === 'unread' ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20' : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <span>Não Lidas ({unreadCount})</span>
        </button>
        <button
          onClick={() => setFilter('member')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            filter === 'member' ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20' : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <span>Membros</span>
        </button>
        <button
          onClick={() => setFilter('sponsor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            filter === 'sponsor' ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20' : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <span>Patrocinadores</span>
        </button>
        <button
          onClick={() => setFilter('delivery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            filter === 'delivery' ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20' : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <span>Logística</span>
        </button>
      </div>

      {/* FEED LIST */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-white/30 bg-white/20 p-12 text-center text-slate-400 italic">
            Nenhum alerta pendente nesta lista no momento.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`relative p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4 ${getCategoryTheme(notif.type, notif.read)}`}
            >
              {/* Left Column Symbol */}
              <div className="flex-shrink-0 p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                {getIcon(notif.type)}
              </div>

              {/* Center Details */}
              <div className="flex-grow space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notif.type}</span>
                  {!notif.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E63946]" title="Não Lido" />
                  )}
                </div>
                <p className="text-slate-800 text-sm font-semibold leading-relaxed break-words">{notif.message}</p>
                <p className="text-[10px] text-slate-400 font-medium">{notif.timestamp}</p>
              </div>

              {/* Action columns */}
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkSingleRead(notif.id)}
                    className="p-1 px-2.5 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 rounded bg-white text-[10px] font-bold shadow-sm cursor-pointer"
                    title="Lido"
                  >
                    Marcar como Lida
                  </button>
                )}
                <button
                  onClick={() => handleRemoveSingle(notif.id)}
                  className="p-1.5 text-slate-400 hover:text-[#E63946] hover:bg-[#E63946]/5 rounded-lg transition-colors cursor-pointer"
                  title="Apagar Notificação"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
