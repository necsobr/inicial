import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { formatarDataHora, labelStatusImpressao } from '../../utils/format';

const badgeStatus: Record<string, string> = {
  recebido: 'bg-amber-100 text-amber-700 border-amber-200',
  em_producao: 'bg-blue-100 text-blue-700 border-blue-200',
  pronto: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  entregue: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function ProductionPage() {
  const { requisicoes, equipes } = useStore();
  const [filtroEquipe, setFiltroEquipe] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const filtradas = requisicoes.filter(r => {
    const eqOk = !filtroEquipe || r.equipeId === filtroEquipe;
    const stOk = !filtroStatus || r.status === filtroStatus;
    return eqOk && stOk;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Visão Geral de Produção</h1>
        <p className="text-sm text-slate-500">Todas as requisições de impressão de todas as equipes</p>
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
          <option value="recebido">Recebido</option>
          <option value="em_producao">Em Produção</option>
          <option value="pronto">Pronto</option>
          <option value="entregue">Entregue</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl glass-card shadow-xl">
        <table className="min-w-full divide-y divide-slate-200/40">
          <thead className="bg-[#E63946]/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Equipe</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Solicitante</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Qtd.</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Data do Evento</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Observações</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/20">
            {filtradas.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Nenhuma requisição encontrada.</td></tr>
            ) : filtradas.map(r => (
              <tr key={r.id} className="hover:bg-white/10 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">{r.equipeNome}</p>
                  <p className="text-xs text-slate-400">{formatarDataHora(r.dataCriacao)}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-700">{r.solicitanteNome}</p>
                  <p className="text-xs text-slate-400">{r.solicitanteEmail}</p>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{r.quantidade}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {r.dataEvento.split('-').reverse().join('/')}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{r.observacoes || '—'}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStatus[r.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {labelStatusImpressao(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
