import { api } from './api';
import {
  mapTeam, mapMember, mapEvent, mapServiceOrder, mapReferenceMap,
  mapQueueEntry, mapMembershipRequest, mapGroupCreationRequest,
  mapNotification, mapIntegration, mapUser,
  type ApiTeam, type ApiMember, type ApiEvent, type ApiServiceOrder,
  type ApiReferenceMap, type ApiQueueEntry, type ApiMembershipRequest,
  type ApiGroupCreationRequest, type ApiNotification, type ApiIntegration,
  type ApiUser,
} from './mappers';
import type {
  Equipe, Membro, Evento, OrdemServico, MapaReferencia,
  EntradaFila, SolicitacaoAdesao, SolicitacaoCriacaoGrupo,
  Notificacao, ConfiguracaoIntegracao, Usuario, UserRole,
} from '../types';

interface ListResponse<T> { data: T[] }
interface SingleResponse<T> { data: T }

// ── Equipes ────────────────────────────────────────────────────────────────

export const equipeService = {
  async listar(): Promise<Equipe[]> {
    const res = await api.get<ListResponse<ApiTeam>>('/teams');
    return res.data.map(mapTeam);
  },

  async minhaEquipe(): Promise<Equipe | null> {
    try {
      const res = await api.get<SingleResponse<ApiTeam>>('/my-team');
      return mapTeam(res.data);
    } catch {
      return null;
    }
  },

  async criar(dados: { nome: string; regional: string; cidade: string }): Promise<Equipe> {
    const res = await api.post<SingleResponse<ApiTeam>>('/teams', {
      name: dados.nome, regional: dados.regional, city: dados.cidade,
    });
    return mapTeam(res.data);
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },
};

// ── Membros ────────────────────────────────────────────────────────────────

export const membroService = {
  async listar(): Promise<Membro[]> {
    const res = await api.get<ListResponse<ApiMember>>('/members');
    return res.data.map(mapMember);
  },
};

// ── Eventos ────────────────────────────────────────────────────────────────

export const eventoService = {
  async listar(): Promise<Evento[]> {
    const res = await api.get<ListResponse<ApiEvent>>('/events');
    return res.data.map(mapEvent);
  },
};

// ── Ordens de Serviço ──────────────────────────────────────────────────────

export const ordemServicoService = {
  async listar(): Promise<OrdemServico[]> {
    const res = await api.get<ListResponse<ApiServiceOrder>>('/service-orders');
    return res.data.map(mapServiceOrder);
  },

  async criar(dados: Partial<OrdemServico>): Promise<OrdemServico> {
    const res = await api.post<SingleResponse<ApiServiceOrder>>('/service-orders', {
      paper_type:    dados.tipoPapel,
      copies:        dados.numeroCopias,
      recurrence:    dados.recorrencia,
      day_of_week:   dados.diaSemana,
      single_date:   dados.dataUnica,
      meetings_count: dados.numeroReunioes,
      sponsor_slots: dados.numeroVagasPatrocinador,
      start_date:    dados.dataInicio,
    });
    return mapServiceOrder(res.data);
  },
};

// ── Mapas de Referência ────────────────────────────────────────────────────

export const mapaReferenciaService = {
  async listar(): Promise<MapaReferencia[]> {
    const res = await api.get<ListResponse<ApiReferenceMap>>('/reference-maps');
    return res.data.map(mapReferenceMap);
  },

  async criar(dados: Omit<MapaReferencia, 'id'>): Promise<MapaReferencia> {
    const res = await api.post<SingleResponse<ApiReferenceMap>>('/reference-maps', {
      service_order_id: Number(dados.ordemServicoId),
      event_id:         Number(dados.eventoId),
      file_name:        dados.nomeArquivo,
      delivery_date:    dados.dataEntrega,
      delivery_time:    dados.horaEntrega,
      delivery_address: dados.enderecoEntrega,
    });
    return mapReferenceMap(res.data);
  },
};

// ── Filas de OS ────────────────────────────────────────────────────────────

export const filaService = {
  async listar(): Promise<EntradaFila[]> {
    const res = await api.get<ListResponse<ApiQueueEntry>>('/queue-entries');
    return res.data.map(mapQueueEntry);
  },

  async entrar(ordemServicoId: string): Promise<EntradaFila> {
    const res = await api.post<SingleResponse<ApiQueueEntry>>('/queue-entries', {
      service_order_id: Number(ordemServicoId),
    });
    return mapQueueEntry(res.data);
  },

  async pagar(id: string): Promise<EntradaFila> {
    const res = await api.post<SingleResponse<ApiQueueEntry>>(`/queue-entries/${id}/pay`);
    return mapQueueEntry(res.data);
  },

  async recusar(id: string): Promise<EntradaFila> {
    const res = await api.post<SingleResponse<ApiQueueEntry>>(`/queue-entries/${id}/decline`);
    return mapQueueEntry(res.data);
  },
};

