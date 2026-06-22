import { useState } from 'react';
import { CheckCircle, X, Filter } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { sponsorshipService } from '../../services/storeService';
import { formatarMoeda, formatarData, labelStatusPatrocinio } from '../../utils/format';
import type { StatusPatrocinio } from '../../types';

const badgeStatus: Record<string, string> = {
  aguardando_aprovacao: 'bg-amber-100 text-amber-700 border-amber-200',
  aprovada: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  recusada: 'bg-red-100 text-red-700 border-red-200',
  concluida: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function SponsorsPage() {
  const { solicitacoes, setSolicitacoes, equipes } = useStore();
  const [filtroEquipe, setFiltroEquipe] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const filtradas = solicitacoes.filter(s => {
    const eqOk = !filtroEquipe || s.equipeId === filtroEquipe;
    const stOk = !filtroStatus || s.status === filtroStatus;
    return eqOk && stOk;
  });

  const atualizar = async (id: string, status: StatusPatrocinio) => {
    try {
      const atualizada = await sponsorshipService.atualizarStatus(id, status);
      setSolicitacoes(solicitacoes.map(s => s.id === id ? atualizada : s));
    } catch {}
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Patrocinadores</h1>
        <p className="text-sm text-slate-500">Aprove ou recuse solicitações de patrocínio</p>
      </div>

      <div className="flex flex-wrap gap-3 p-4 rounded-2xl glass-card">
        <Filter className="h-4 w-4 text-slate-400 self-center" />
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
          <option value="aguardando_aprovacao">Aguardando Aprovação</option>
          <option value="aprovada">Aprovada</option>
          <option value="recusada">Recusada</option>
          <option value="concluida">Concluída</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl glass-card shadow-xl">
        <table className="min-w-full divide-y divide-slate-200/40">
          <thead className="bg-[#E63946]/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Equipe / Mapa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Período</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Valor</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/20">
            {filtradas.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Nenhuma solicitação encontrada.</td></tr>
            ) : filtradas.map(s => (
              <tr key={s.id} className="hover:bg-white/10 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">{s.empresa}</p>
                  <p className="text-xs text-slate-400">{s.patrocinadorNome}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{s.equipeNome}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  <p>Semana: {formatarData(s.semana)}</p>
                  <p className="text-xs text-slate-400">Solicitado em {formatarData(s.dataSolicitacao)}</p>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{formatarMoeda(s.valor)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStatus[s.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {labelStatusPatrocinio(s.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => atualizar(s.id, 'aprovada')}
                      disabled={s.status === 'aprovada' || s.status === 'concluida'}
                      className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-500 hover:text-white px-2.5 py-1.5 rounded-lg transition disabled:opacity-40"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => atualizar(s.id, 'recusada')}
                      disabled={s.status === 'recusada' || s.status === 'concluida'}
                      className="flex items-center gap-1 text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-500 hover:text-white px-2.5 py-1.5 rounded-lg transition disabled:opacity-40"
                    >
                      <X className="h-3.5 w-3.5" />
                      Recusar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
