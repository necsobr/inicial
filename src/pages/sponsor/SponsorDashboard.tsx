import { useState } from 'react';
import { Star, Plus, Package, CheckCircle, Clock, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { formatarMoeda, formatarData, labelStatusPatrocinio } from '../../utils/format';
import Modal from '../../components/Modal';
import PaymentScreen from './PaymentScreen';
import type { SolicitacaoPatrocinio } from '../../types';

const badgeStatus: Record<string, string> = {
  aguardando_aprovacao: 'bg-amber-100 text-amber-700',
  aprovada: 'bg-indigo-100 text-indigo-700',
  recusada: 'bg-red-100 text-red-700',
  concluida: 'bg-emerald-100 text-emerald-700',
};

const iconStatus: Record<string, React.ReactNode> = {
  aguardando_aprovacao: <Clock className="h-5 w-5 text-amber-500" />,
  aprovada: <CheckCircle className="h-5 w-5 text-indigo-500" />,
  recusada: <X className="h-5 w-5 text-red-500" />,
  concluida: <CheckCircle className="h-5 w-5 text-emerald-500" />,
};

export default function SponsorDashboard() {
  const { usuario } = useAuth();
  const { solicitacoes, setSolicitacoes, equipes } = useStore();
  const [modalAberto, setModalAberto] = useState(false);
  const [pagamento, setPagamento] = useState<{ empresa: string; equipeId: string; semana: string; valor: number } | null>(null);
  const [form, setForm] = useState({ empresa: '', equipeId: '', semana: '', valor: 850 });
  const [feedbackEnviado, setFeedbackEnviado] = useState(false);

  const minhasSolicitacoes = solicitacoes.filter(s => s.patrocinadorEmail === usuario?.email);

  const resumo = {
    ativas: minhasSolicitacoes.filter(s => s.status === 'aprovada').length,
    emAnalise: minhasSolicitacoes.filter(s => s.status === 'aguardando_aprovacao').length,
    aprovadas: minhasSolicitacoes.filter(s => s.status === 'aprovada' || s.status === 'concluida').length,
    concluidas: minhasSolicitacoes.filter(s => s.status === 'concluida').length,
  };

  const irParaPagamento = () => {
    if (!form.empresa || !form.equipeId || !form.semana) return;
    setModalAberto(false);
    setPagamento({ ...form });
  };

  const confirmarPagamento = () => {
    if (!pagamento || !usuario) return;
    const eq = equipes.find(e => e.id === pagamento.equipeId);
    const nova: SolicitacaoPatrocinio = {
      id: `sp-${Date.now()}`,
      empresa: pagamento.empresa,
      equipeId: pagamento.equipeId,
      equipeNome: eq?.nome ?? '',
      semana: pagamento.semana,
      valor: pagamento.valor,
      status: 'aguardando_aprovacao',
      patrocinadorEmail: usuario.email,
      patrocinadorNome: usuario.nome,
      dataSolicitacao: new Date().toISOString().slice(0, 10),
    };
    setSolicitacoes([nova, ...solicitacoes]);
    setPagamento(null);
    setForm({ empresa: '', equipeId: '', semana: '', valor: 850 });
    setFeedbackEnviado(true);
    setTimeout(() => setFeedbackEnviado(false), 5000);
  };

  if (pagamento) {
    const eq = equipes.find(e => e.id === pagamento.equipeId);
    return (
      <PaymentScreen
        empresa={pagamento.empresa}
        equipeNome={eq?.nome ?? ''}
        semana={pagamento.semana}
        valor={pagamento.valor}
        onSucesso={confirmarPagamento}
        onCancelar={() => { setPagamento(null); setModalAberto(true); }}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FA]">
      <div className="relative bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-8">
        <div className="blob -top-20 right-0 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Área do Patrocinador</h1>
          <p className="text-sm text-slate-400 mt-1">Bem-vindo, <strong>{usuario?.nome}</strong></p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {feedbackEnviado && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Solicitação de patrocínio enviada! Aguardando aprovação.
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Em Análise', valor: resumo.emAnalise, cor: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Aprovadas', valor: resumo.aprovadas, cor: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Concluídas', valor: resumo.concluidas, cor: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total', valor: minhasSolicitacoes.length, cor: 'text-slate-700', bg: 'bg-slate-50' },
          ].map((c, i) => (
            <div key={i} className={`rounded-2xl p-5 ${c.bg} border border-white/60 text-center`}>
              <p className="text-xs font-semibold text-slate-400 mb-1">{c.label}</p>
              <p className={`text-3xl font-extrabold ${c.cor}`}>{c.valor}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-5 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </button>
        </div>

        {/* Minhas solicitações */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Minhas Solicitações</h2>
          {minhasSolicitacoes.length === 0 ? (
            <div className="text-center py-16 rounded-2xl glass-card text-slate-400">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma solicitação realizada ainda.</p>
              <p className="text-sm mt-1">Clique em "Nova Solicitação" para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {minhasSolicitacoes.map(s => (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl glass-card shadow-sm hover:shadow-md transition-all flex-wrap sm:flex-nowrap">
                  <div className="shrink-0">{iconStatus[s.status]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{s.empresa}</p>
                    <p className="text-sm text-slate-500">{s.equipeNome} · Semana de {formatarData(s.semana)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Solicitado em {formatarData(s.dataSolicitacao)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-slate-900">{formatarMoeda(s.valor)}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStatus[s.status]}`}>
                      {labelStatusPatrocinio(s.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo="Nova Solicitação de Patrocínio">
        <div className="space-y-4">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 font-medium flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            Após o envio, sua solicitação será analisada pelo gestor da equipe. O pagamento é simulado para fins de demonstração.
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Empresa / Nome</label>
            <input
              type="text"
              value={form.empresa}
              onChange={e => setForm({ ...form, empresa: e.target.value })}
              placeholder="Nome da sua empresa"
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Equipe / Mapa Alvo</label>
            <select
              value={form.equipeId}
              onChange={e => setForm({ ...form, equipeId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            >
              <option value="">Selecione uma equipe</option>
              {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Semana Desejada</label>
            <input
              type="date"
              value={form.semana}
              onChange={e => setForm({ ...form, semana: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Taxa de Patrocínio</label>
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-bold text-[#E63946]">
              {formatarMoeda(form.valor)}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
            <button
              onClick={irParaPagamento}
              disabled={!form.empresa || !form.equipeId || !form.semana}
              className="px-5 py-2 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839] disabled:opacity-40"
            >
              Ir para Pagamento
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
