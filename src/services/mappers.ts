import type {
  Usuario, Equipe, Membro, Evento, OrdemServico, MapaReferencia,
  EntradaFila, SolicitacaoAdesao, SolicitacaoCriacaoGrupo,
  Notificacao, ConfiguracaoIntegracao, RequisicaoImpressao, SolicitacaoPatrocinio,
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
  id: number; teamId: number; name?: string | null; paperType: string; copies?: number | null;
  recurrence: string; dayOfWeek?: string | null; singleDate?: string | null;
  meetingsCount: number; sponsorSlots: number; quotaPrice: string;
  startDate: string; status: string; createdBy: number;
  eventIds?: number[];
}

export interface ApiReferenceMap {
  id: number; teamId: number; serviceOrderId: number; eventId: number;
  fileName: string; fileUrl?: string | null; uploadDate: string; deliveryDate: string;
  deliveryTime: string; deliveryAddress: string; status: string; uploadedBy: number;
}

export interface ApiQueueEntry {
  id: number; serviceOrderId: number; userId: number;
  name: string; company: string; phone: string; position: number;
  status: string; joinedAt: string; expiresAt?: string | null;
  billingType?: string | null;
  asaasPaymentId?: string | null;
  asaasPaymentStatus?: string | null;
  asaasBankSlipUrl?: string | null;
  asaasInvoiceUrl?: string | null;
  asaasPixQrcode?: string | null;
  asaasPixCopyPaste?: string | null;
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
  apiKey?: string; instanceName?: string; active: boolean; type: string;
  autoMessages?: { boasVindas?: string; notificacaoEvento?: string; confirmacaoPagamento?: string } | null;
  config?: { padrao?: string; mapeamento_papel?: Record<string, string>; impressoras?: { chave: string; nome: string; descricao: string; ip: string; cups_nome?: string }[] } | null;
}

export interface ApiPrintRequest {
  id: number; teamId: number; requesterEmail: string; requesterName: string;
  quantity: number; eventDate?: string | null; notes?: string | null;
  status: string; team?: ApiTeam; createdAt?: string | null;
}

export interface ApiSponsorshipRequest {
  id: number; company: string; teamId: number; week: string;
  amount: number; status: string; applicantEmail: string; applicantName: string;
  requestedAt?: string | null; team?: ApiTeam; createdAt?: string | null;
  billingType?: string | null;
  asaasPaymentId?: string | null;
  asaasPaymentStatus?: string | null;
  asaasBankSlipUrl?: string | null;
  asaasInvoiceUrl?: string | null;
  asaasPixQrcode?: string | null;
  asaasPixCopyPaste?: string | null;
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
    nome: o.name ?? undefined,
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
    fileUrl: r.fileUrl ?? undefined,
    dataUpload: r.uploadDate,
    dataEntrega: r.deliveryDate,
    horaEntrega: r.deliveryTime,
    enderecoEntrega: r.deliveryAddress,
    status: (r.status ?? 'recebido') as import('../types').StatusMapaReferencia,
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
    billingType: (q.billingType as EntradaFila['billingType']) ?? undefined,
    asaasPaymentId: q.asaasPaymentId ?? undefined,
    asaasPaymentStatus: q.asaasPaymentStatus ?? undefined,
    asaasBankSlipUrl: q.asaasBankSlipUrl ?? undefined,
    asaasInvoiceUrl: q.asaasInvoiceUrl ?? undefined,
    asaasPixQrcode: q.asaasPixQrcode ?? undefined,
    asaasPixCopyPaste: q.asaasPixCopyPaste ?? undefined,
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
    instancia: i.instanceName ?? '',
    ativa: i.active,
    tipo: i.type as ConfiguracaoIntegracao['tipo'],
    mensagensAutomaticas: i.autoMessages ?? undefined,
    config: i.config ? {
      padrao:          i.config.padrao,
      mapeamentoPapel: i.config.mapeamento_papel,
      impressoras:     i.config.impressoras?.map(p => ({
        chave:    p.chave,
        nome:     p.nome,
        descricao: p.descricao,
        ip:       p.ip,
        cupsNome: p.cups_nome,
      })),
    } : undefined,
  };
}

export function mapPrintRequest(r: ApiPrintRequest): RequisicaoImpressao {
  return {
    id: String(r.id),
    equipeId: String(r.teamId),
    equipeNome: r.team?.name ?? '',
    solicitanteEmail: r.requesterEmail,
    solicitanteNome: r.requesterName,
    quantidade: r.quantity,
    dataEvento: r.eventDate ?? '',
    observacoes: r.notes ?? '',
    status: r.status as RequisicaoImpressao['status'],
    dataCriacao: r.createdAt ?? '',
  };
}

export function mapSponsorshipRequest(s: ApiSponsorshipRequest): SolicitacaoPatrocinio {
  return {
    id: String(s.id),
    empresa: s.company,
    equipeId: String(s.teamId),
    equipeNome: s.team?.name ?? '',
    semana: s.week,
    valor: s.amount,
    status: s.status as SolicitacaoPatrocinio['status'],
    patrocinadorEmail: s.applicantEmail,
    patrocinadorNome: s.applicantName,
    dataSolicitacao: s.requestedAt ?? '',
    billingType: (s.billingType as SolicitacaoPatrocinio['billingType']) ?? undefined,
    asaasPaymentId: s.asaasPaymentId ?? undefined,
    asaasPaymentStatus: s.asaasPaymentStatus ?? undefined,
    asaasBankSlipUrl: s.asaasBankSlipUrl ?? undefined,
    asaasInvoiceUrl: s.asaasInvoiceUrl ?? undefined,
    asaasPixQrcode: s.asaasPixQrcode ?? undefined,
    asaasPixCopyPaste: s.asaasPixCopyPaste ?? undefined,
  };
}
