export type UserRole = 'admin' | 'coordenador' | 'trio' | 'membro' | 'producao';
export type StatusImpressao = 'recebido' | 'em_producao' | 'pronto' | 'entregue';
export type StatusPatrocinio = 'aguardando_aprovacao' | 'aprovada' | 'recusada' | 'concluida';
export type TipoNotificacao = 'membro' | 'patrocinador' | 'entrega' | 'sistema' | 'atraso' | 'cargo';
export type TipoRecorrenciaOS = 'semanal' | 'unica';
export type DiaSemana = 'domingo' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado';
export type StatusOS = 'ativa' | 'encerrada' | 'cancelada';
export type StatusEntradaFila = 'aguardando' | 'confirmado' | 'recusado' | 'pago' | 'expirado';
export type StatusMapaReferencia = 'recebido' | 'em_producao' | 'pronto' | 'entregue';
export type StatusAdesao = 'pendente' | 'aceita' | 'recusada';
export type StatusCriacaoGrupo = 'pendente' | 'aprovada' | 'recusada';
export type TipoIntegracao = 'impressao' | 'whatsapp' | 'pagamento';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  equipeId?: string;
  telefone?: string;
  empresa?: string;
  ativo: boolean;
  pendente?: boolean;
  solicitacaoCriacaoGrupoId?: string;
}

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  mensagem: string;
  timestamp: string;
  lida: boolean;
  equipeId?: string;
}

export interface Membro {
  id: string;
  nome: string;
  empresa: string;
  especialidade: string;
  contato: string;
  nivel: string;
  equipeId: string;
  usuarioId?: string;
}

export interface Evento {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  local?: string;
  tipo: 'reuniao' | 'social' | 'aniversario' | 'outro';
  equipeId: string;
  ordemServicoId?: string;
}

export interface OrdemServico {
  id: string;
  equipeId: string;
  nome?: string;
  tipoPapel: string;
  numeroCopias?: number;
  recorrencia: TipoRecorrenciaOS;
  diaSemana?: DiaSemana;
  dataUnica?: string;
  numeroReunioes: number;
  numeroVagasPatrocinador: number;
  precoCota: number;
  dataInicio: string;
  status: StatusOS;
  eventosGeradosIds: string[];
  criadoPorId: string;
  dataCriacao: string;
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
  instancia: string;
  ativa: boolean;
  tipo: TipoIntegracao;
}

export interface SolicitacaoAdesao {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  telefone: string;
  equipeId: string;
  equipeNome: string;
  dataSolicitacao: string;
  status: StatusAdesao;
}

export interface MapaReferencia {
  id: string;
  equipeId: string;
  ordemServicoId: string;
  eventoId: string;
  nomeArquivo: string;
  fileUrl?: string;
  dataUpload: string;
  dataEntrega: string;
  horaEntrega: string;
  enderecoEntrega: string;
  status: StatusMapaReferencia;
  uploadPorId: string;
}

export interface EntradaFila {
  id: string;
  ordemServicoId: string;
  usuarioId: string;
  usuarioNome: string;
  empresa: string;
  telefone: string;
  posicao: number;
  status: StatusEntradaFila;
  dataEntrada: string;
  dataExpiracao?: string;
}

export interface TemplateMensagem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  body: string;
}

export interface SolicitacaoCriacaoGrupo {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  telefone: string;
  empresa: string;
  nomeGrupo: string;
  regional: string;
  cidade: string;
  dataSolicitacao: string;
  status: StatusCriacaoGrupo;
}
