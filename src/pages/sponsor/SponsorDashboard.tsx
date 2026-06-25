import { useState } from 'react';
import { Star, Plus, Package, CheckCircle, Clock, X, AlertCircle, QrCode, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { sponsorshipService } from '../../services/storeService';
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

function formatarCpfCnpj(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 14);
  if (n.length <= 11) return n.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_,a,b,c,d) => [a,b,c].filter(Boolean).join('.') + (d ? '-'+d : ''));
  return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_,a,b,c,d,e) => `${a}.${b}.${c}/${d}` + (e ? '-'+e : ''));
}

export default function SponsorDashboard() {
  const { usuario } = useAuth();
  const { solicitacoes, setSolicitacoes, equipes } = useStore();

  const [modalAberto, setModalAberto] = useState(false);
  const [pagamentoAtivo, setPagamentoAtivo] = useState<SolicitacaoPatrocinio | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    empresa: '',
    equipeId: '',
    semana: '',
    valor: 850,
    cpfCnpj: '',
    telefone: usuario?.telefone ?? '',
    billingType: 'PIX' as 'PIX' | 'BOLETO',
  });

  const minhasSolicitacoes = solicitacoes.filter(s => s.patrocinadorEmail === usuario?.email);

  const resumo = {
    emAnalise: minhasSolicitacoes.filter(s => s.status === 'aguardando_aprovacao').length,
    aprovadas: minhasSolicitacoes.filter(s => s.status === 'aprovada' || s.status === 'concluida').length,
    concluidas: minhasSolicitacoes.filter(s => s.status === 'concluida').length,
  };

  const formValido = form.empresa && form.equipeId && form.semana && form.cpfCnpj.replace(/\D/g, '').length >= 11;

  const criarPagamento = async () => {
    if (!formValido || !usuario) return;
    setEnviando(true);
    setErro('');
    try {
      const nova = await sponsorshipService.criar({
        empresa: form.empresa,
        equipeId: form.equipeId,
        semana: form.semana,
        valor: form.valor,
        email: usuario.email,
        nome: usuario.nome,
        cpfCnpj: form.cpfCnpj,
        telefone: form.telefone || undefined,
        billingType: form.billingType,
      });
      setSolicitacoes([nova, ...solicitacoes]);
      setModalAberto(false);
      setPagamentoAtivo(nova);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao processar pagamento.';
      setErro(msg);
    } finally {
      setEnviando(false);
    }
  };

  const onSucesso = (atualizada: SolicitacaoPatrocinio) => {
    setSolicitacoes(prev => prev.map(s => s.id === atualizada.id ? atualizada : s));
    setPagamentoAtivo(null);
    setForm({ empresa: '', equipeId: '', semana: '', valor: 850, cpfCnpj: '', telefone: usuario?.telefone ?? '', billingType: 'PIX' });
  };

  if (pagamentoAtivo) {
    return (
      <PaymentScreen
        solicitacao={pagamentoAtivo}
        onSucesso={onSucesso}
        onVoltar={() => { setPagamentoAtivo(null); setModalAberto(true); }}
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
            onClick={() => { setErro(''); setModalAberto(true); }}
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
                <div
                  key={s.id}
                  className="flex items-center gap-4 p-4 rounded-2xl glass-card shadow-sm hover:shadow-md transition-all flex-wrap sm:flex-nowrap cursor-pointer"
                  onClick={() => s.asaasPaymentId && s.status === 'aguardando_aprovacao' && setPagamentoAtivo(s)}
                >
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
                    {s.status === 'aguardando_aprovacao' && s.asaasPaymentId && (
                      <p className="text-[10px] text-[#E63946] font-semibold mt-1">Clique para ver pagamento</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo="Nova Solicitação de Patrocínio">
        <div className="space-y-4">
          {erro && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {erro}
            </div>
          )}

          {/* Dados do patrocínio */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Dados do Patrocínio</p>
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
          </div>

          <div className="border-t border-slate-100" />

          {/* Dados do pagador */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Dados para Cobrança</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  value={form.cpfCnpj}
                  onChange={e => setForm({ ...form, cpfCnpj: formatarCpfCnpj(e.target.value) })}
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Telefone</label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={e => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Tipo de pagamento */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Forma de Pagamento</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, billingType: 'PIX' })}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-bold text-sm transition ${form.billingType === 'PIX' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <QrCode className="h-6 w-6" />
                PIX
                <span className="text-[10px] font-normal text-slate-400">Aprovação imediata</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, billingType: 'BOLETO' })}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-bold text-sm transition ${form.billingType === 'BOLETO' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <FileText className="h-6 w-6" />
                Boleto
                <span className="text-[10px] font-normal text-slate-400">Até 3 dias úteis</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
              Cancelar
            </button>
            <button
              onClick={criarPagamento}
              disabled={!formValido || enviando}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839] disabled:opacity-40 transition"
            >
              {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
              {enviando ? 'Gerando cobrança...' : 'Gerar Pagamento'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
