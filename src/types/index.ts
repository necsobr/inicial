export type UserRole = 'admin' | 'coordenador' | 'trio' | 'membro' | 'producao';
export type StatusImpressao = 'recebido' | 'em_producao' | 'pronto' | 'entregue';
export type StatusPatrocinio = 'aguardando_aprovacao' | 'aprovada' | 'recusada' | 'concluida';
export type TipoNotificacao = 'membro' | 'patrocinador' | 'entrega' | 'sistema';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  equipeId?: string;
  telefone?: string;
  ativo: boolean;
}

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  mensagem: string;
  timestamp: string;
  lida: boolean;
}

export interface Membro {
  id: string;
  nome: string;
  empresa: string;
  especialidade: string;
  contato: string;
  nivel: string;
  equipeId: string;
}

export interface Evento {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  local?: string;
  tipo: 'reuniao' | 'social' | 'aniversario' | 'outro';
  equipeId: string;
}

export interface Palestrante {
  id: string;
  nome: string;
  data: string;
  equipeId: string;
}

export interface EstatisticasEquipe {
  totalMembros: number;
  referenciasInternas: number;
  referenciasExternas: number;
  reunioes1a1: number;
  convidados: number;
  educacao: number;
  negociosGeradosReais: number;
}

export interface EstatisticasUltimoMes {
  membrosAtivos: number;
  referenciasInternas: number;
  referenciasExternas: number;
  reunioes1a1: number;
  convidados: number;
  negociosGeradosReais: number;
}

export interface PatrocinadorAtivo {
  id: string;
  nome: string;
  equipeId: string;
}

export interface Equipe {
  id: string;
  nome: string;
  regional: string;
  cidade: string;
  gestoresIds: string[];
  stats: EstatisticasEquipe;
  statsUltimoMes: EstatisticasUltimoMes;
  especialidadesAberto: string[];
  patrocinadores: PatrocinadorAtivo[];
}

export interface SolicitacaoPatrocinio {
  id: string;
  empresa: string;
  equipeId: string;
  equipeNome: string;
  semana: string;
  valor: number;
  status: StatusPatrocinio;
  patrocinadorEmail: string;
  patrocinadorNome: string;
  dataSolicitacao: string;
}

export interface RequisicaoImpressao {
  id: string;
  equipeId: string;
  equipeNome: string;
  solicitanteEmail: string;
  solicitanteNome: string;
  quantidade: number;
  dataEvento: string;
  observacoes: string;
  status: StatusImpressao;
  dataCriacao: string;
}

export interface ConfiguracaoIntegracao {
  id: string;
  nome: string;
  descricao: string;
  url: string;
  chaveApi: string;
  ativa: boolean;
}