// ── Solicitações de Adesão ─────────────────────────────────────────────────

export const adesaoService = {
  async listar(): Promise<SolicitacaoAdesao[]> {
    const res = await api.get<ListResponse<ApiMembershipRequest>>('/membership-requests');
    return res.data.map(mapMembershipRequest);
  },

  async aceitar(id: string): Promise<void> {
    await api.post(`/membership-requests/${id}/accept`);
  },

  async rejeitar(id: string): Promise<void> {
    await api.post(`/membership-requests/${id}/reject`);
  },
};

// ── Solicitações de Criação de Grupo ──────────────────────────────────────

export const criacaoGrupoService = {
  async listar(): Promise<SolicitacaoCriacaoGrupo[]> {
    const res = await api.get<ListResponse<ApiGroupCreationRequest>>('/group-creation-requests');
    return res.data.map(mapGroupCreationRequest);
  },

  async aprovar(id: string): Promise<{ equipe: Equipe; usuario: Usuario }> {
    const res = await api.post<{ data: { team: ApiTeam; user: ApiUser } }>(
      `/group-creation-requests/${id}/approve`
    );
    return { equipe: mapTeam(res.data.team), usuario: mapUser(res.data.user) };
  },

  async rejeitar(id: string): Promise<void> {
    await api.post(`/group-creation-requests/${id}/reject`);
  },
};

// ── Notificações ──────────────────────────────────────────────────────────

export const notificacaoService = {
  async listar(): Promise<Notificacao[]> {
    const res = await api.get<ListResponse<ApiNotification>>('/notifications');
    return res.data.map(mapNotification);
  },

  async marcarLida(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  async marcarTodasLidas(): Promise<void> {
    await api.post('/notifications/read-all');
  },

  async remover(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};

// ── Integrações ───────────────────────────────────────────────────────────

export const integracaoService = {
  async listar(): Promise<ConfiguracaoIntegracao[]> {
    const res = await api.get<ListResponse<ApiIntegration>>('/integrations');
    return res.data.map(mapIntegration);
  },

  async atualizar(id: string, dados: Partial<ConfiguracaoIntegracao>): Promise<ConfiguracaoIntegracao> {
    const res = await api.put<SingleResponse<ApiIntegration>>(`/integrations/${id}`, {
      name:        dados.nome,
      description: dados.descricao,
      url:         dados.url,
      api_key:     dados.chaveApi,
      active:      dados.ativa,
    });
    return mapIntegration(res.data);
  },

  async testar(id: string): Promise<boolean> {
    try {
      await api.post(`/integrations/${id}/test`);
      return true;
    } catch {
      return false;
    }
  },
};

// ── Carregar tudo de uma vez ───────────────────────────────────────────────

export async function carregarDadosIniciais() {
  const [
    equipes, membros, eventos, ordensServico,
    mapaReferencia, filasOS, solicitacoesAdesao,
    notificacoesTrio,
  ] = await Promise.allSettled([
    equipeService.listar(),
    membroService.listar(),
    eventoService.listar(),
    ordemServicoService.listar(),
    mapaReferenciaService.listar(),
    filaService.listar(),
    adesaoService.listar(),
    notificacaoService.listar(),
  ]);

  return {
    equipes:           equipes.status === 'fulfilled'          ? equipes.value          : [],
    membros:           membros.status === 'fulfilled'          ? membros.value          : [],
    eventos:           eventos.status === 'fulfilled'          ? eventos.value          : [],
    ordensServico:     ordensServico.status === 'fulfilled'    ? ordensServico.value    : [],
    mapaReferencia:    mapaReferencia.status === 'fulfilled'   ? mapaReferencia.value   : [],
    filasOS:           filasOS.status === 'fulfilled'          ? filasOS.value          : [],
    solicitacoesAdesao: solicitacoesAdesao.status === 'fulfilled' ? solicitacoesAdesao.value : [],
    notificacoesTrio:  notificacoesTrio.status === 'fulfilled' ? notificacoesTrio.value : [],
  };
}

// Carrega solicitações de criação de grupo (apenas admin)
export async function carregarSolicitacoesCriacaoGrupo(role: UserRole): Promise<SolicitacaoCriacaoGrupo[]> {
  if (role !== 'admin') return [];
  try {
    return await criacaoGrupoService.listar();
  } catch {
    return [];
  }
}
