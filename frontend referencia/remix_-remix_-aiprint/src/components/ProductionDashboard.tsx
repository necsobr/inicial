/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, Clock, Search, Play, RefreshCw, Send, Check } from 'lucide-react';
import { PrintOrder } from '../types';

interface ProductionDashboardProps {
  orders: PrintOrder[];
  onUpdateOrders: (orders: PrintOrder[]) => void;
}

export default function ProductionDashboard({
  orders,
  onUpdateOrders
}: ProductionDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aguardando' | 'em impressão' | 'entregue'>('all');

  // Simulated live progress interval
  useEffect(() => {
    const printingOrders = orders.filter(o => o.status === 'em impressão' && o.progress < 100);
    if (printingOrders.length === 0) return;

    const interval = setInterval(() => {
      const updated = orders.map(order => {
        if (order.status === 'em impressão' && order.progress < 100) {
          const nextProgress = Math.min(order.progress + Math.floor(Math.random() * 15) + 5, 100);
          
          // If it reached 100, let's keep it 'em impressão' but ready to mark as delivered or auto-deliver
          return {
            ...order,
            progress: nextProgress,
            status: 'em impressão' as const
          };
        }
        return order;
      });
      onUpdateOrders(updated);
    }, 3000);

    return () => clearInterval(interval);
  }, [orders, onUpdateOrders]);

  // Actions
  const handleStartPrint = (orderId: string) => {
    // Calling simulated API endpoint
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'em impressão' as const, progress: 5 };
      }
      return o;
    });
    
    onUpdateOrders(updated);
    alert(`Disparo enviado à API gráfica! Ordem #${orderId} de "${order.filename}" alterada para "em impressão".`);
  };

  const handleMarkAsDelivered = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'entregue' as const, progress: 100 };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  // Filtering
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.filename.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.sentBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Painel de Produção & Fila Gráfica</h1>
          <p className="text-sm text-slate-500 mt-1">Monitore, dispache para plotters integradas e coordene a liberação de lotes de papel.</p>
        </div>
        
        {/* Real-time sync ticker indicator */}
        <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg font-bold">
          <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
          <span>Sincronizando lote real-timer</span>
        </div>
      </div>

      {/* Filter and search parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-3xl glass-card shadow-md">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar arquivos ou e-mails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full text-xs rounded-lg border border-slate-200 bg-white/50 py-2.5 pl-9 pr-3 text-slate-800 outline-none focus:border-[#E63946]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full text-xs rounded-lg border border-slate-200 bg-white/40 py-2.5 px-3 text-slate-700 outline-none focus:border-[#E63946]"
          >
            <option value="all">Filtrar por Todos os Status</option>
            <option value="aguardando">Status: Aguardando</option>
            <option value="em impressão">Status: Em Impressão</option>
            <option value="entregue">Status: Entregue (Histórico)</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-xs text-slate-400 font-semibold px-2">
          Exibindo {filteredOrders.length} de {orders.length} pedidos
        </div>
      </div>

      {/* Main Jobs Table */}
      <div className="overflow-x-auto rounded-3xl glass-card shadow-xl">
        <table className="min-w-full divide-y divide-slate-200/40">
          <thead className="bg-[#E63946]/5">
            <tr>
              <th className="px-3 md:px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Arquivo PDF</th>
              <th className="px-3 md:px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Especificações</th>
              <th className="px-3 md:px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Tiragem</th>
              <th className="px-3 md:px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Enviado em</th>
              <th className="px-3 md:px-6 py-3.5 text-center text-xs font-bold text-slate-600 uppercase">Status de Produção</th>
              <th className="px-3 md:px-6 py-3.5 text-center text-xs font-bold text-slate-600 uppercase">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/20 text-sm">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 md:px-6 py-12 text-center text-slate-400 italic">Nenhum pedido de impressão coincide com o filtro atual.</td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/10 transition-colors">
                  <td className="px-3 md:px-6 py-3">
                    <div className="font-extrabold text-slate-800 break-words">{o.filename}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Disparado por: {o.sentBy}</div>
                    {o.deliveryDate && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                        <span>🚚 Previsão: {o.deliveryDate.split('-').reverse().join('/')} {o.deliveryTime ? `às ${o.deliveryTime}` : ''}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 text-slate-600 text-xs font-medium uppercase">{o.paperType}</td>
                  <td className="px-3 md:px-6 py-3 text-slate-800 font-extrabold whitespace-nowrap">{o.copies} un</td>
                  <td className="px-3 md:px-6 py-3 text-xs text-slate-500 whitespace-nowrap">{o.date}</td>
                  <td className="px-3 md:px-6 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold uppercase border ${
                      o.status === 'entregue'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : o.status === 'em impressão'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {o.status === 'entregue' ? 'Pronto' : o.status === 'em impressão' ? 'Em Andamento' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 whitespace-nowrap text-center animate-none">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleStartPrint(o.id)}
                        disabled={o.status !== 'aguardando'}
                        className="flex items-center gap-1 bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 hover:bg-[#E63946] hover:text-white px-2 py-1 rounded-md text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                        title="Liberar para Impressora"
                      >
                        <Play className="h-3 w-3" />
                        <span>Imprimir</span>
                      </button>

                      <button
                        onClick={() => handleMarkAsDelivered(o.id)}
                        disabled={o.status === 'entregue'}
                        className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded-md text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                        title="Marcar como entregue"
                      >
                        <Check className="h-3 w-3" />
                        <span>Entregar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simulated Live Delivery Ticker Log */}
      <div className="rounded-3xl p-6 shadow-xl glass-card">
        <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">Histórico Log da Linha Logística</h3>
        <div className="font-mono text-[11px] text-slate-600 p-4 rounded-xl border border-white/20 bg-white/40 space-y-2">
          <div>[2026-06-03 14:15] DISPACHO: Ficha_Producao_Centro_Historico.pdf liberado pela API de impressão AIprint.</div>
          <div>[2026-06-03 16:30] LOGÍSTICA: Lote #ord-1 da ficha de produção do centro histórico entregue com sucesso aos promotores.</div>
          <div className="text-[#E63946]/85 animate-pulse">[2026-06-03 19:42] ATUALIZAÇÃO: Monitorando progresso de fichas de referência e faturamento ativo...</div>
        </div>
      </div>
    </div>
  );
}
