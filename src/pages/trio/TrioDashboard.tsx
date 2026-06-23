import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Users, Check, Trash2, UserPlus, AlertTriangle,
  Settings2, CheckCircle, AlertCircle, MapPin, Crown, Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import type { TipoNotificacao } from '../../types';

type Aba = 'notificacoes' | 'membros';

const COR_TIPO: Record<TipoNotificacao, string> = {
  membro: 'border-indigo-500',
  patrocinador: 'border-[#E63946]',
  entrega: 'border-emerald-500',
  sistema: 'border-amber-400',
  atraso: 'border-red-500',
  cargo: 'border-violet-500',
};

export default function TrioDashboard() {
  const { usuario } = useAuth();
  const { notificacoesTrio, membros, equipes, usuarios, ordensServico, filasOS, marcarNotificacaoLida, marcarTodasNotificacoesLidas, removerNotificacao } = useStore();
  const [abaAtiva, setAbaAtiva] = useState<Aba>('notificacoes');
  const [filtro, setFiltro] = useState<'todos' | 'nao_lidas' | TipoNotificacao>('todos');

  const navigate = useNavigate();
  const equipeAtual = equipes.find(e => e.id === usuario?.equipeId);
  const membrosEquipe = membros.filter(m => m.equipeId === usuario?.equipeId);
  const trioEquipe = usuarios.filter(u => u.equipeId === usuario?.equipeId && u.papel === 'trio');

  const notifEquipe = notificacoesTrio.filter(n => !n.equipeId || n.equipeId === usuario?.equipeId);
  const naoLidas = notifEquipe.filter(n => !n.lida).length;

  const notifFiltradas = notifEquipe.filter(n => {
    if (filtro === 'nao_lidas') return !n.lida;
    if (filtro === 'todos') return true;
    return n.tipo === filtro;
  });

  const marcarLida = (id: string) => void marcarNotificacaoLida(id);
  const marcarTodasLidas = () => void marcarTodasNotificacoesLidas();
  const remover = (id: string) => void removerNotificacao(id);

  const icone = (tipo: TipoNotificacao) => {
    if (tipo === 'membro') return <UserPlus className="h-5 w-5 text-indigo-500" />;
    if (tipo === 'atraso') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (tipo === 'cargo') return <Settings2 className="h-5 w-5 text-violet-500" />;
    if (tipo === 'patrocinador') return <CheckCircle className="h-5 w-5 text-[#E63946]" />;
    if (tipo === 'entrega') return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    return <AlertCircle className="h-5 w-5 text-amber-500" />;
  };

  const patrocinadorConfirmado = (usuarioId: string) => {
    const ordensEquipe = ordensServico.filter(os => os.equipeId === usuario?.equipeId && os.status === 'ativa');
    return filasOS.some(f => f.usuarioId === usuarioId && (f.status === 'confirmado' || f.status === 'pago') && ordensEquipe.some(os => os.id === f.ordemServicoId));
  };

  return (
    <div className="min-h-full bg-[#F8F9FA]">
      {/* Header */}
      <div className="relative bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="blob -top-20 right-0 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider px-2.5 py-0.5 bg-violet-50 rounded-full">Trio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{equipeAtual?.nome ?? 'Minha Equipe'}</h1>
          {equipeAtual && (
            <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {equipeAtual.cidade}
              <span className="ml-2 text-slate-300">·</span>
              <span className="text-slate-500">{trioEquipe.length}/3 membros no trio</span>
            </div>
          )}
        </div>
      </div>

      {/* Abas */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'notificacoes' as Aba, label: 'Notificações', icone: Bell },
              { id: 'membros' as Aba, label: 'Membros', icone: Users },
            ].map(a => {
              const Icone = a.icone;
              return (
                <button key={a.id} onClick={() => setAbaAtiva(a.id)} className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${abaAtiva === a.id ? 'bg-[#E63946] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Icone className="h-4 w-4" />
                  {a.label}
                  {a.id === 'notificacoes' && naoLidas > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#E63946] text-white text-[9px] font-black flex items-center justify-center border-2 border-white">{naoLidas}</span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => navigate('/membro')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap text-slate-600 hover:bg-slate-100 transition-all ml-auto border border-slate-200"
            >
              <Calendar className="h-4 w-4" />
              Calendário e Filas
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* NOTIFICAÇÕES */}
        {abaAtiva === 'notificacoes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Painel do Trio</h2>
                <p className="text-xs text-slate-500 mt-0.5">Acompanhe as ações importantes da sua equipe.</p>
              </div>
              {naoLidas > 0 && (
                <button onClick={marcarTodasLidas} className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-4 py-2.5 rounded-xl shadow transition-all">
                  <Check className="h-4 w-4" />
                  Marcar Todas Lidas ({naoLidas})
                </button>
              )}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2 p-2 rounded-2xl glass-card">
              {([
                { id: 'todos', label: 'Todos' },
                { id: 'nao_lidas', label: `Não Lidas (${naoLidas})` },
                { id: 'membro', label: 'Membros' },
                { id: 'atraso', label: 'Atrasos' },
                { id: 'cargo', label: 'Cargos' },
                { id: 'patrocinador', label: 'Patrocinadores' },
              ] as { id: typeof filtro; label: string }[]).map(f => (
                <button key={f.id} onClick={() => setFiltro(f.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filtro === f.id ? 'bg-[#E63946] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {notifFiltradas.length === 0 ? (
                <div className="rounded-2xl bg-white/20 p-12 text-center text-slate-400 italic">Nenhuma notificação nesta lista.</div>
              ) : (
                notifFiltradas.map(n => (
                  <div key={n.id} className={`relative p-5 glass-card shadow-sm flex items-start gap-4 border-l-4 rounded-r-3xl rounded-l-md ${n.lida ? 'border-slate-200 opacity-60' : COR_TIPO[n.tipo] ?? 'border-slate-300'}`}>
                    <div className="flex-shrink-0 p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">{icone(n.tipo)}</div>
                    <div className="flex-grow space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.tipo}</span>
                        {!n.lida && <span className="h-1.5 w-1.5 rounded-full bg-[#E63946]" />}
                      </div>
                      <p className="text-slate-800 text-sm font-semibold leading-relaxed break-words">{n.mensagem}</p>
                      <p className="text-[10px] text-slate-400">{n.timestamp}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      {!n.lida && (
                        <button onClick={() => marcarLida(n.id)} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 rounded text-[10px] font-bold shadow-sm">Lida</button>
                      )}
                      <button onClick={() => remover(n.id)} className="p-1.5 text-slate-400 hover:text-[#E63946] hover:bg-[#E63946]/5 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MEMBROS */}
        {abaAtiva === 'membros' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Membros da Equipe</h2>
              <span className="text-sm text-slate-500">{membrosEquipe.length} membros</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {membrosEquipe.map(m => {
                const usuarioMembro = usuarios.find(u => u.id === m.usuarioId);
                const isConfirmado = usuarioMembro ? patrocinadorConfirmado(usuarioMembro.id) : false;
                const isTrio = usuarioMembro?.papel === 'trio';
                const isCoord = usuarioMembro?.papel === 'coordenador';
                return (
                  <div key={m.id} className="rounded-2xl p-5 glass-card shadow-md hover:shadow-lg transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 ${isTrio ? 'bg-violet-100 text-violet-700' : isCoord ? 'bg-emerald-100 text-emerald-700' : 'bg-[#E63946]/10 text-[#E63946]'}`}>
                        {m.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{m.nome}</h4>
                        <p className="text-xs text-slate-500 truncate">{m.empresa}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {isTrio && <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">Trio</span>}
                          {isCoord && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Coordenador</span>}
                          {isConfirmado && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Patrocinador ativo</span>}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-3 space-y-1">
                      <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Especialidade:</span> {m.especialidade}</p>
                      <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Contato:</span> {m.contato}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
