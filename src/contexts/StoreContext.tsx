import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Usuario, Equipe, Membro, Evento, Palestrante,
  SolicitacaoPatrocinio, RequisicaoImpressao, ConfiguracaoIntegracao, Notificacao,
  OrdemServico, SolicitacaoAdesao, MapaReferencia, EntradaFila, SolicitacaoCriacaoGrupo,
} from '../types';
import {
  PALESTRANTES_PADRAO, SOLICITACOES_PADRAO, REQUISICOES_PADRAO,
} from '../services/mockData';
import {
  carregarDadosIniciais, carregarSolicitacoesCriacaoGrupo,
  equipeService, ordemServicoService, mapaReferenciaService,
  filaService, adesaoService, criacaoGrupoService,
  notificacaoService, integracaoService,
} from '../services/storeService';
import { authService } from '../services/authService';
import { getToken } from '../services/api';

interface StoreContextType {
  // Estado
  usuarios: Usuario[];
  setUsuarios: (u: Usuario[]) => void;
  equipes: Equipe[];
  setEquipes: (e: Equipe[]) => void;
  membros: Membro[];
  setMembros: (m: Membro[]) => void;
  eventos: Evento[];
  setEventos: (e: Evento[]) => void;
  palestrantes: Palestrante[];
  setPalestrantes: (p: Palestrante[]) => void;
  solicitacoes: SolicitacaoPatrocinio[];
  setSolicitacoes: (s: SolicitacaoPatrocinio[]) => void;
  requisicoes: RequisicaoImpressao[];
  setRequisicoes: (r: RequisicaoImpressao[]) => void;
  integracoes: ConfiguracaoIntegracao[];
  setIntegracoes: (i: ConfiguracaoIntegracao[]) => void;
  notificacoes: Notificacao[];
  setNotificacoes: (n: Notificacao[]) => void;
  notificacoesTrio: Notificacao[];
  setNotificacoesTrio: (n: Notificacao[]) => void;
  ordensServico: OrdemServico[];
  setOrdensServico: (o: OrdemServico[]) => void;
  solicitacoesAdesao: SolicitacaoAdesao[];
  setSolicitacoesAdesao: (s: SolicitacaoAdesao[]) => void;
  mapaReferencia: MapaReferencia[];
  setMapaReferencia: (m: MapaReferencia[]) => void;
  filasOS: EntradaFila[];
  setFilasOS: (f: EntradaFila[]) => void;
  solicitacoesCriacaoGrupo: SolicitacaoCriacaoGrupo[];
  setSolicitacoesCriacaoGrupo: (s: SolicitacaoCriacaoGrupo[]) => void;
  carregando: boolean;

