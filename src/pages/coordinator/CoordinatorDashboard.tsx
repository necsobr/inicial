import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, FileText, Map, Users, Bell, AlertCircle, Check, Trash2,
  Plus, MapPin, Clock, Calendar, Upload, Phone,
  CheckCircle, XCircle, UserCheck, Settings2, AlertTriangle,
  Save, Edit2, X, UserPlus, UserMinus, Crown, Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { formatarMoeda, formatarData, labelDiaSemana, labelStatusOS } from '../../utils/format';
import { calcularPrecoCota } from '../../utils/ordemServico';
import Modal from '../../components/Modal';
import type { OrdemServico, TipoNotificacao, MapaReferencia, DiaSemana, TipoRecorrenciaOS, UserRole } from '../../types';
import { CUSTO_BASE_REUNIAO } from '../../services/mockData';

type Aba = 'painel' | 'os' | 'mapa' | 'membros' | 'alertas';

const ABAS = [
  { id: 'painel' as Aba, label: 'Meu Painel', icone: User },
  { id: 'os' as Aba, label: 'Ordens de Serviço', icone: FileText },
  { id: 'mapa' as Aba, label: 'Mapa de Referência', icone: Map },
  { id: 'membros' as Aba, label: 'Membros', icone: Users },
  { id: 'alertas' as Aba, label: 'Alertas', icone: Bell },
];

const COR_STATUS_OS: Record<string, string> = {
  ativa: 'bg-emerald-100 text-emerald-700',
  encerrada: 'bg-slate-100 text-slate-500',
  cancelada: 'bg-red-100 text-red-700',
};

const PAPEIS_DISPONIVEIS: { value: UserRole; label: string }[] = [
  { value: 'membro', label: 'Membro' },
  { value: 'trio', label: 'Trio' },
  { value: 'coordenador', label: 'Coordenador de Comunicação' },
];

