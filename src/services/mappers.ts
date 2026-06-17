import type {
  Usuario, Equipe, Membro, Evento, OrdemServico, MapaReferencia,
  EntradaFila, SolicitacaoAdesao, SolicitacaoCriacaoGrupo,
  Notificacao, ConfiguracaoIntegracao,
} from '../types';

// ── API response shapes ────────────────────────────────────────────────────

export interface ApiUser {
  id: number; name: string; email: string; role: string;
  teamId?: number | null; phone?: string | null; company?: string | null;
  active: boolean; pending: boolean; groupCreationRequestId?: number | null;
}

export interface ApiTeam {
  id: number; name: string; regional: string; city: string;
  totalMembers: number; internalRefs: number; externalRefs: number;
  meetings1a1: number; guests: number; education: number; totalBusiness: number;
}

export interface ApiMember {
  id: number; name: string; company: string; specialty: string;
  contact: string; level: string; teamId: number; userId?: number | null;
}

export interface ApiEvent {
  id: number; title: string; date: string; time?: string | null;
  location?: string | null; type: string; teamId: number;
  serviceOrderId?: number | null;
}

export interface ApiServiceOrder {
  id: number; teamId: number; paperType: string; copies?: number | null;
  recurrence: string; dayOfWeek?: string | null; singleDate?: string | null;
  meetingsCount: number; sponsorSlots: number; quotaPrice: string;
  startDate: string; status: string; createdBy: number;
  eventIds?: number[];
}

export interface ApiReferenceMap {
  id: number; teamId: number; serviceOrderId: number; eventId: number;
  fileName: string; uploadDate: string; deliveryDate: string;
  deliveryTime: string; deliveryAddress: string; uploadedBy: number;
}

export interface ApiQueueEntry {
  id: number; serviceOrderId: number; userId: number;
  name: string; company: string; phone: string; position: number;
  status: string; joinedAt: string; expiresAt?: string | null;
}

export interface ApiMembershipRequest {
  id: number; userId: number; teamId: number; phone: string;
  status: string; requestedAt: string;
  user?: ApiUser; team?: ApiTeam;
}

export interface ApiGroupCreationRequest {
  id: number; userId?: number | null;
  requesterName: string; requesterEmail: string; phone: string;
  company: string; groupName: string; regional: string; city: string;
  requestedAt: string; status: string;
}

export interface ApiNotification {
  id: number; type: string; message: string; read: boolean;
  teamId?: number | null; createdAt: string;
}

export interface ApiIntegration {
  id: number; name: string; description: string; url: string;
  apiKey?: string; active: boolean; type: string;
}

// ── Mappers ────────────────────────────────────────────────────────────────

export function mapUser(u: ApiUser): Usuario {
  return {
    id: String(u.id),
    nome: u.name,
    email: u.email,
    papel: u.role as Usuario['papel'],
    equipeId: u.teamId ? String(u.teamId) : undefined,
    telefone: u.phone ?? undefined,
    empresa: u.company ?? undefined,
    ativo: u.active,
    pendente: u.pending,
    solicitacaoCriacaoGrupoId: u.groupCreationRequestId
      ? String(u.groupCreationRequestId)
      : undefined,
  };
}

export function mapTeam(t: ApiTeam): Equipe {
  return {
    id: String(t.id),
    nome: t.name,
    regional: t.regional,
    cidade: t.city,
    gestoresIds: [],
    stats: {
      totalMembros: t.totalMembers,
      referenciasInternas: t.internalRefs,
      referenciasExternas: t.externalRefs,
      reunioes1a1: t.meetings1a1,
      convidados: t.guests,
      educacao: t.education,
      negociosGeradosReais: t.totalBusiness,
    },
    statsUltimoMes: {
      membrosAtivos: 0,
      referenciasInternas: 0,
      referenciasExternas: 0,
      reunioes1a1: 0,
      convidados: 0,
      negociosGeradosReais: 0,
    },
    especialidadesAberto: [],
    patrocinadores: [],
  };
}

export function mapMember(m: ApiMember): Membro {
  return {
    id: String(m.id),
    nome: m.name,
    empresa: m.company,
    especialidade: m.specialty,
    contato: m.contact,
    nivel: m.level,
    equipeId: String(m.teamId),
    usuarioId: m.userId ? String(m.userId) : undefined,
  };
}