  // Ações da API
  recarregarDados: () => Promise<void>;
  aceitarSolicitacaoAdesao: (id: string) => Promise<void>;
  rejeitarSolicitacaoAdesao: (id: string) => Promise<void>;
  aprovarCriacaoGrupo: (id: string) => Promise<void>;
  rejeitarCriacaoGrupo: (id: string) => Promise<void>;
  marcarNotificacaoLida: (id: string) => Promise<void>;
  marcarTodasNotificacoesLidas: () => Promise<void>;
  removerNotificacao: (id: string) => Promise<void>;
  atualizarIntegracao: (id: string, dados: Partial<ConfiguracaoIntegracao>) => Promise<void>;
  testarIntegracao: (id: string) => Promise<boolean>;
  criarOrdemServico: (dados: Partial<OrdemServico>) => Promise<OrdemServico>;
  uploadMapaReferencia: (dados: Omit<MapaReferencia, 'id'>) => Promise<void>;
  entrarNaFila: (ordemServicoId: string) => Promise<void>;
  pagarFila: (id: string) => Promise<void>;
  recusarFila: (id: string) => Promise<void>;
  alterarPapelUsuario: (usuarioId: string, novoPapel: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [usuarios,     setUsuarios]     = useState<Usuario[]>([]);
  const [equipes,      setEquipes]      = useState<Equipe[]>([]);
  const [membros,      setMembros]      = useState<Membro[]>([]);
  const [eventos,      setEventos]      = useState<Evento[]>([]);
  const [palestrantes, setPalestrantes] = useState<Palestrante[]>(PALESTRANTES_PADRAO);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPatrocinio[]>(SOLICITACOES_PADRAO);
  const [requisicoes,  setRequisicoes]  = useState<RequisicaoImpressao[]>(REQUISICOES_PADRAO);
  const [integracoes,  setIntegracoes]  = useState<ConfiguracaoIntegracao[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [notificacoesTrio, setNotificacoesTrio] = useState<Notificacao[]>([]);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [solicitacoesAdesao, setSolicitacoesAdesao] = useState<SolicitacaoAdesao[]>([]);
  const [mapaReferencia, setMapaReferencia] = useState<MapaReferencia[]>([]);
  const [filasOS, setFilasOS] = useState<EntradaFila[]>([]);
  const [solicitacoesCriacaoGrupo, setSolicitacoesCriacaoGrupo] = useState<SolicitacaoCriacaoGrupo[]>([]);
  const [carregando, setCarregando] = useState(false);

  const recarregarDados = useCallback(async () => {
    if (!getToken()) return;
    setCarregando(true);
    try {
      const dados = await carregarDadosIniciais();
      setEquipes(dados.equipes);
      setMembros(dados.membros);
      setEventos(dados.eventos);
      setOrdensServico(dados.ordensServico);
      setMapaReferencia(dados.mapaReferencia);
      setFilasOS(dados.filasOS);
      setSolicitacoesAdesao(dados.solicitacoesAdesao);
      setNotificacoesTrio(dados.notificacoesTrio);

      // Carregar usuários da equipe
      try {
        const me = await authService.me();
        if (me.papel === 'admin') {
          const scg = await carregarSolicitacoesCriacaoGrupo(me.papel);
          setSolicitacoesCriacaoGrupo(scg);
        }
      } catch {}

      // Integrações (admin)
      try {
        const ints = await integracaoService.listar();
        setIntegracoes(ints);
      } catch {}
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregarDados();
  }, [recarregarDados]);

  // ── Ações ──────────────────────────────────────────────────────────────

  const aceitarSolicitacaoAdesao = async (id: string) => {
    await adesaoService.aceitar(id);
    setSolicitacoesAdesao(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'aceita' as const } : s)
    );
    // Recarrega usuários da equipe
    await recarregarDados();
  };

  const rejeitarSolicitacaoAdesao = async (id: string) => {
    await adesaoService.rejeitar(id);
    setSolicitacoesAdesao(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'recusada' as const } : s)
    );
  };

  const aprovarCriacaoGrupo = async (id: string) => {
    const { equipe, usuario } = await criacaoGrupoService.aprovar(id);
    setSolicitacoesCriacaoGrupo(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'aprovada' as const } : s)
    );
    setEquipes(prev => [...prev, equipe]);
    setUsuarios(prev =>
      prev.map(u => u.id === usuario.id ? usuario : u)
    );
  };

  const rejeitarCriacaoGrupo = async (id: string) => {
    await criacaoGrupoService.rejeitar(id);
    setSolicitacoesCriacaoGrupo(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'recusada' as const } : s)
    );
  };

  const marcarNotificacaoLida = async (id: string) => {
    await notificacaoService.marcarLida(id);
    setNotificacoesTrio(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const marcarTodasNotificacoesLidas = async () => {
    await notificacaoService.marcarTodasLidas();
    setNotificacoesTrio(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const removerNotificacao = async (id: string) => {
    await notificacaoService.remover(id);
    setNotificacoesTrio(prev => prev.filter(n => n.id !== id));
  };

  const atualizarIntegracao = async (id: string, dados: Partial<ConfiguracaoIntegracao>) => {
    const atualizada = await integracaoService.atualizar(id, dados);
    setIntegracoes(prev => prev.map(i => i.id === id ? atualizada : i));
  };

  const testarIntegracao = (id: string) => integracaoService.testar(id);

  const criarOrdemServico = async (dados: Partial<OrdemServico>): Promise<OrdemServico> => {
    const nova = await ordemServicoService.criar(dados);
    setOrdensServico(prev => [...prev, nova]);
    // Recarrega eventos gerados
    const eventosAtualizados = await (await import('../services/storeService')).eventoService.listar();
    setEventos(eventosAtualizados);
    return nova;
  };

  const uploadMapaReferencia = async (dados: Omit<MapaReferencia, 'id'>) => {
    const novo = await mapaReferenciaService.criar(dados);
    setMapaReferencia(prev => [...prev, novo]);
  };

  const entrarNaFila = async (ordemServicoId: string) => {
    const entrada = await filaService.entrar(ordemServicoId);
    setFilasOS(prev => [...prev, entrada]);
  };

  const pagarFila = async (id: string) => {
    const atualizada = await filaService.pagar(id);
    setFilasOS(prev => prev.map(f => f.id === id ? atualizada : f));
  };

  const recusarFila = async (id: string) => {
    const atualizada = await filaService.recusar(id);
    setFilasOS(prev => prev.map(f => f.id === id ? atualizada : f));
  };

  const alterarPapelUsuario = async (usuarioId: string, novoPapel: string) => {
    await authService.alterarPapel(usuarioId, novoPapel as Parameters<typeof authService.alterarPapel>[1]);
    setUsuarios(prev =>
      prev.map(u => u.id === usuarioId ? { ...u, papel: novoPapel as Usuario['papel'] } : u)
    );
  };

  return (
    <StoreContext.Provider value={{
      usuarios, setUsuarios,
      equipes, setEquipes,
      membros, setMembros,
      eventos, setEventos,
      palestrantes, setPalestrantes,
      solicitacoes, setSolicitacoes,
      requisicoes, setRequisicoes,
      integracoes, setIntegracoes,
      notificacoes, setNotificacoes,
      notificacoesTrio, setNotificacoesTrio,
      ordensServico, setOrdensServico,
      solicitacoesAdesao, setSolicitacoesAdesao,
      mapaReferencia, setMapaReferencia,
      filasOS, setFilasOS,
      solicitacoesCriacaoGrupo, setSolicitacoesCriacaoGrupo,
      carregando,
      recarregarDados,
      aceitarSolicitacaoAdesao,
      rejeitarSolicitacaoAdesao,
      aprovarCriacaoGrupo,
      rejeitarCriacaoGrupo,
      marcarNotificacaoLida,
      marcarTodasNotificacoesLidas,
      removerNotificacao,
      atualizarIntegracao,
      testarIntegracao,
      criarOrdemServico,
      uploadMapaReferencia,
      entrarNaFila,
      pagarFila,
      recusarFila,
      alterarPapelUsuario,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider');
  return ctx;
}