export default function CoordinatorDashboard() {
  const { usuario, atualizarPerfil } = useAuth();
  const navigate = useNavigate();
  const {
    equipes, membros, eventos,
    notificacoes, setNotificacoes,
    ordensServico,
    solicitacoesAdesao,
    mapaReferencia,
    filasOS, usuarios,
    notificacoesTrio,
    aceitarSolicitacaoAdesao,
    rejeitarSolicitacaoAdesao,
    alterarPapelUsuario,
    criarOrdemServico,
    uploadMapaReferencia,
  } = useStore();

  const [abaAtiva, setAbaAtiva] = useState<Aba>('painel');
  const [filtroAlertas, setFiltroAlertas] = useState<'todos' | 'nao_lidas' | TipoNotificacao>('todos');

  const equipeAtual = equipes.find(e => e.id === usuario?.equipeId);
  const membrosEquipe = membros.filter(m => m.equipeId === usuario?.equipeId);
  const ordensEquipe = ordensServico.filter(os => os.equipeId === usuario?.equipeId);
  const eventosEquipe = eventos.filter(ev => ev.equipeId === usuario?.equipeId);
  const pendentes = solicitacoesAdesao.filter(s => s.equipeId === usuario?.equipeId && s.status === 'pendente');
  const notifEquipe = notificacoes.filter(n => !n.equipeId || n.equipeId === usuario?.equipeId);
  const naoLidas = notifEquipe.filter(n => !n.lida).length;

  // Meu Painel
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [formPerfil, setFormPerfil] = useState({ nome: usuario?.nome ?? '', email: usuario?.email ?? '', telefone: usuario?.telefone ?? '' });
  const salvarPerfil = () => {
    void atualizarPerfil(formPerfil);
    setEditandoPerfil(false);
  };

  // O.S.
  const [modalOS, setModalOS] = useState(false);
  const [formOS, setFormOS] = useState<{
    tipoPapel: string; numeroCopias: number; recorrencia: TipoRecorrenciaOS; diaSemana: DiaSemana;
    dataUnica: string; numeroReunioes: number; numeroVagasPatrocinador: number;
  }>({ tipoPapel: '', numeroCopias: 350, recorrencia: 'semanal', diaSemana: 'terca', dataUnica: '', numeroReunioes: 4, numeroVagasPatrocinador: 4 });
  const precoCota = calcularPrecoCota(formOS.numeroReunioes, formOS.numeroVagasPatrocinador, CUSTO_BASE_REUNIAO);

  const criarOS = async () => {
    if (!formOS.tipoPapel || !usuario?.equipeId) return;
    const dataInicio = formOS.recorrencia === 'unica' ? formOS.dataUnica : new Date().toISOString().slice(0, 10);
    const dadosOS: Partial<OrdemServico> = {
      equipeId: usuario.equipeId,
      tipoPapel: formOS.tipoPapel,
      numeroCopias: formOS.numeroCopias,
      recorrencia: formOS.recorrencia,
      diaSemana: formOS.recorrencia === 'semanal' ? formOS.diaSemana : undefined,
      dataUnica: formOS.recorrencia === 'unica' ? formOS.dataUnica : undefined,
      numeroReunioes: formOS.recorrencia === 'unica' ? 1 : formOS.numeroReunioes,
      numeroVagasPatrocinador: formOS.numeroVagasPatrocinador,
      precoCota,
      dataInicio,
      status: 'ativa',
      criadoPorId: usuario.id,
    };
    await criarOrdemServico(dadosOS);
    setModalOS(false);
    setFormOS({ tipoPapel: '', numeroCopias: 350, recorrencia: 'semanal', diaSemana: 'terca', dataUnica: '', numeroReunioes: 4, numeroVagasPatrocinador: 4 });
  };

  // Mapa de Referência
  const [modalMapa, setModalMapa] = useState(false);
  const [formMapa, setFormMapa] = useState({ eventoId: '', nomeArquivo: '', dataEntrega: '', horaEntrega: '08:00', enderecoEntrega: '' });
  const eventoSelecionado = eventos.find(e => e.id === formMapa.eventoId);

  const dataLimiteMinima = (dataEvento: string) => {
    const d = new Date(`${dataEvento}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };
  const dataLimiteMaxima = (dataEvento: string) => {
    const d = new Date(`${dataEvento}T00:00:00`);
    d.setDate(d.getDate() - 3);
    return d.toISOString().slice(0, 10);
  };

  const uploadMapa = async () => {
    if (!formMapa.eventoId || !formMapa.nomeArquivo || !formMapa.dataEntrega || !formMapa.enderecoEntrega || !usuario) return;
    const ev = eventos.find(e => e.id === formMapa.eventoId);
    await uploadMapaReferencia({
      equipeId: usuario.equipeId ?? '',
      ordemServicoId: ev?.ordemServicoId ?? '',
      eventoId: formMapa.eventoId,
      nomeArquivo: formMapa.nomeArquivo,
      dataUpload: new Date().toISOString().slice(0, 10),
      dataEntrega: formMapa.dataEntrega,
      horaEntrega: formMapa.horaEntrega,
      enderecoEntrega: formMapa.enderecoEntrega,
      uploadPorId: usuario.id,
    });
    setModalMapa(false);
    setFormMapa({ eventoId: '', nomeArquivo: '', dataEntrega: '', horaEntrega: '08:00', enderecoEntrega: '' });
  };

  const mapaParaEvento = (eventoId: string) => mapaReferencia.find(m => m.eventoId === eventoId);

  const diasAteEvento = (dataEvento: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const ev = new Date(`${dataEvento}T00:00:00`);
    return Math.ceil((ev.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Membros
  const [modalTransferencia, setModalTransferencia] = useState(false);
  const [transferirPara, setTransferirPara] = useState<string | null>(null);
  const [papelPara, setPapelPara] = useState<UserRole>('membro');

  const aceitarMembro = async (solId: string) => {
    const sol = solicitacoesAdesao.find(s => s.id === solId);
    if (!sol) return;
    await aceitarSolicitacaoAdesao(solId);
    const notif = {
      id: `not-${Date.now()}`,
      tipo: 'membro' as const,
      mensagem: `${sol.usuarioNome} foi aceito no grupo ${equipeAtual?.nome ?? ''}.`,
      timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }).replace(',', ' às'),
      lida: false,
      equipeId: usuario?.equipeId,
    };
    setNotificacoes([notif, ...notificacoes]);
  };

  const recusarMembro = async (solId: string) => {
    await rejeitarSolicitacaoAdesao(solId);
  };

  const solicitarAlteracaoPapel = (usuarioId: string, novoPapel: UserRole) => {
    if (novoPapel === 'coordenador') {
      setTransferirPara(usuarioId);
      setPapelPara(novoPapel);
      setModalTransferencia(true);
    } else {
      void alterarPapelUsuario(usuarioId, novoPapel);
    }
  };

  const confirmarTransferencia = async () => {
    if (transferirPara) {
      await alterarPapelUsuario(transferirPara, papelPara);
      if (papelPara === 'coordenador' && usuario) {
        await alterarPapelUsuario(usuario.id, 'membro');
      }
    }
    setModalTransferencia(false);
    setTransferirPara(null);
  };

  const patrocinadorConfirmado = (uid: string) =>
    filasOS.some(f => f.usuarioId === uid && (f.status === 'confirmado' || f.status === 'pago'));

  const alertasFiltrados = notifEquipe.filter(n => {
    if (filtroAlertas === 'nao_lidas') return !n.lida;
    if (filtroAlertas === 'todos') return true;
    return n.tipo === filtroAlertas;
  });

  const marcarLida = (id: string) => setNotificacoes(notificacoes.map(n => n.id === id ? { ...n, lida: true } : n));
  const marcarTodasLidas = () => setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
  const removerNotificacao = (id: string) => setNotificacoes(notificacoes.filter(n => n.id !== id));

  const iconeNotif = (tipo: TipoNotificacao) => {
    if (tipo === 'membro') return <UserPlus className="h-5 w-5 text-indigo-500" />;
    if (tipo === 'patrocinador') return <CheckCircle className="h-5 w-5 text-[#E63946]" />;
    if (tipo === 'entrega') return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    if (tipo === 'atraso') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    if (tipo === 'cargo') return <Settings2 className="h-5 w-5 text-violet-500" />;
    return <AlertCircle className="h-5 w-5 text-slate-400" />;
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

  const eventosComOS = eventosEquipe.filter(ev => ev.ordemServicoId && ev.tipo === 'reuniao');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FA]">
      {/* Header */}
      <div className="relative bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="blob -top-20 right-0 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider px-2.5 py-0.5 bg-[#E63946]/10 rounded-full">{equipeAtual.regional}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{equipeAtual.nome}</h1>
          <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {equipeAtual.cidade}
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="sticky top-16 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {ABAS.map(a => {
              const Icone = a.icone;
              return (
                <button
                  key={a.id}
                  onClick={() => setAbaAtiva(a.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${abaAtiva === a.id ? 'bg-[#E63946] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Icone className="h-4 w-4" />
                  {a.label}
                  {a.id === 'alertas' && naoLidas > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#E63946] text-white text-[9px] font-black flex items-center justify-center border-2 border-white">{naoLidas}</span>
                  )}
                  {a.id === 'membros' && pendentes.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">{pendentes.length}</span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => navigate('/membro')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap text-slate-600 hover:bg-slate-100 transition-all ml-auto border border-slate-200"
            >
              <Calendar className="h-4 w-4" />
              Área do Membro
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* MEU PAINEL */}
        {abaAtiva === 'painel' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="rounded-3xl p-6 glass-card shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-extrabold text-slate-900">Meus Dados</h2>
                {!editandoPerfil ? (
                  <button
                    onClick={() => { setFormPerfil({ nome: usuario?.nome ?? '', email: usuario?.email ?? '', telefone: usuario?.telefone ?? '' }); setEditandoPerfil(true); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:bg-[#E63946]/10 px-3 py-1.5 rounded-lg transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditandoPerfil(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition"><X className="h-3.5 w-3.5" /></button>
                    <button onClick={salvarPerfil} className="flex items-center gap-1 text-xs font-bold text-white bg-[#E63946] px-3 py-1.5 rounded-lg transition"><Save className="h-3.5 w-3.5" />Salvar</button>
                  </div>
                )}
              </div>

              {!editandoPerfil ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center font-extrabold text-xl shrink-0">
                      {usuario?.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-lg">{usuario?.nome}</p>
                      <p className="text-sm text-slate-500">Coordenador de Comunicação</p>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { label: 'E-mail', valor: usuario?.email },
                      { label: 'Telefone', valor: usuario?.telefone ?? '—' },
                      { label: 'Equipe', valor: equipeAtual.nome },
                      { label: 'Regional', valor: equipeAtual.regional },
                    ].map((item, i) => (
                      <div key={i} className="py-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">{item.label}</span>
                        <span className="text-sm font-semibold text-slate-700">{item.valor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Nome', key: 'nome' as const, type: 'text' },
                    { label: 'E-mail', key: 'email' as const, type: 'email' },
                    { label: 'Telefone', key: 'telefone' as const, type: 'tel' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{campo.label}</label>
                      <input
                        type={campo.type}
                        value={formPerfil[campo.key]}
                        onChange={e => setFormPerfil({ ...formPerfil, [campo.key]: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumo rápido */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Membros', valor: membrosEquipe.length, cor: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'O.S. Ativas', valor: ordensEquipe.filter(o => o.status === 'ativa').length, cor: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Pendentes', valor: pendentes.length, cor: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((c, i) => (
                <div key={i} className={`rounded-2xl p-4 ${c.bg} border border-white/60 text-center`}>
                  <p className="text-xs font-semibold text-slate-500 mb-1">{c.label}</p>
                  <p className={`text-2xl font-extrabold ${c.cor}`}>{c.valor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDENS DE SERVIÇO */}
        {abaAtiva === 'os' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Ordens de Serviço</h2>
              <button
                onClick={() => setModalOS(true)}
                className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-5 py-2.5 rounded-xl shadow-lg transition"
              >
                <Plus className="h-4 w-4" />
                Nova O.S.
              </button>
            </div>

            {ordensEquipe.length === 0 ? (
              <div className="text-center py-16 rounded-2xl glass-card text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhuma O.S. cadastrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ordensEquipe.map(os => {
                  const eventosOS = eventosEquipe.filter(ev => os.eventosGeradosIds.includes(ev.id));
                  return (
                    <div key={os.id} className="rounded-2xl p-5 glass-card shadow-md">
                      <div className="flex items-start gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-extrabold text-slate-900">{os.tipoPapel}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${COR_STATUS_OS[os.status]}`}>{labelStatusOS(os.status)}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {os.recorrencia === 'semanal'
                                ? `Toda ${labelDiaSemana(os.diaSemana)?.toLowerCase()} · ${os.numeroReunioes} reuniões`
                                : `Reunião única: ${formatarData(os.dataUnica ?? '')}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {os.numeroVagasPatrocinador} vagas de patrocinador
                            </span>
                            {os.numeroCopias && (
                              <span className="flex items-center gap-1">
                                <Layers className="h-3.5 w-3.5" />
                                {os.numeroCopias} cópias · {os.tipoPapel}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-400 font-semibold uppercase mb-0.5">Cota por patrocinador</p>
                          <p className="text-xl font-extrabold text-[#E63946]">{formatarMoeda(os.precoCota)}</p>
                        </div>
                      </div>

                      {eventosOS.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Reuniões geradas</p>
                          <div className="flex flex-wrap gap-2">
                            {eventosOS.map(ev => (
                              <span key={ev.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg font-medium">
                                {formatarData(ev.data)} {ev.hora ? `às ${ev.hora}` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MAPA DE REFERÊNCIA */}
        {abaAtiva === 'mapa' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Mapas de Referência</h2>
              <button
                onClick={() => setModalMapa(true)}
                className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-5 py-2.5 rounded-xl shadow-lg transition"
              >
                <Upload className="h-4 w-4" />
                Enviar Mapa
              </button>
            </div>

            {/* Reuniões aguardando mapa */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Reuniões das O.S. — Status de Entrega</h3>
              {eventosComOS.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhuma reunião encontrada nas O.S. ativas.</p>
              ) : (
                eventosComOS.sort((a, b) => a.data.localeCompare(b.data)).map(ev => {
                  const mapa = mapaParaEvento(ev.id);
                  const dias = diasAteEvento(ev.data);
                  const atrasado = !mapa && dias <= 2 && dias >= 0;
                  const vencido = !mapa && dias < 0;
                  return (
                    <div key={ev.id} className={`rounded-2xl p-5 glass-card shadow-sm border-l-4 ${mapa ? 'border-emerald-400' : atrasado ? 'border-amber-400' : vencido ? 'border-red-400' : 'border-slate-200'}`}>
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-center min-w-[56px]">
                          <span className="text-[10px] font-bold uppercase text-slate-500">{ev.data.split('-')[1]}/{ev.data.split('-')[0].slice(2)}</span>
                          <span className="text-2xl font-extrabold text-slate-800 leading-tight">{ev.data.split('-')[2]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm">{ev.titulo}</p>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />{ev.hora ?? '—'}
                            {ev.local && <><MapPin className="h-3 w-3 ml-2" />{ev.local}</>}
                          </p>
                          {mapa ? (
                            <div className="mt-2 space-y-0.5">
                              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />Mapa enviado: {mapa.nomeArquivo}</p>
                              <p className="text-xs text-slate-400">Entrega: {formatarData(mapa.dataEntrega)} às {mapa.horaEntrega} — {mapa.enderecoEntrega}</p>
                            </div>
                          ) : vencido ? (
                            <p className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />Prazo encerrado — envio bloqueado</p>
                          ) : atrasado ? (
                            <p className="mt-2 text-xs text-amber-600 font-semibold flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Atenção: faltam {dias} dia{dias !== 1 ? 's' : ''} para a reunião</p>
                          ) : (
                            <p className="mt-2 text-xs text-slate-400">Faltam {dias} dias — mapa ainda não enviado</p>
                          )}
                        </div>
                        {!mapa && !vencido && (
                          <button
                            onClick={() => { setFormMapa({ ...formMapa, eventoId: ev.id }); setModalMapa(true); }}
                            className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:bg-[#E63946]/10 px-3 py-1.5 rounded-lg transition border border-[#E63946]/30"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Enviar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* MEMBROS */}
        {abaAtiva === 'membros' && (
          <div className="space-y-8">
            {/* Solicitações pendentes */}
            {pendentes.length > 0 && (
              <div className="rounded-3xl p-6 glass-card shadow-xl border border-amber-200/60">
                <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-amber-500" />
                  Solicitações Pendentes ({pendentes.length})
                </h3>
                <div className="space-y-3">
                  {pendentes.map(sol => (
                    <div key={sol.id} className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 flex-wrap sm:flex-nowrap">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold shrink-0">{sol.usuarioNome.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900">{sol.usuarioNome}</p>
                        <p className="text-xs text-slate-500">{sol.usuarioEmail} · {sol.telefone}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Solicitado em {formatarData(sol.dataSolicitacao)}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => aceitarMembro(sol.id)} className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition"><UserCheck className="h-3.5 w-3.5" />Aceitar</button>
                        <button onClick={() => recusarMembro(sol.id)} className="flex items-center gap-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition"><UserMinus className="h-3.5 w-3.5" />Recusar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patrocinadores confirmados na O.S. ativa */}
            {(() => {
              const confirmados = filasOS.filter(f => (f.status === 'confirmado' || f.status === 'pago') && ordensEquipe.some(os => os.id === f.ordemServicoId && os.status === 'ativa'));
              if (confirmados.length === 0) return null;
              return (
                <div className="rounded-3xl p-6 glass-card shadow-xl border border-emerald-200/60">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-emerald-500" />
                    Patrocinadores Confirmados — Contatos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {confirmados.map(f => (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{f.usuarioNome}</p>
                          <p className="text-xs text-slate-500">{f.empresa}</p>
                          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{f.telefone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Lista de usuários da equipe com permissões */}
            {(() => {
              const usuariosEquipe = usuarios.filter(u =>
                u.equipeId === usuario?.equipeId &&
                !u.pendente &&
                u.papel !== 'admin' &&
                u.papel !== 'producao'
              );
              return (
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">
                    Permissões da Equipe ({usuariosEquipe.length} usuários)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {usuariosEquipe.map(u => {
                      const membroInfo = membros.find(m => m.usuarioId === u.id || m.equipeId === usuario?.equipeId && m.nome === u.nome);
                      const isConfirmado = patrocinadorConfirmado(u.id);
                      const isSelf = u.id === usuario?.id;
                      const papelCor = u.papel === 'trio' ? 'bg-violet-100 text-violet-700' : u.papel === 'coordenador' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600';
                      return (
                        <div key={u.id} className={`rounded-2xl p-4 glass-card shadow-sm hover:shadow-md transition-all ${isSelf ? 'ring-2 ring-[#E63946]/20' : ''}`}>
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-extrabold shrink-0 ${u.papel === 'trio' ? 'bg-violet-100 text-violet-700' : u.papel === 'coordenador' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#E63946]/10 text-[#E63946]'}`}>
                              {u.nome.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">{u.nome} {isSelf && <span className="text-[10px] text-slate-400">(você)</span>}</h4>
                              <p className="text-xs text-slate-400 truncate">{u.email}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${papelCor}`}>
                                  {u.papel === 'trio' ? 'Trio' : u.papel === 'coordenador' ? 'Coordenador' : 'Membro'}
                                </span>
                                {isConfirmado && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Patrocinador</span>}
                              </div>
                            </div>
                          </div>
                          {membroInfo && (
                            <div className="text-xs text-slate-500 space-y-0.5 mb-3">
                              <p><span className="font-semibold text-slate-700">Empresa:</span> {membroInfo.empresa}</p>
                              <p><span className="font-semibold text-slate-700">Contato:</span> {membroInfo.contato}</p>
                              <p><span className="font-semibold text-slate-700">Esp.:</span> {membroInfo.especialidade}</p>
                            </div>
                          )}
                          {u.telefone && !membroInfo && (
                            <p className="text-xs text-slate-500 mb-3"><span className="font-semibold text-slate-700">Tel:</span> {u.telefone}</p>
                          )}
                          {!isSelf && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Papel no sistema</label>
                              <select
                                value={u.papel}
                                onChange={e => solicitarAlteracaoPapel(u.id, e.target.value as UserRole)}
                                className="w-full text-xs rounded-lg border border-slate-200 bg-white/60 py-1.5 px-2 outline-none focus:border-[#E63946]"
                              >
                                {PAPEIS_DISPONIVEIS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ALERTAS */}
        {abaAtiva === 'alertas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Alertas</h2>
                <p className="text-xs text-slate-500 mt-0.5">Notificações da sua equipe.</p>
              </div>
              {naoLidas > 0 && (
                <button onClick={marcarTodasLidas} className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-4 py-2.5 rounded-xl shadow transition-all">
                  <Check className="h-4 w-4" />Marcar Todas Lidas ({naoLidas})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 p-2 rounded-2xl glass-card">
              {([
                { id: 'todos', label: 'Todos' },
                { id: 'nao_lidas', label: `Não Lidas (${naoLidas})` },
                { id: 'membro', label: 'Membros' },
                { id: 'patrocinador', label: 'Patrocinadores' },
                { id: 'entrega', label: 'Entregas' },
                { id: 'sistema', label: 'Sistema' },
              ] as { id: typeof filtroAlertas; label: string }[]).map(f => (
                <button key={f.id} onClick={() => setFiltroAlertas(f.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filtroAlertas === f.id ? 'bg-[#E63946] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {alertasFiltrados.length === 0 ? (
                <div className="rounded-2xl bg-white/20 p-12 text-center text-slate-400 italic">Nenhum alerta nesta lista.</div>
              ) : alertasFiltrados.map(n => (
                <div key={n.id} className={`relative p-5 glass-card shadow-sm flex items-start gap-4 border-l-4 rounded-r-3xl rounded-l-md ${n.lida ? 'border-slate-200 opacity-60' : 'border-[#E63946]'}`}>
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">{iconeNotif(n.tipo)}</div>
                  <div className="flex-grow space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.tipo}</span>
                      {!n.lida && <span className="h-1.5 w-1.5 rounded-full bg-[#E63946]" />}
                    </div>
                    <p className="text-slate-800 text-sm font-semibold leading-relaxed">{n.mensagem}</p>
                    <p className="text-[10px] text-slate-400">{n.timestamp}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    {!n.lida && (
                      <button onClick={() => marcarLida(n.id)} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 rounded text-[10px] font-bold shadow-sm">Lida</button>
                    )}
                    <button onClick={() => removerNotificacao(n.id)} className="p-1.5 text-slate-400 hover:text-[#E63946] rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova O.S. */}
      <Modal aberto={modalOS} onFechar={() => setModalOS(false)} titulo="Nova Ordem de Serviço">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tipo de Papel</label>
              <input type="text" value={formOS.tipoPapel} onChange={e => setFormOS({ ...formOS, tipoPapel: e.target.value })} placeholder="Ex: Couché 180g" className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Número de Cópias</label>
              <input type="number" min={1} value={formOS.numeroCopias} onChange={e => setFormOS({ ...formOS, numeroCopias: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Recorrência</label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              {(['semanal', 'unica'] as TipoRecorrenciaOS[]).map(r => (
                <button key={r} onClick={() => setFormOS({ ...formOS, recorrencia: r })} className={`flex-1 py-2.5 text-sm font-bold transition-all ${formOS.recorrencia === r ? 'bg-[#E63946] text-white' : 'bg-white/50 text-slate-600'}`}>
                  {r === 'semanal' ? 'Semanal' : 'Data Única'}
                </button>
              ))}
            </div>
          </div>
          {formOS.recorrencia === 'semanal' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dia da Semana</label>
                <select value={formOS.diaSemana} onChange={e => setFormOS({ ...formOS, diaSemana: e.target.value as DiaSemana })} className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]">
                  {(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'] as DiaSemana[]).map(d => (
                    <option key={d} value={d}>{labelDiaSemana(d)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Número de Reuniões</label>
                <input type="number" min={1} max={52} value={formOS.numeroReunioes} onChange={e => setFormOS({ ...formOS, numeroReunioes: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]" />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Data da Reunião</label>
              <input type="date" value={formOS.dataUnica} onChange={e => setFormOS({ ...formOS, dataUnica: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Vagas de Patrocinador</label>
            <input type="number" min={1} max={20} value={formOS.numeroVagasPatrocinador} onChange={e => setFormOS({ ...formOS, numeroVagasPatrocinador: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]" />
          </div>
          <div className="rounded-xl bg-[#E63946]/5 border border-[#E63946]/20 p-4 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Cota por Patrocinador</p>
            <p className="text-2xl font-extrabold text-[#E63946]">{formatarMoeda(precoCota)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formOS.recorrencia === 'semanal' ? formOS.numeroReunioes : 1} reunião(s) × R$ {CUSTO_BASE_REUNIAO} ÷ {formOS.numeroVagasPatrocinador} vagas</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOS(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
            <button onClick={criarOS} disabled={!formOS.tipoPapel || (formOS.recorrencia === 'unica' && !formOS.dataUnica)} className="px-5 py-2 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839] disabled:opacity-40">Criar O.S.</button>
          </div>
        </div>
      </Modal>

      {/* Modal Upload Mapa */}
      <Modal aberto={modalMapa} onFechar={() => { setModalMapa(false); setFormMapa({ eventoId: '', nomeArquivo: '', dataEntrega: '', horaEntrega: '08:00', enderecoEntrega: '' }); }} titulo="Enviar Mapa de Referência">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Reunião / Evento</label>
            <select value={formMapa.eventoId} onChange={e => setFormMapa({ ...formMapa, eventoId: e.target.value, dataEntrega: '' })} className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]">
              <option value="">Selecione a reunião</option>
              {eventosComOS.filter(ev => !mapaParaEvento(ev.id) && diasAteEvento(ev.data) >= 0).map(ev => (
                <option key={ev.id} value={ev.id}>{ev.titulo} — {formatarData(ev.data)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Arquivo do Mapa (PDF)</label>
            <input type="text" value={formMapa.nomeArquivo} onChange={e => setFormMapa({ ...formMapa, nomeArquivo: e.target.value })} placeholder="nome_do_arquivo.pdf" className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]" />
            <p className="text-xs text-slate-400 mt-1">Simulação: informe o nome do arquivo PDF</p>
          </div>
          {eventoSelecionado && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Data de Entrega <span className="text-slate-400 normal-case font-normal">(entre {formatarData(dataLimiteMaxima(eventoSelecionado.data))} e {formatarData(dataLimiteMinima(eventoSelecionado.data))})</span>
                </label>
                <input type="date" value={formMapa.dataEntrega} min={dataLimiteMaxima(eventoSelecionado.data)} max={dataLimiteMinima(eventoSelecionado.data)} onChange={e => setFormMapa({ ...formMapa, dataEntrega: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Hora de Entrega</label>
                <input type="time" value={formMapa.horaEntrega} onChange={e => setFormMapa({ ...formMapa, horaEntrega: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]" />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Endereço de Entrega</label>
            <input type="text" value={formMapa.enderecoEntrega} onChange={e => setFormMapa({ ...formMapa, enderecoEntrega: e.target.value })} placeholder="Ex: Rua das Flores, 123 — São José dos Campos/SP" className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setModalMapa(false); setFormMapa({ eventoId: '', nomeArquivo: '', dataEntrega: '', horaEntrega: '08:00', enderecoEntrega: '' }); }} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
            <button onClick={uploadMapa} disabled={!formMapa.eventoId || !formMapa.nomeArquivo || !formMapa.dataEntrega || !formMapa.enderecoEntrega} className="px-5 py-2 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839] disabled:opacity-40">Enviar</button>
          </div>
        </div>
      </Modal>

      {/* Modal Transferência de Coordenação */}
      <Modal aberto={modalTransferencia} onFechar={() => setModalTransferencia(false)} titulo="Transferir Coordenação">
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <Crown className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Atenção: ação irreversível</p>
              <p>Ao confirmar, você passará a coordenação para outro membro. <strong>Você perderá o acesso especial de coordenador</strong> e será rebaixado para membro comum. Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalTransferencia(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
            <button onClick={confirmarTransferencia} className="px-5 py-2 text-sm font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600">Confirmar Transferência</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
