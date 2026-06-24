import { api } from './api';
import {
  mapTeam, mapMember, mapEvent, mapServiceOrder, mapReferenceMap,
  mapQueueEntry, mapMembershipRequest, mapGroupCreationRequest,
  mapNotification, mapIntegration, mapUser, mapPrintRequest, mapSponsorshipRequest,
  type ApiTeam, type ApiMember, type ApiEvent, type ApiServiceOrder,
  type ApiReferenceMap, type ApiQueueEntry, type ApiMembershipRequest,
  type ApiGroupCreationRequest, type ApiNotification, type ApiIntegration,
  type ApiUser, type ApiPrintRequest, type ApiSponsorshipRequest,
} from './mappers';
import type {
  Equipe, Membro, Evento, OrdemServico, MapaReferencia,
  EntradaFila, SolicitacaoAdesao, SolicitacaoCriacaoGrupo,
  Notificacao, ConfiguracaoIntegracao, Usuario, UserRole,
  RequisicaoImpressao, SolicitacaoPatrocinio, TemplateMensagem,
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
      team_id:        Number(dados.equipeId),
      name:           dados.nome ?? null,
      paper_type:     dados.tipoPapel,
      copies:         dados.numeroCopias,
      recurrence:     dados.recorrencia,
      day_of_week:    dados.diaSemana,
      single_date:    dados.dataUnica,
      meetings_count: dados.numeroReunioes,
      sponsor_slots:  dados.numeroVagasPatrocinador,
      start_date:     dados.dataInicio,
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

  async atualizarStatus(id: string, status: string): Promise<MapaReferencia> {
    const res = await api.put<SingleResponse<ApiReferenceMap>>(`/reference-maps/${id}`, { status });
    return mapReferenceMap(res.data);
  },

  async criar(dados: Omit<MapaReferencia, 'id'>, arquivo?: File): Promise<MapaReferencia> {
    const form = new FormData();
    form.append('team_id',          String(Number(dados.equipeId)));
    form.append('service_order_id', String(Number(dados.ordemServicoId)));
    form.append('event_id',         String(Number(dados.eventoId)));
    form.append('delivery_date',    dados.dataEntrega);
    form.append('delivery_time',    dados.horaEntrega);
    if (dados.enderecoEntrega) form.append('delivery_address', dados.enderecoEntrega);
    if (arquivo) {
      form.append('file', arquivo);
    } else {
      form.append('file_name', dados.nomeArquivo);
    }
    const res = await api.upload<SingleResponse<ApiReferenceMap>>('/reference-maps', form);
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

  async criar(equipeId: string): Promise<SolicitacaoAdesao> {
    const res = await api.post<SingleResponse<ApiMembershipRequest>>('/membership-requests', { team_id: Number(equipeId) });
    return mapMembershipRequest(res.data);
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
      name:          dados.nome,
      description:   dados.descricao,
      url:           dados.url,
      api_key:       dados.chaveApi,
      instance_name: dados.instancia,
      active:        dados.ativa,
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

  async obterQrCode(id: string): Promise<{ success: boolean; connected?: boolean; qrcode?: string; pairingCode?: string; message?: string }> {
    const res = await api.get<{ success: boolean; connected?: boolean; qrcode?: string; pairingCode?: string; message?: string }>(`/integrations/${id}/qrcode`);
    return res;
  },

  async verificarConexao(id: string): Promise<{ success: boolean; connected: boolean; state?: string }> {
    const res = await api.get<{ success: boolean; connected: boolean; state?: string }>(`/integrations/${id}/connection-state`);
    return res;
  },

  async obterCodigoPareamento(id: string, phone: string): Promise<{ success: boolean; connected?: boolean; pairingCode?: string; message?: string }> {
    const res = await api.post<{ success: boolean; connected?: boolean; pairingCode?: string; message?: string }>(`/integrations/${id}/pairing-code`, { phone });
    return res;
  },

  async enviarMensagemTeste(id: string, phone: string, message: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post<{ success: boolean; message: string }>(`/integrations/${id}/send-test`, { phone, message });
    return res;
  },
};

// ── Templates de Mensagens ────────────────────────────────────────────────

interface ApiTemplate {
  id: number; key: string; name: string; description: string | null; body: string;
}

function mapTemplate(t: ApiTemplate): TemplateMensagem {
  return { id: String(t.id), key: t.key, name: t.name, description: t.description, body: t.body };
}

export const templateService = {
  async listar(): Promise<TemplateMensagem[]> {
    const res = await api.get<ListResponse<ApiTemplate>>('/message-templates');
    return res.data.map(mapTemplate);
  },

  async atualizar(id: string, body: string): Promise<TemplateMensagem> {
    const res = await api.put<SingleResponse<ApiTemplate>>(`/message-templates/${id}`, { body });
    return mapTemplate(res.data);
  },
};

// ── Usuários ──────────────────────────────────────────────────────────────

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    const res = await api.get<ListResponse<ApiUser>>('/users');
    return res.data.map(mapUser);
  },

  async atualizar(id: string, dados: { papel?: string; equipeId?: string | null; ativo?: boolean }): Promise<Usuario> {
    const res = await api.put<SingleResponse<ApiUser>>(`/users/${id}`, {
      role:    dados.papel,
      team_id: dados.equipeId ? Number(dados.equipeId) : dados.equipeId === null ? null : undefined,
      active:  dados.ativo,
    });
    return mapUser(res.data);
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

// ── Requisições de Impressão ──────────────────────────────────────────────

export const printRequestService = {
  async listar(): Promise<RequisicaoImpressao[]> {
    const res = await api.get<ListResponse<ApiPrintRequest>>('/print-requests');
    return res.data.map(mapPrintRequest);
  },

  async atualizarStatus(id: string, status: string): Promise<RequisicaoImpressao> {
    const res = await api.put<SingleResponse<ApiPrintRequest>>(`/print-requests/${id}`, { status });
    return mapPrintRequest(res.data);
  },
};

// ── Solicitações de Patrocínio ────────────────────────────────────────────

export const sponsorshipService = {
  async listar(): Promise<SolicitacaoPatrocinio[]> {
    const res = await api.get<ListResponse<ApiSponsorshipRequest>>('/sponsorship-requests');
    return res.data.map(mapSponsorshipRequest);
  },

  async criar(dados: { empresa: string; equipeId: string; semana: string; valor: number; email: string; nome: string }): Promise<SolicitacaoPatrocinio> {
    const res = await api.post<SingleResponse<ApiSponsorshipRequest>>('/sponsorship-requests', {
      company:         dados.empresa,
      team_id:         Number(dados.equipeId),
      week:            dados.semana,
      amount:          dados.valor,
      applicant_email: dados.email,
      applicant_name:  dados.nome,
      requested_at:    new Date().toISOString().slice(0, 10),
    });
    return mapSponsorshipRequest(res.data);
  },

  async atualizarStatus(id: string, status: string): Promise<SolicitacaoPatrocinio> {
    const res = await api.put<SingleResponse<ApiSponsorshipRequest>>(`/sponsorship-requests/${id}`, { status });
    return mapSponsorshipRequest(res.data);
  },
};

// ── Carregar tudo de uma vez ───────────────────────────────────────────────

export async function carregarDadosIniciais() {
  const [
    equipes, usuarios, membros, eventos, ordensServico,
    mapaReferencia, filasOS, solicitacoesAdesao,
    notificacoesTrio, requisicoes, solicitacoes,
  ] = await Promise.allSettled([
    equipeService.listar(),
    usuarioService.listar(),
    membroService.listar(),
    eventoService.listar(),
    ordemServicoService.listar(),
    mapaReferenciaService.listar(),
    filaService.listar(),
    adesaoService.listar(),
    notificacaoService.listar(),
    printRequestService.listar(),
    sponsorshipService.listar(),
  ]);

  return {
    equipes:            equipes.status === 'fulfilled'            ? equipes.value            : [],
    usuarios:           usuarios.status === 'fulfilled'           ? usuarios.value           : [],
    membros:            membros.status === 'fulfilled'            ? membros.value            : [],
    eventos:            eventos.status === 'fulfilled'            ? eventos.value            : [],
    ordensServico:      ordensServico.status === 'fulfilled'      ? ordensServico.value      : [],
    mapaReferencia:     mapaReferencia.status === 'fulfilled'     ? mapaReferencia.value     : [],
    filasOS:            filasOS.status === 'fulfilled'            ? filasOS.value            : [],
    solicitacoesAdesao: solicitacoesAdesao.status === 'fulfilled' ? solicitacoesAdesao.value : [],
    notificacoesTrio:   notificacoesTrio.status === 'fulfilled'   ? notificacoesTrio.value   : [],
    requisicoes:        requisicoes.status === 'fulfilled'        ? requisicoes.value        : [],
    solicitacoes:       solicitacoes.status === 'fulfilled'       ? solicitacoes.value       : [],
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
