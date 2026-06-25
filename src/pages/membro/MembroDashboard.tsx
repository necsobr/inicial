import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, ListOrdered, ChevronLeft, ChevronRight,
  Clock, MapPin, Users, DollarSign, CheckCircle, Timer,
  AlertCircle, Plus, X, Crown, ArrowLeft,
  QrCode, FileText, Copy, RefreshCw, Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { filaService } from '../../services/storeService';
import { formatarMoeda, formatarData, labelDiaSemana } from '../../utils/format';
import Modal from '../../components/Modal';
import type { EntradaFila } from '../../types';

function formatarCpfCnpj(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 14);
  if (n.length <= 11) return n.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_,a,b,c,d) => [a,b,c].filter(Boolean).join('.') + (d ? '-'+d : ''));
  return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_,a,b,c,d,e) => `${a}.${b}.${c}/${d}` + (e ? '-'+e : ''));
}

type Aba = 'calendario' | 'filas';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const COR_OS = [
  { bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { bg: 'bg-violet-500', light: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
];

const STATUS_FILA: Record<string, { label: string; cor: string }> = {
  aguardando: { label: 'Aguardando', cor: 'bg-amber-100 text-amber-700' },
  confirmado: { label: 'Confirmado', cor: 'bg-indigo-100 text-indigo-700' },
  pago: { label: 'Pago', cor: 'bg-emerald-100 text-emerald-700' },
  recusado: { label: 'Recusado', cor: 'bg-red-100 text-red-700' },
  expirado: { label: 'Expirado', cor: 'bg-slate-100 text-slate-500' },
};

function diasRestantes(dataExpiracao: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const exp = new Date(`${dataExpiracao}T00:00:00`);
  return Math.max(0, Math.ceil((exp.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function MembroDashboard() {
  const { usuario } = useAuth();
  const { equipes, eventos, ordensServico, filasOS, entrarNaFila: entrarNaFilaStore, atualizarEntradaFila, recusarFila } = useStore();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<Aba>('calendario');
  const [mesAtual, setMesAtual] = useState(() => {
    const d = new Date();
    return { ano: d.getFullYear(), mes: d.getMonth() };
  });
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [modalPagamento, setModalPagamento] = useState<EntradaFila | null>(null);
  const [osExpandida, setOsExpandida] = useState<string | null>(null);

  // Estado do fluxo de pagamento
  const [etapaPagamento, setEtapaPagamento] = useState<'form' | 'cobranca'>('form');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [billingType, setBillingType] = useState<'PIX' | 'BOLETO'>('PIX');
  const [gerandoCobranca, setGerandoCobranca] = useState(false);
  const [erroPagamento, setErroPagamento] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [verificandoStatus, setVerificandoStatus] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const equipeAtual = equipes.find(e => e.id === usuario?.equipeId);
  const ordensEquipe = ordensServico.filter(os => os.equipeId === usuario?.equipeId && os.status === 'ativa');
  const eventosEquipe = eventos.filter(ev => ev.equipeId === usuario?.equipeId);

  const minhaEntradaNaFila = (osId: string) => filasOS.find(f => f.usuarioId === usuario?.id && f.ordemServicoId === osId);

  const entrarNaFila = (osId: string) => void entrarNaFilaStore(osId);
  const recusarVaga = (entradaId: string) => void recusarFila(entradaId);

  const abrirModalPagamento = (entrada: EntradaFila) => {
    setModalPagamento(entrada);
    setEtapaPagamento(entrada.asaasPaymentId ? 'cobranca' : 'form');
    setCpfCnpj('');
    setBillingType('PIX');
    setErroPagamento('');
  };

  const fecharModal = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = null;
    setModalPagamento(null);
    setEtapaPagamento('form');
  };

  const gerarCobranca = async () => {
    if (!modalPagamento || cpfCnpj.replace(/\D/g, '').length < 11) return;
    setGerandoCobranca(true);
    setErroPagamento('');
    try {
      const atualizada = await filaService.iniciarPagamento(modalPagamento.id, {
        cpfCnpj,
        billingType,
        phone: usuario?.telefone,
      });
      atualizarEntradaFila(atualizada);
      setModalPagamento(atualizada);
      setEtapaPagamento('cobranca');
    } catch (e) {
      setErroPagamento(e instanceof Error ? e.message : 'Erro ao gerar cobrança.');
    } finally {
      setGerandoCobranca(false);
    }
  };

  const verificarStatus = async () => {
    if (!modalPagamento) return;
    setVerificandoStatus(true);
    try {
      const res = await filaService.verificarPagamento(modalPagamento.id);
      if (res.status === 'pago') {
        const atualizada = { ...modalPagamento, status: 'pago' as EntradaFila['status'], asaasPaymentStatus: res.asaasStatus };
        atualizarEntradaFila(atualizada);
        fecharModal();
      }
    } catch {} finally {
      setVerificandoStatus(false);
    }
  };

  useEffect(() => {
    if (etapaPagamento === 'cobranca' && modalPagamento?.asaasPaymentId && modalPagamento.status !== 'pago') {
      pollingRef.current = setInterval(() => { void verificarStatus(); }, 5000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [etapaPagamento, modalPagamento?.id]);

  // Calendário
  const { ano, mes } = mesAtual;
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const eventosPorDia = (dia: number) => {
    const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return eventosEquipe.filter(ev => ev.data === dataStr);
  };

  const corParaOS = (osId: string | undefined) => {
    if (!osId) return COR_OS[3];
    const idx = ordensEquipe.findIndex(os => os.id === osId);
    return COR_OS[idx % COR_OS.length] ?? COR_OS[0];
  };

  const eventosDodiaSelecionado = diaSelecionado ? eventosEquipe.filter(ev => ev.data === diaSelecionado) : [];
  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  if (!equipeAtual) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-bold text-slate-700">Nenhuma equipe associada</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">Entre em contato com o coordenador da sua equipe.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8F9FA]">
      {/* Header */}
      <div className="relative bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="blob -top-20 right-0 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          {(usuario?.papel === 'trio' || usuario?.papel === 'coordenador') && (
            <button
              onClick={() => navigate(usuario.papel === 'trio' ? '/trio' : '/coordenador')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#E63946] mb-3 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao painel {usuario.papel === 'trio' ? 'do trio' : 'do coordenador'}
            </button>
          )}
          <p className="text-xs font-bold text-[#E63946] uppercase tracking-wider mb-1">{equipeAtual.regional}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{equipeAtual.nome}</h1>
          <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {equipeAtual.cidade}
            <span className="ml-2 text-slate-200">·</span>
            <span className="text-slate-500 font-medium">{usuario?.nome}</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {[
              { id: 'calendario' as Aba, label: 'Calendário', icone: Calendar },
              { id: 'filas' as Aba, label: 'Filas de Patrocínio', icone: ListOrdered },
            ].map(a => {
              const Icone = a.icone;
              return (
                <button key={a.id} onClick={() => setAbaAtiva(a.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${abaAtiva === a.id ? 'bg-[#E63946] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Icone className="h-4 w-4" />
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* CALENDÁRIO */}
        {abaAtiva === 'calendario' && (
          <div className="space-y-6">
            {/* Legenda de O.S. */}
            {ordensEquipe.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {ordensEquipe.map((os, idx) => {
                  const cor = COR_OS[idx % COR_OS.length];
                  return (
                    <div key={os.id} className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${cor.light}`}>
                      <span className={`h-2 w-2 rounded-full ${cor.dot}`} />
                      {os.tipoPapel} {os.recorrencia === 'semanal' ? `(toda ${labelDiaSemana(os.diaSemana)?.toLowerCase()})` : '(única)'}
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Outros eventos
                </div>
              </div>
            )}

            {/* Calendário */}
            <div className="rounded-3xl glass-card shadow-xl overflow-hidden">
              {/* Navegação */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <button onClick={() => setMesAtual(prev => prev.mes === 0 ? { ano: prev.ano - 1, mes: 11 } : { ano: prev.ano, mes: prev.mes - 1 })} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-600">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-extrabold text-slate-900">{MESES[mes]} {ano}</h3>
                <button onClick={() => setMesAtual(prev => prev.mes === 11 ? { ano: prev.ano + 1, mes: 0 } : { ano: prev.ano, mes: prev.mes + 1 })} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-600">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Grid dias semana */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {DIAS_SEMANA.map(d => (
                  <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
                ))}
              </div>

              {/* Grid dias */}
              <div className="grid grid-cols-7">
                {Array.from({ length: primeiroDia }).map((_, i) => <div key={`v-${i}`} className="p-2 min-h-[64px] border-b border-r border-slate-50/50" />)}
                {Array.from({ length: diasNoMes }).map((_, i) => {
                  const dia = i + 1;
                  const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                  const evsDia = eventosPorDia(dia);
                  const isHoje = dataStr === hojeStr;
                  const isSelecionado = dataStr === diaSelecionado;
                  return (
                    <div
                      key={dia}
                      onClick={() => setDiaSelecionado(isSelecionado ? null : evsDia.length > 0 ? dataStr : null)}
                      className={`p-2 min-h-[64px] border-b border-r border-slate-50/50 transition-all ${evsDia.length > 0 ? 'cursor-pointer hover:bg-slate-50' : ''} ${isSelecionado ? 'bg-[#E63946]/5' : ''}`}
                    >
                      <div className={`text-sm font-bold mb-1 h-7 w-7 flex items-center justify-center rounded-full ${isHoje ? 'bg-[#E63946] text-white' : 'text-slate-700'}`}>{dia}</div>
                      <div className="flex flex-col gap-0.5">
                        {evsDia.slice(0, 3).map(ev => {
                          const cor = corParaOS(ev.ordemServicoId);
                          return <span key={ev.id} className={`h-1.5 w-full rounded-full ${cor.dot}`} />;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Eventos do dia selecionado */}
            {diaSelecionado && eventosDodiaSelecionado.length > 0 && (
              <div className="rounded-2xl p-5 glass-card shadow-md">
                <h3 className="font-bold text-slate-900 mb-3">{formatarData(diaSelecionado)}</h3>
                <div className="space-y-3">
                  {eventosDodiaSelecionado.map(ev => {
                    const cor = corParaOS(ev.ordemServicoId);
                    return (
                      <div key={ev.id} className={`flex items-start gap-3 p-3 rounded-xl border ${cor.light}`}>
                        <div className={`h-2 w-2 rounded-full ${cor.dot} mt-1.5 shrink-0`} />
                        <div>
                          <p className="font-bold text-sm">{ev.titulo}</p>
                          <div className="flex gap-3 mt-0.5 flex-wrap">
                            {ev.hora && <span className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" />{ev.hora}</span>}
                            {ev.local && <span className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.local}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Próximas reuniões */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Próximas Reuniões</h3>
              {eventosEquipe.filter(ev => ev.data >= hojeStr).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 5).map(ev => {
                const cor = corParaOS(ev.ordemServicoId);
                return (
                  <div key={ev.id} className={`flex items-center gap-4 p-4 rounded-2xl glass-card shadow-sm mb-3 border-l-4 ${ev.ordemServicoId ? 'border-blue-400' : 'border-amber-400'}`}>
                    <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-center min-w-[52px]">
                      <span className="text-[10px] font-bold uppercase text-slate-500">{MESES[parseInt(ev.data.split('-')[1]) - 1].slice(0, 3).toUpperCase()}</span>
                      <span className="text-xl font-extrabold text-slate-800 leading-tight">{ev.data.split('-')[2]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{ev.titulo}</p>
                      <div className="flex gap-3 mt-0.5 flex-wrap">
                        {ev.hora && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" />{ev.hora}</span>}
                        {ev.local && <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.local}</span>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cor.light}`}>{ordensEquipe.find(o => o.id === ev.ordemServicoId)?.tipoPapel?.slice(0, 12) ?? 'Evento'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FILAS */}
        {abaAtiva === 'filas' && (
          <div className="space-y-8">
            <p className="text-sm text-slate-500">Entre em uma fila de patrocínio para aparecer no mapa de referência da reunião.</p>

            {ordensEquipe.length === 0 ? (
              <div className="text-center py-16 rounded-2xl glass-card text-slate-400">
                <ListOrdered className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma O.S. ativa no momento.</p>
              </div>
            ) : (
              ordensEquipe.map((os, idx) => {
                const cor = COR_OS[idx % COR_OS.length];
                const filaOS = filasOS.filter(f => f.ordemServicoId === os.id).sort((a, b) => a.posicao - b.posicao);
                const minhaEntrada = minhaEntradaNaFila(os.id);
                const posNaFila = minhaEntrada?.posicao ?? null;
                const dentroDoLimite = posNaFila !== null && posNaFila <= os.numeroVagasPatrocinador;
                const comTimer = minhaEntrada?.status === 'aguardando' && dentroDoLimite && minhaEntrada.dataExpiracao;
                const expandida = osExpandida === os.id;

                return (
                  <div key={os.id} className={`rounded-3xl glass-card shadow-xl overflow-hidden border-t-4 ${cor.bg}`}>
                    <div className="p-6">
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-extrabold text-slate-900">{os.tipoPapel}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {os.recorrencia === 'semanal'
                              ? `${os.numeroReunioes} reuniões às ${labelDiaSemana(os.diaSemana)?.toLowerCase()}`
                              : `Reunião única: ${formatarData(os.dataUnica ?? '')}`}
                            {' · '}{os.numeroVagasPatrocinador} vagas
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Cota</p>
                          <p className="text-2xl font-extrabold text-[#E63946]">{formatarMoeda(os.precoCota)}</p>
                        </div>
                      </div>

                      {/* Status do usuário */}
                      {!minhaEntrada ? (
                        <button
                          onClick={() => entrarNaFila(os.id)}
                          className="mt-4 flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-4 py-2 rounded-xl shadow transition"
                        >
                          <Plus className="h-4 w-4" />
                          Entrar na Fila
                        </button>
                      ) : minhaEntrada.status === 'recusado' || minhaEntrada.status === 'expirado' ? (
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 italic">
                          <X className="h-4 w-4" />
                          Você recusou ou expirou — será movido para a próxima O.S. com prioridade
                        </div>
                      ) : minhaEntrada.status === 'pago' ? (
                        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-600">
                          <CheckCircle className="h-5 w-5" />
                          Patrocinador confirmado! Você aparecerá no mapa.
                        </div>
                      ) : comTimer ? (
                        <div className="mt-4 rounded-2xl bg-[#E63946]/5 border border-[#E63946]/20 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Timer className="h-5 w-5 text-[#E63946]" />
                            <span className="font-bold text-slate-900">Sua vaga está disponível!</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">Você tem <strong>{diasRestantes(minhaEntrada.dataExpiracao!)} dia(s)</strong> para confirmar (expira em {formatarData(minhaEntrada.dataExpiracao!)}).</p>
                          <p className="text-lg font-extrabold text-[#E63946] mb-4">{formatarMoeda(os.precoCota)}</p>
                          <div className="flex gap-3">
                            <button onClick={() => abrirModalPagamento(minhaEntrada)} className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-4 py-2 rounded-xl shadow transition">
                              <DollarSign className="h-4 w-4" />
                              Pagar e Confirmar
                            </button>
                            <button onClick={() => recusarVaga(minhaEntrada.id)} className="flex items-center gap-2 text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition">
                              <X className="h-4 w-4" />
                              Recusar Vaga
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                          <Users className="h-4 w-4" />
                          Você está na posição <strong>{posNaFila}</strong> da fila — aguardando confirmação
                        </div>
                      )}

                      {/* Toggle fila completa */}
                      <button
                        onClick={() => setOsExpandida(expandida ? null : os.id)}
                        className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition"
                      >
                        <Users className="h-3.5 w-3.5" />
                        {expandida ? 'Ocultar fila' : `Ver fila (${filaOS.length} na fila)`}
                      </button>
                    </div>

                    {/* Fila expandida */}
                    {expandida && (
                      <div className="border-t border-slate-100 divide-y divide-slate-50">
                        {filaOS.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">Fila vazia.</p>
                        ) : filaOS.map((entrada) => {
                          const isMeu = entrada.usuarioId === usuario?.id;
                          const confirmado = entrada.status === 'confirmado' || entrada.status === 'pago';
                          return (
                            <div key={entrada.id} className={`flex items-center gap-4 px-6 py-3 ${isMeu ? 'bg-[#E63946]/5' : ''}`}>
                              <span className={`text-sm font-extrabold w-8 text-center shrink-0 ${confirmado ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {entrada.posicao <= os.numeroVagasPatrocinador ? <Crown className="h-4 w-4 text-amber-400 mx-auto" /> : `#${entrada.posicao}`}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${isMeu ? 'text-[#E63946]' : 'text-slate-800'}`}>
                                  {isMeu ? `${entrada.usuarioNome} (você)` : entrada.usuarioNome}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{entrada.empresa}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_FILA[entrada.status]?.cor ?? 'bg-slate-100 text-slate-500'}`}>
                                {STATUS_FILA[entrada.status]?.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal pagamento real via Asaas */}
      <Modal aberto={!!modalPagamento} onFechar={fecharModal} titulo="Confirmar Patrocínio">
        {modalPagamento && (() => {
          const os = ordensEquipe.find(o => o.id === modalPagamento.ordemServicoId);
          const isPix = modalPagamento.billingType === 'PIX';

          if (etapaPagamento === 'form') {
            return (
              <div className="space-y-5">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">O.S.:</span><strong>{os?.tipoPapel}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Valor:</span><strong className="text-[#E63946]">{formatarMoeda(os?.precoCota ?? 0)}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Empresa:</span><strong>{modalPagamento.empresa}</strong></div>
                </div>

                {erroPagamento && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{erroPagamento}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={cpfCnpj}
                    onChange={e => setCpfCnpj(formatarCpfCnpj(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Forma de Pagamento</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['PIX', 'BOLETO'] as const).map(tipo => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setBillingType(tipo)}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-bold text-sm transition ${billingType === tipo ? (tipo === 'PIX' ? 'border-green-500 bg-green-50 text-green-700' : 'border-violet-500 bg-violet-50 text-violet-700') : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        {tipo === 'PIX' ? <QrCode className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        {tipo}
                        <span className="text-[10px] font-normal text-slate-400">{tipo === 'PIX' ? 'Aprovação imediata' : 'Até 3 dias úteis'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={fecharModal} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
                  <button
                    onClick={() => void gerarCobranca()}
                    disabled={gerandoCobranca || cpfCnpj.replace(/\D/g, '').length < 11}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839] disabled:opacity-40 transition"
                  >
                    {gerandoCobranca && <Loader2 className="h-4 w-4 animate-spin" />}
                    {gerandoCobranca ? 'Gerando...' : 'Gerar Cobrança'}
                  </button>
                </div>
              </div>
            );
          }

          // Etapa: cobrança gerada
          return (
            <div className="space-y-5">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Aguardando pagamento</p>
                  <p className="text-xs text-slate-400 mt-0.5">Verificando automaticamente a cada 5 segundos.</p>
                </div>
                <button onClick={() => void verificarStatus()} disabled={verificandoStatus} className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition">
                  <RefreshCw className={`h-4 w-4 ${verificandoStatus ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {isPix && modalPagamento.asaasPixQrcode && (
                <div className="flex justify-center">
                  <div className="rounded-2xl border-2 border-green-200 p-3 bg-white inline-block shadow-sm">
                    <img src={`data:image/png;base64,${modalPagamento.asaasPixQrcode}`} alt="QR Code PIX" className="w-44 h-44 rounded-lg" />
                  </div>
                </div>
              )}

              {isPix && modalPagamento.asaasPixCopyPaste && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PIX Copia e Cola</label>
                  <div className="flex gap-2">
                    <input readOnly value={modalPagamento.asaasPixCopyPaste} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-mono text-slate-700 truncate outline-none" />
                    <button
                      onClick={() => { navigator.clipboard.writeText(modalPagamento.asaasPixCopyPaste!).catch(()=>{}); setCopiado(true); setTimeout(()=>setCopiado(false),3000); }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${copiado ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {copiado ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiado ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}

              {!isPix && (
                <div className="space-y-3">
                  {modalPagamento.asaasBankSlipUrl && (
                    <a href={modalPagamento.asaasBankSlipUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition text-sm">
                      <FileText className="h-4 w-4" />Abrir Boleto
                    </a>
                  )}
                  {modalPagamento.asaasInvoiceUrl && (
                    <a href={modalPagamento.asaasInvoiceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 border border-violet-200 text-violet-700 font-bold rounded-xl transition text-sm hover:bg-violet-50">
                      <FileText className="h-4 w-4" />Ver fatura
                    </a>
                  )}
                </div>
              )}

              <button onClick={fecharModal} className="w-full py-2 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50">Fechar (verificarei depois)</button>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
