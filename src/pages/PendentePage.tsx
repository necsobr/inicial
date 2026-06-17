import { useState } from 'react';
import { Clock, LogOut, RefreshCw, CheckCircle, Users, XCircle, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function PendentePage() {
  const { usuario, logout } = useAuth();
  const { equipes, solicitacoesAdesao, setSolicitacoesAdesao, setUsuarios, usuarios, solicitacoesCriacaoGrupo } = useStore();
  const navigate = useNavigate();
  const [trocando, setTrocando] = useState(false);
  const [novaEquipeId, setNovaEquipeId] = useState('');

  if (!usuario) { navigate('/login'); return null; }

  const solicitacaoCriacao = usuario.solicitacaoCriacaoGrupoId
    ? solicitacoesCriacaoGrupo.find(s => s.id === usuario.solicitacaoCriacaoGrupoId)
    : undefined;

  const minhasSolicitacoes = solicitacoesAdesao.filter(s => s.usuarioId === usuario.id && s.status === 'pendente');
  const equipeAtual = equipes.find(e => e.id === usuario.equipeId);

  const trocarEquipe = () => {
    if (!novaEquipeId || novaEquipeId === usuario.equipeId) return;
    const novaEquipe = equipes.find(e => e.id === novaEquipeId);
    const novaSolicitacao = {
      id: `adm-${Date.now()}`,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      usuarioEmail: usuario.email,
      telefone: usuario.telefone ?? '',
      equipeId: novaEquipeId,
      equipeNome: novaEquipe?.nome ?? '',
      dataSolicitacao: new Date().toISOString().slice(0, 10),
      status: 'pendente' as const,
    };
    setSolicitacoesAdesao([...solicitacoesAdesao.map(s =>
      s.usuarioId === usuario.id && s.status === 'pendente'
        ? { ...s, status: 'recusada' as const }
        : s
    ), novaSolicitacao]);
    setUsuarios(usuarios.map(u => u.id === usuario.id
      ? { ...u, equipeId: novaEquipeId, solicitacaoCriacaoGrupoId: undefined }
      : u
    ));
    setTrocando(false);
    setNovaEquipeId('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (solicitacaoCriacao) {
    const recusada = solicitacaoCriacao.status === 'recusada';

    return (
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 overflow-hidden">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-red-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-6">
          <div className="rounded-3xl p-8 glass-card shadow-2xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className={`h-20 w-20 rounded-2xl flex items-center justify-center border-2 ${recusada ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                {recusada
                  ? <XCircle className="h-10 w-10 text-red-500" />
                  : <Clock className="h-10 w-10 text-amber-500" />
                }
              </div>
            </div>

            {recusada ? (
              <>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Solicitação Recusada</h2>
                <p className="text-sm text-slate-500 mb-6">
                  A criação do grupo <strong>"{solicitacaoCriacao.nomeGrupo}"</strong> não foi aprovada pelo administrador.
                </p>

                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mb-6 text-left">
                  <p className="text-xs font-bold text-red-600 uppercase mb-1">Grupo solicitado</p>
                  <p className="font-bold text-slate-900">{solicitacaoCriacao.nomeGrupo}</p>
                  <p className="text-sm text-slate-500">{solicitacaoCriacao.regional ? `${solicitacaoCriacao.regional} — ` : ''}{solicitacaoCriacao.cidade}</p>
                </div>

                {!trocando ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setTrocando(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/60 py-3 text-sm font-semibold text-slate-600 hover:bg-white hover:border-slate-300 transition"
                    >
                      <Users className="h-4 w-4" />
                      Entrar em Equipe Existente
                    </button>
                    <button
                      onClick={() => { handleLogout(); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946]/10 py-3 text-sm font-semibold text-[#E63946] hover:bg-[#E63946]/20 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair e Tentar Novamente
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-slate-700">Selecione uma equipe existente:</p>
                    <select
                      value={novaEquipeId}
                      onChange={e => setNovaEquipeId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-3 text-sm outline-none focus:border-[#E63946]"
                    >
                      <option value="">Selecione uma equipe</option>
                      {equipes.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.nome} — {eq.cidade}</option>
                      ))}
                    </select>
                    <div className="flex gap-3">
                      <button onClick={() => setTrocando(false)} className="flex-1 py-3 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
                      <button
                        onClick={trocarEquipe}
                        disabled={!novaEquipeId}
                        className="flex-1 py-3 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839] disabled:opacity-40 transition"
                      >
                        Solicitar Entrada
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Aguardando Aprovação</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Sua solicitação de criação de grupo foi enviada ao administrador da plataforma.
                </p>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-6 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <PlusCircle className="h-4 w-4 text-[#E63946]" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Novo Grupo Solicitado</span>
                  </div>
                  <p className="font-bold text-slate-900">{solicitacaoCriacao.nomeGrupo}</p>
                  <p className="text-sm text-slate-500">{solicitacaoCriacao.regional ? `${solicitacaoCriacao.regional} — ` : ''}{solicitacaoCriacao.cidade}</p>
                  <p className="text-xs text-slate-400 mt-1">Enviada em {solicitacaoCriacao.dataSolicitacao.split('-').reverse().join('/')}</p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 font-medium mb-6">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Você será o <strong>coordenador</strong> quando aprovado.</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946]/10 py-3 text-sm font-semibold text-[#E63946] hover:bg-[#E63946]/20 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6">
        <div className="rounded-3xl p-8 glass-card shadow-2xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">Cadastro em Análise</h2>
          <p className="text-sm text-slate-500 mb-6">
            Sua solicitação foi enviada. O coordenador da equipe será notificado e entrará em contato.
          </p>

          {equipeAtual && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Equipe Solicitada</span>
              </div>
              <p className="font-bold text-slate-900">{equipeAtual.nome}</p>
              <p className="text-sm text-slate-500">{equipeAtual.regional} — {equipeAtual.cidade}</p>
            </div>
          )}

          {minhasSolicitacoes.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 font-medium mb-6">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Aguardando aprovação desde <strong>{minhasSolicitacoes[0].dataSolicitacao.split('-').reverse().join('/')}</strong></span>
            </div>
          )}

          {!trocando ? (
            <div className="space-y-3">
              <button
                onClick={() => setTrocando(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/60 py-3 text-sm font-semibold text-slate-600 hover:bg-white hover:border-slate-300 transition"
              >
                <RefreshCw className="h-4 w-4" />
                Trocar de Equipe
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946]/10 py-3 text-sm font-semibold text-[#E63946] hover:bg-[#E63946]/20 transition"
              >
                <LogOut className="h-4 w-4" />
                Sair da Conta
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Selecione a nova equipe:</p>
              <select
                value={novaEquipeId}
                onChange={e => setNovaEquipeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-3 text-sm outline-none focus:border-[#E63946]"
              >
                <option value="">Selecione uma equipe</option>
                {equipes.filter(e => e.id !== usuario.equipeId).map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nome} — {eq.cidade}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button onClick={() => setTrocando(false)} className="flex-1 py-3 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
                <button
                  onClick={trocarEquipe}
                  disabled={!novaEquipeId}
                  className="flex-1 py-3 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839] disabled:opacity-40 transition"
                >
                  Confirmar Troca
                </button>
              </div>
              <p className="text-xs text-slate-400">Isso cancelará o pedido atual e enviará um novo para a equipe selecionada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
