import { useState } from 'react';
import { Printer, CheckCircle, Play, Search, Package, Download } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { mapaReferenciaService } from '../../services/storeService';
import { formatarData } from '../../utils/format';
import type { StatusMapaReferencia } from '../../types';

const sequencia: StatusMapaReferencia[] = ['recebido', 'em_producao', 'pronto', 'entregue'];

const LABEL: Record<StatusMapaReferencia, string> = {
  recebido:    'Recebido',
  em_producao: 'Em Produção',
  pronto:      'Pronto',
  entregue:    'Entregue',
};

const BADGE: Record<StatusMapaReferencia, string> = {
  recebido:    'bg-amber-100 text-amber-700 border-amber-200',
  em_producao: 'bg-blue-100 text-blue-700 border-blue-200',
  pronto:      'bg-indigo-100 text-indigo-700 border-indigo-200',
  entregue:    'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function ProductionDashboard() {
  const { mapaReferencia, setMapaReferencia, equipes, eventos } = useStore();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroEquipe, setFiltroEquipe] = useState('');

  const filtrados = mapaReferencia.filter(m => {
    const eq = equipes.find(e => e.id === m.equipeId);
    const buscaOk = !busca ||
      (eq?.nome ?? '').toLowerCase().includes(busca.toLowerCase()) ||
      m.nomeArquivo.toLowerCase().includes(busca.toLowerCase());
    const stOk = !filtroStatus || m.status === filtroStatus;
    const eqOk = !filtroEquipe || m.equipeId === filtroEquipe;
    return buscaOk && stOk && eqOk;
  });

  const avancarStatus = async (id: string) => {
    const mapa = mapaReferencia.find(m => m.id === id);
    if (!mapa) return;
    const idx = sequencia.indexOf(mapa.status);
    if (idx === sequencia.length - 1) return;
    const novoStatus = sequencia[idx + 1];
    try {
      const atualizado = await mapaReferenciaService.atualizarStatus(id, novoStatus);
      setMapaReferencia(mapaReferencia.map(m => m.id === id ? atualizado : m));
    } catch {}
  };

  const naFila = mapaReferencia.filter(m => m.status !== 'entregue').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FA]">
      <div className="relative bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-8">
        <div className="blob -top-20 right-0 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Painel de Produção</h1>
            <p className="text-sm text-slate-400 mt-1">Fila de mapas de referência para impressão</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
            <Printer className="h-4 w-4" />
            {naFila} mapa{naFila !== 1 ? 's' : ''} na fila
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
              placeholder="Buscar equipe ou arquivo..."
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
            {sequencia.map(s => <option key={s} value={s}>{LABEL[s]}</option>)}
          </select>
          <div className="flex items-center text-sm text-slate-400 font-medium px-2">
            {filtrados.length} de {mapaReferencia.length} mapas
          </div>
        </div>

        {/* Tabela */}
        {filtrados.length === 0 ? (
          <div className="text-center py-20 rounded-2xl glass-card text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum mapa encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl glass-card shadow-xl">
            <table className="min-w-full divide-y divide-slate-200/40">
              <thead className="bg-[#E63946]/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Equipe / Arquivo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Entregar até</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Endereço</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20">
                {filtrados.map(m => {
                  const eq = equipes.find(e => e.id === m.equipeId);
                  const ev = eventos.find(e => e.id === m.eventoId);
                  const idx = sequencia.indexOf(m.status);
                  const proxStatus = idx < sequencia.length - 1 ? sequencia[idx + 1] : null;
                  const entregue = m.status === 'entregue';
                  return (
                    <tr key={m.id} className={`hover:bg-white/10 transition-colors ${entregue ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{eq?.nome ?? `Equipe ${m.equipeId}`}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{m.nomeArquivo}</p>
                          {m.fileUrl && (
                            <a href={m.fileUrl} target="_blank" rel="noreferrer" title="Baixar PDF" className="text-[#E63946] hover:text-[#d62839]">
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {ev ? <>{ev.titulo}<br /><span className="text-xs text-slate-400">{formatarData(ev.data)}</span></> : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatarData(m.dataEntrega)}<br />
                        <span className="text-xs text-slate-400">{m.horaEntrega}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[180px]">
                        <p className="truncate">{m.enderecoEntrega || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${BADGE[m.status]}`}>
                          {LABEL[m.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {proxStatus && (
                          <button
                            onClick={() => { void avancarStatus(m.id); }}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition mx-auto ${
                              proxStatus === 'entregue'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-500 hover:text-white'
                                : 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20 hover:bg-[#E63946] hover:text-white'
                            }`}
                          >
                            {proxStatus === 'entregue' ? <CheckCircle className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            {LABEL[proxStatus]}
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

        {/* Kanban por status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sequencia.map(st => {
            const items = mapaReferencia.filter(m => m.status === st);
            return (
              <div key={st} className={`rounded-2xl p-4 border ${BADGE[st].split(' ').slice(-1)[0]} bg-white/50`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{LABEL[st]}</p>
                <p className="text-3xl font-extrabold text-slate-800">{items.length}</p>
                {items.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {items.slice(0, 2).map(m => {
                      const eq = equipes.find(e => e.id === m.equipeId);
                      return <p key={m.id} className="text-xs text-slate-500 truncate">{eq?.nome ?? `Equipe ${m.equipeId}`}</p>;
                    })}
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
