import { useState } from 'react';
import { Printer, CheckCircle, Play, Filter, Search, Package } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { formatarDataHora, formatarData, labelStatusImpressao } from '../../utils/format';
import type { StatusImpressao } from '../../types';

const sequencia: StatusImpressao[] = ['recebido', 'em_producao', 'pronto', 'entregue'];

const badgeStatus: Record<string, string> = {
  recebido: 'bg-amber-100 text-amber-700 border-amber-200',
  em_producao: 'bg-blue-100 text-blue-700 border-blue-200',
  pronto: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  entregue: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function ProductionDashboard() {
  const { requisicoes, setRequisicoes, equipes } = useStore();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroEquipe, setFiltroEquipe] = useState('');

  const filtradas = requisicoes.filter(r => {
    const buscaOk = !busca ||
      r.equipeNome.toLowerCase().includes(busca.toLowerCase()) ||
      r.solicitanteNome.toLowerCase().includes(busca.toLowerCase());
    const stOk = !filtroStatus || r.status === filtroStatus;
    const eqOk = !filtroEquipe || r.equipeId === filtroEquipe;
    return buscaOk && stOk && eqOk;
  });

  const avancarStatus = (id: string) => {
    setRequisicoes(requisicoes.map(r => {
      if (r.id !== id) return r;
      const idx = sequencia.indexOf(r.status);
      if (idx === sequencia.length - 1) return r;
      return { ...r, status: sequencia[idx + 1] };
    }));
  };

  const naFila = requisicoes.filter(r => r.status !== 'entregue').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FA]">
      <div className="relative bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-8">
        <div className="blob -top-20 right-0 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Painel de Produção</h1>
            <p className="text-sm text-slate-400 mt-1">Fila de requisições de impressão</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
            <Printer className="h-4 w-4" />
            {naFila} pedido{naFila !== 1 ? 's' : ''} na fila
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 p-4 rounded-2xl glass-card">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar equipe ou solicitante..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-[#E63946]"
            />
          </div>
          <select
            value={filtroEquipe}
            onChange={e => setFiltroEquipe(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-[#E63946]"
          >
            <option value="">Todas as equipes</option>
            {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
          </select>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-[#E63946]"
          >
            <option value="">Todos os status</option>
            <option value="recebido">Recebido</option>
            <option value="em_producao">Em Produção</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
          </select>
          <div className="flex items-center text-sm text-slate-400 font-medium px-2">
            {filtradas.length} de {requisicoes.length} requisições
          </div>
        </div>

        {/* Lista / Tabela */}
        {filtradas.length === 0 ? (
          <div className="text-center py-20 rounded-2xl glass-card text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma requisição encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl glass-card shadow-xl">
            <table className="min-w-full divide-y divide-slate-200/40">
              <thead className="bg-[#E63946]/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Equipe / Solicitante</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Qtd.</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Data Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Observações</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20">
                {filtradas.map(r => {
                  const idx = sequencia.indexOf(r.status);
                  const proxStatus = idx < sequencia.length - 1 ? sequencia[idx + 1] : null;
                  const entregue = r.status === 'entregue';
                  return (
                    <tr key={r.id} className={`hover:bg-white/10 transition-colors ${entregue ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{r.equipeNome}</p>
                        <p className="text-xs text-slate-400">{r.solicitanteNome} · {formatarDataHora(r.dataCriacao)}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-slate-800">{r.quantidade}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatarData(r.dataEvento)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">
                        <p className="truncate">{r.observacoes || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStatus[r.status]}`}>
                          {labelStatusImpressao(r.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {proxStatus && (
                          <button
                            onClick={() => avancarStatus(r.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition mx-auto ${
                              proxStatus === 'entregue'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-500 hover:text-white'
                                : 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20 hover:bg-[#E63946] hover:text-white'
                            }`}
                          >
                            {proxStatus === 'entregue' ? <CheckCircle className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            {labelStatusImpressao(proxStatus)}
                          </button>
                        )}
                        {entregue && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-center">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Concluído
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban simplificado por status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sequencia.map(st => {
            const items = requisicoes.filter(r => r.status === st);
            return (
              <div key={st} className={`rounded-2xl p-4 border ${badgeStatus[st].replace('text-', 'border-').split(' ').slice(-1)[0]} bg-white/50`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{labelStatusImpressao(st)}</p>
                <p className="text-3xl font-extrabold text-slate-800">{items.length}</p>
                {items.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {items.slice(0, 2).map(r => (
                      <p key={r.id} className="text-xs text-slate-500 truncate">{r.equipeNome}</p>
                    ))}
                    {items.length > 2 && <p className="text-xs text-slate-400">+{items.length - 2} mais</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