export function mapEvent(e: ApiEvent): Evento {
  return {
    id: String(e.id),
    titulo: e.title,
    data: e.date,
    hora: e.time ?? undefined,
    local: e.location ?? undefined,
    tipo: e.type as Evento['tipo'],
    equipeId: String(e.teamId),
    ordemServicoId: e.serviceOrderId ? String(e.serviceOrderId) : undefined,
  };
}

export function mapServiceOrder(o: ApiServiceOrder): OrdemServico {
  return {
    id: String(o.id),
    equipeId: String(o.teamId),
    tipoPapel: o.paperType,
    numeroCopias: o.copies ?? undefined,
    recorrencia: o.recurrence as OrdemServico['recorrencia'],
    diaSemana: o.dayOfWeek as OrdemServico['diaSemana'] | undefined,
    dataUnica: o.singleDate ?? undefined,
    numeroReunioes: o.meetingsCount,
    numeroVagasPatrocinador: o.sponsorSlots,
    precoCota: Number(o.quotaPrice),
    dataInicio: o.startDate,
    status: o.status as OrdemServico['status'],
    eventosGeradosIds: (o.eventIds ?? []).map(String),
    criadoPorId: String(o.createdBy),
    dataCriacao: '',
  };
}

export function mapReferenceMap(r: ApiReferenceMap): MapaReferencia {
  return {
    id: String(r.id),
    equipeId: String(r.teamId),
    ordemServicoId: String(r.serviceOrderId),
    eventoId: String(r.eventId),
    nomeArquivo: r.fileName,
    dataUpload: r.uploadDate,
    dataEntrega: r.deliveryDate,
    horaEntrega: r.deliveryTime,
    enderecoEntrega: r.deliveryAddress,
    uploadPorId: String(r.uploadedBy),
  };
}

export function mapQueueEntry(q: ApiQueueEntry): EntradaFila {
  return {
    id: String(q.id),
    ordemServicoId: String(q.serviceOrderId),
    usuarioId: String(q.userId),
    usuarioNome: q.name,
    empresa: q.company,
    telefone: q.phone,
    posicao: q.position,
    status: q.status as EntradaFila['status'],
    dataEntrada: q.joinedAt,
    dataExpiracao: q.expiresAt ?? undefined,
  };
}

export function mapMembershipRequest(r: ApiMembershipRequest): SolicitacaoAdesao {
  return {
    id: String(r.id),
    usuarioId: String(r.userId),
    usuarioNome: r.user?.name ?? '',
    usuarioEmail: r.user?.email ?? '',
    telefone: r.phone,
    equipeId: String(r.teamId),
    equipeNome: r.team?.name ?? '',
    dataSolicitacao: r.requestedAt,
    status: r.status as SolicitacaoAdesao['status'],
  };
}

export function mapGroupCreationRequest(r: ApiGroupCreationRequest): SolicitacaoCriacaoGrupo {
  return {
    id: String(r.id),
    usuarioId: r.userId ? String(r.userId) : '',
    usuarioNome: r.requesterName,
    usuarioEmail: r.requesterEmail,
    telefone: r.phone,
    empresa: r.company,
    nomeGrupo: r.groupName,
    regional: r.regional,
    cidade: r.city,
    dataSolicitacao: r.requestedAt,
    status: r.status as SolicitacaoCriacaoGrupo['status'],
  };
}

export function mapNotification(n: ApiNotification): Notificacao {
  return {
    id: String(n.id),
    tipo: n.type as Notificacao['tipo'],
    mensagem: n.message,
    lida: n.read,
    timestamp: new Date(n.createdAt).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    }),
    equipeId: n.teamId ? String(n.teamId) : undefined,
  };
}

export function mapIntegration(i: ApiIntegration): ConfiguracaoIntegracao {
  return {
    id: String(i.id),
    nome: i.name,
    descricao: i.description,
    url: i.url,
    chaveApi: i.apiKey ?? '',
    ativa: i.active,
    tipo: i.type as ConfiguracaoIntegracao['tipo'],
  };
}
