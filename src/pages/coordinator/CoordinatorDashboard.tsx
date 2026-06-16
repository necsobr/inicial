import { useState } from 'react';
import {
  Users, BarChart3, Calendar, Printer, DollarSign, Star,
  TrendingUp, ChevronRight, MapPin, Clock,
  UserCheck, Package, AlertCircle, CheckCircle, Bell, Check, Trash2,
  UserPlus, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { formatarMoeda, formatarData, labelStatusPatrocinio } from '../../utils/format';
import Modal from '../../components/Modal';
import type { RequisicaoImpressao, TipoNotificacao } from '../../types';

type Aba = 'visao_geral' | 'membros' | 'eventos' | 'patrocinadores' | 'imprimir' | 'alertas';

const ABAS_BASE = [
  { id: 'visao_geral' as Aba, label: 'Visão Geral', icone: BarChart3 },
  { id: 'membros' as Aba, label: 'Membros', icone: Users },
  { id: 'eventos' as Aba, label: 'Eventos', icone: Calendar },
  { id: 'patrocinadores' as Aba, label: 'Patrocinadores', icone: DollarSign },
  { id: 'imprimir' as Aba, label: 'Solicitar Impressão', icone: Printer },
];

const tipoEventoLabel: Record<string, string> = {
  reuniao: 'Reunião', social: 'Social', aniversario: 'Aniversário', outro: 'Outro'
};
const tipoEventoCor: Record<string, string> = {
  reuniao: 'bg-blue-100 text-blue-700',
  social: 'bg-indigo-100 text-indigo-700',
  aniversario: 'bg-amber-100 text-amber-700',
  outro: 'bg-slate-100 text-slate-600',
};

const badgeStatus: Record<string, string> = {
  aguardando_aprovacao: 'bg-amber-100 text-amber-700',
  aprovada: 'bg-indigo-100 text-indigo-700',
  recusada: 'bg-red-100 text-red-700',
  concluida: 'bg-emerald-100 text-emerald-700',
};

export default function CoordinatorDashboard() {
  const { usuario } = useAuth();
  const { equipes, membros, eventos, palestrantes, solicitacoes, requisicoes, setRequisicoes, notificacoes, setNotificacoes } = useStore();
  const [abaAtiva, setAbaAtiva] = useState<Aba>('visao_geral');
  const [filtroAlertas, setFiltroAlertas] = useState<'todos' | 'nao_lidas' | TipoNotificacao>('todos');
  const [equipeAtualId, setEquipeAtualId] = useState(usuario?.equipeId ?? '');
  const [modalImpressao, setModalImpressao] = useState(false);
  const [formImpressao, setFormImpressao] = useState({ quantidade: 350, dataEvento: '', observacoes: '' });
  const [feedbackEnviado, setFeedbackEnviado] = useState(false);

  const minhasEquipes = equipes.filter(eq => eq.gestoresIds.includes(usuario?.id ?? ''));
  if (equipeAtualId === '' && minhasEquipes.length > 0) setEquipeAtualId(minhasEquipes[0].id);

  const equipeAtual = equipes.find(e => e.id === equipeAtualId);
  const membrosEquipe = membros.filter(m => m.equipeId === equipeAtualId);
  const eventosEquipe = eventos.filter(ev => ev.equipeId === equipeAtualId).sort((a, b) => a.data.localeCompare(b.data));
  const palestrantesEquipe = palestrantes.filter(p => p.equipeId === equipeAtualId).sort((a, b) => a.data.localeCompare(b.data));
  const solicitacoesEquipe = solicitacoes.filter(s => s.equipeId === equipeAtualId);

  const abas = [...ABAS_BASE, { id: 'alertas' as Aba, label: 'Alertas', icone: Bell }];

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  const alertasFiltrados = notificacoes.filter(n => {
    if (filtroAlertas === 'nao_lidas') return !n.lida;
    if (filtroAlertas === 'todos') return true;
    return n.tipo === filtroAlertas;
  });

  const marcarTodasLidas = () => setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
  const marcarLida = (id: string) => setNotificacoes(notificacoes.map(n => n.id === id ? { ...n, lida: true } : n));
  const removerNotificacao = (id: string) => setNotificacoes(notificacoes.filter(n => n.id !== id));

  const iconeNotificacao = (tipo: TipoNotificacao) => {
    if (tipo === 'membro') return <UserPlus className="h-5 w-5 text-indigo-500" />;
    if (tipo === 'patrocinador') return <Award className="h-5 w-5 text-[#E63946]" />;
    if (tipo === 'entrega') return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    return <AlertCircle className="h-5 w-5 text-amber-500" />;
  };

  const bordaNotificacao = (tipo: TipoNotificacao, lida: boolean) => {
    if (lida) return 'glass-card border-l-4 border-slate-300 opacity-60 rounded-r-3xl rounded-l-md';
    const cores: Record<TipoNotificacao, string> = {
      membro: 'glass-card border-l-4 border-indigo-500 rounded-r-3xl rounded-l-md',
      patrocinador: 'glass-card border-l-4 border-[#E63946] rounded-r-3xl rounded-l-md',
      entrega: 'glass-card border-l-4 border-emerald-500 rounded-r-3xl rounded-l-md',
      sistema: 'glass-card border-l-4 border-amber-400 rounded-r-3xl rounded-l-md',
    };
    return cores[tipo];
  };

  const enviarImpressao = () => {
    if (!formImpressao.dataEvento || !equipeAtual || !usuario) return;
    const nova: RequisicaoImpressao = {
      id: `req-${Date.now()}`,
      equipeId: equipeAtualId,
      equipeNome: equipeAtual.nome,
      solicitanteEmail: usuario.email,
      solicitanteNome: usuario.nome,
      quantidade: formImpressao.quantidade,
      dataEvento: formImpressao.dataEvento,
      observacoes: formImpressao.observacoes,
      status: 'recebido',
      dataCriacao: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setRequisicoes([nova, ...requisicoes]);
    setModalImpressao(false);
    setFormImpressao({ quantidade: 350, dataEvento: '', observacoes: '' });
    setFeedbackEnviado(true);
    setTimeout(() => setFeedbackEnviado(false), 5000);
  };

  if (!equipeAtual) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-bold text-slate-700">Nenhuma equipe associada</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">Entre em contato com o administrador para ser associado a uma equipe.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FA]">
      <div className="relative bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="blob -top-20 right-0 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          {/* Seletor de equipe */}
          {minhasEquipes.length > 1 && (
            <div className="mb-4 flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Equipe:</label>
              <select
                value={equipeAtualId}
                onChange={e => setEquipeAtualId(e.target.value)}
                className="text-sm font-bold text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#E63946] bg-white"
              >
                {minhasEquipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider px-2.5 py-0.5 bg-[#E63946]/10 rounded-full">
                  {equipeAtual.regional}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{equipeAtual.nome}</h1>
              <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {equipeAtual.cidade}
              </div>
            </div>
            <button
              onClick={() => setModalImpressao(true)}
              className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-5 py-2.5 rounded-xl shadow-lg transition"
            >
              <Printer className="h-4 w-4" />
              Solicitar Impressão
            </button>
          </div>

          {feedbackEnviado && (
            <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Requisição de impressão enviada com sucesso!
            </div>
          )}
        </div>
      </div>

      {/* Abas */}
      <div className="sticky top-16 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {abas.map((a) => {
              const Icone = a.icone;
              return (
                <button
                  key={a.id}
                  onClick={() => setAbaAtiva(a.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    abaAtiva === a.id ? 'bg-[#E63946] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icone className="h-4 w-4" />
                  {a.label}
                  {a.id === 'alertas' && naoLidas > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#E63946] text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                      {naoLidas}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Visão Geral */}
        {abaAtiva === 'visao_geral' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Membros', valor: equipeAtual.stats.totalMembros, cor: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Ref. Internas', valor: equipeAtual.stats.referenciasInternas, cor: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Ref. Externas', valor: equipeAtual.stats.referenciasExternas, cor: 'text-violet-600', bg: 'bg-violet-50' },
                { label: 'Reuniões 1-a-1', valor: equipeAtual.stats.reunioes1a1, cor: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Convidados', valor: equipeAtual.stats.convidados, cor: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Educação', valor: equipeAtual.stats.educacao, cor: 'text-slate-600', bg: 'bg-slate-50' },
              ].map((c, i) => (
                <div key={i} className={`rounded-2xl p-4 ${c.bg} border border-white/60 text-center`}>
                  <p className="text-xs font-semibold text-slate-500 mb-1">{c.label}</p>
                  <p className={`text-2xl font-extrabold ${c.cor}`}>{c.valor.toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl p-6 glass-card shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-[#E63946]" />
                <h3 className="font-bold text-slate-900">Negócios Gerados</h3>
              </div>
              <p className="text-4xl font-extrabold text-[#E63946] mt-2">
                {formatarMoeda(equipeAtual.stats.negociosGeradosReais)}
              </p>
              <p className="text-sm text-slate-400 mt-1">Total consolidado da equipe</p>
            </div>

            {/* Último mês */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Último Mês</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Membros Ativos', valor: equipeAtual.statsUltimoMes.membrosAtivos },
                  { label: 'Ref. Internas', valor: equipeAtual.statsUltimoMes.referenciasInternas },
                  { label: 'Ref. Externas', valor: equipeAtual.statsUltimoMes.referenciasExternas },
                  { label: 'Reuniões 1-a-1', valor: equipeAtual.statsUltimoMes.reunioes1a1 },
                  { label: 'Convidados', valor: equipeAtual.statsUltimoMes.convidados },
                  { label: 'Negócios', valor: formatarMoeda(equipeAtual.statsUltimoMes.negociosGeradosReais) },
                ].map((c, i) => (
                  <div key={i} className="rounded-2xl p-4 glass-card text-center">
                    <p className="text-xs font-semibold text-slate-400 mb-1">{c.label}</p>
                    <p className="text-xl font-extrabold text-slate-800">{typeof c.valor === 'number' ? c.valor.toLocaleString('pt-BR') : c.valor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Especialidades em aberto */}
            {equipeAtual.especialidadesAberto.length > 0 && (
              <div className="rounded-3xl p-6 glass-card shadow-xl">
                <h3 className="font-bold text-slate-900 mb-4">Especialidades em Aberto</h3>
                <div className="flex flex-wrap gap-2">
                  {equipeAtual.especialidadesAberto.map((esp, i) => (
                    <span key={i} className="text-sm bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Patrocinadores ativos */}
            {equipeAtual.patrocinadores.length > 0 && (
              <div className="rounded-3xl p-6 glass-card shadow-xl">
                <h3 className="font-bold text-slate-900 mb-4">Patrocinadores Ativos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {equipeAtual.patrocinadores.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-white/40">
                      <Star className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-slate-700 text-sm">{p.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Membros */}
        {abaAtiva === 'membros' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{membrosEquipe.length} membros cadastrados</p>
            {membrosEquipe.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum membro cadastrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {membrosEquipe.map(m => (
                  <div key={m.id} className="rounded-2xl p-5 glass-card shadow-md hover:shadow-lg transition-all hover:scale-[1.01]">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-11 w-11 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center font-extrabold text-lg shrink-0">
                        {m.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{m.nome}</h4>
                        <p className="text-xs text-slate-500 truncate">{m.empresa}</p>
                        <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{m.nivel}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-3 space-y-1">
                      <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Especialidade:</span> {m.especialidade}</p>
                      <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Contato:</span> {m.contato}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Pedido de Referência</p>
                      <p className="text-xs text-slate-600 italic">"{m.nome} pode te ajudar com {m.especialidade.toLowerCase()}."</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Eventos */}
        {abaAtiva === 'eventos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Próximos Eventos</h3>
              {eventosEquipe.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum evento agendado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventosEquipe.map(ev => (
                    <div key={ev.id} className="flex gap-4 p-4 rounded-2xl glass-card shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col items-center justify-center bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 px-3 py-2 rounded-xl text-center min-w-[60px]">
                        <span className="text-[10px] font-bold uppercase">{ev.data.split('-')[1] === '06' ? 'JUN' : ev.data.split('-')[1] === '07' ? 'JUL' : ev.data.split('-')[1]}</span>
                        <span className="text-2xl font-extrabold leading-tight">{ev.data.split('-')[2]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{ev.titulo}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${tipoEventoCor[ev.tipo]}`}>
                            {tipoEventoLabel[ev.tipo]}
                          </span>
                        </div>
                        {ev.hora && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <Clock className="h-3 w-3" />
                            {ev.hora}
                          </div>
                        )}
                        {ev.local && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {ev.local}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Agenda de Palestrantes</h3>
              {palestrantesEquipe.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum palestrante agendado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {palestrantesEquipe.map(p => (
                    <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl glass-card shadow-sm">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {p.nome.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm">{p.nome}</p>
                        <p className="text-xs text-slate-400">{formatarData(p.data)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patrocinadores */}
        {abaAtiva === 'patrocinadores' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {equipeAtual.patrocinadores.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-4 rounded-2xl glass-card shadow-md">
                  <Star className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-800">{p.nome}</span>
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Ativo</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Solicitações de Patrocínio</h3>
              {solicitacoesEquipe.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma solicitação para esta equipe.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl glass-card shadow-xl">
                  <table className="min-w-full divide-y divide-slate-200/40">
                    <thead className="bg-[#E63946]/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Empresa</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Período</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Valor</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/20">
                      {solicitacoesEquipe.map(s => (
                        <tr key={s.id} className="hover:bg-white/10 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{s.empresa}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{formatarData(s.semana)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">{formatarMoeda(s.valor)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStatus[s.status]}`}>
                              {labelStatusPatrocinio(s.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Solicitar Impressão */}
        {abaAtiva === 'imprimir' && (
          <div className="max-w-xl mx-auto">
            <div className="rounded-3xl p-8 glass-card shadow-xl space-y-6">
              <div className="text-center">
                <Printer className="h-12 w-12 text-[#E63946] mx-auto mb-3" />
                <h3 className="text-xl font-extrabold text-slate-900">Solicitar Impressão de Mapa</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Preencha o formulário para enviar uma requisição para a fila de produção.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Equipe</label>
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 font-medium">
                    {equipeAtual.nome}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Quantidade de Cópias</label>
                  <input
                    type="number"
                    min={50}
                    max={1000}
                    value={formImpressao.quantidade}
                    onChange={e => setFormImpressao({ ...formImpressao, quantidade: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Data do Evento</label>
                  <input
                    type="date"
                    value={formImpressao.dataEvento}
                    onChange={e => setFormImpressao({ ...formImpressao, dataEvento: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Observações</label>
                  <textarea
                    rows={3}
                    value={formImpressao.observacoes}
                    onChange={e => setFormImpressao({ ...formImpressao, observacoes: e.target.value })}
                    placeholder="Instruções especiais, tipo de papel, etc."
                    className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946] resize-none"
                  />
                </div>
                <button
                  onClick={enviarImpressao}
                  disabled={!formImpressao.dataEvento}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] py-3.5 rounded-xl shadow-lg transition disabled:opacity-40"
                >
                  <Printer className="h-4 w-4" />
                  Enviar Requisição
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Alertas — somente trio */}
        {abaAtiva === 'alertas' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Painel de Alertas</h2>
                <p className="text-xs text-slate-500 mt-0.5">Acompanhe notificações de membros, patrocinadores e logística.</p>
              </div>
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-4 py-2.5 rounded-xl shadow transition-all"
                >
                  <Check className="h-4 w-4" />
                  Marcar Todas como Lidas ({naoLidas})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 p-2 rounded-2xl glass-card">
              {([
                { id: 'todos', label: 'Todos' },
                { id: 'nao_lidas', label: `Não Lidas (${naoLidas})` },
                { id: 'membro', label: 'Membros' },
                { id: 'patrocinador', label: 'Patrocinadores' },
                { id: 'entrega', label: 'Logística' },
              ] as { id: typeof filtroAlertas; label: string }[]).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFiltroAlertas(f.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    filtroAlertas === f.id
                      ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {alertasFiltrados.length === 0 ? (
                <div className="rounded-2xl border border-white/30 bg-white/20 p-12 text-center text-slate-400 italic">
                  Nenhum alerta nesta lista no momento.
                </div>
              ) : (
                alertasFiltrados.map(n => (
                  <div key={n.id} className={`relative p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4 ${bordaNotificacao(n.tipo, n.lida)}`}>
                    <div className="flex-shrink-0 p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                      {iconeNotificacao(n.tipo)}
                    </div>
                    <div className="flex-grow space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.tipo}</span>
                        {!n.lida && <span className="h-1.5 w-1.5 rounded-full bg-[#E63946]" />}
                      </div>
                      <p className="text-slate-800 text-sm font-semibold leading-relaxed break-words">{n.mensagem}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{n.timestamp}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 shrink-0">
                      {!n.lida && (
                        <button
                          onClick={() => marcarLida(n.id)}
                          className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 rounded text-[10px] font-bold shadow-sm"
                        >
                          Marcar Lida
                        </button>
                      )}
                      <button
                        onClick={() => removerNotificacao(n.id)}
                        className="p-1.5 text-slate-400 hover:text-[#E63946] hover:bg-[#E63946]/5 rounded-lg transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      {/* Modal de impressão (alternativo via botão no header) */}
      <Modal aberto={modalImpressao} onFechar={() => setModalImpressao(false)} titulo="Solicitar Impressão">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantidade</label>
            <input
              type="number"
              min={50}
              value={formImpressao.quantidade}
              onChange={e => setFormImpressao({ ...formImpressao, quantidade: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Data do Evento</label>
            <input
              type="date"
              value={formImpressao.dataEvento}
              onChange={e => setFormImpressao({ ...formImpressao, dataEvento: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Observações</label>
            <textarea
              rows={3}
              value={formImpressao.observacoes}
              onChange={e => setFormImpressao({ ...formImpressao, observacoes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalImpressao(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
            <button onClick={enviarImpressao} disabled={!formImpressao.dataEvento} className="px-5 py-2 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839] disabled:opacity-40">Enviar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
