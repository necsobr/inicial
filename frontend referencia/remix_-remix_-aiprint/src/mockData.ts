/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Team, PrintAPI, Meeting, PrintOrder, SponsorQueueItem, NotificationItem, PrintConfig, MonthlyOS } from './types';

export const DEFAULT_USERS: User[] = [
  { id: 'usr-1', name: 'Guilherme Admin', email: 'admin@aiprint.com', role: 'admin', team: 'Diretoria' },
  { id: 'usr-2', name: 'Carlos Patrocinador', email: 'patrocinador@aiprint.com', role: 'patrocinador', team: 'Equipe Comunicação Centro' },
  { id: 'usr-3', name: 'Mariana Coordenadora', email: 'coordenador@aiprint.com', role: 'coordenador', team: 'Equipe Comunicação Centro' },
  { id: 'usr-4', name: 'Rodrigo Produção', email: 'producao@aiprint.com', role: 'producao', team: 'Gráfica Central' },
  { id: 'usr-5', name: 'Juliana Trio', email: 'trio@aiprint.com', role: 'trio', team: 'Equipe Comunicação Centro' },
  { id: 'usr-6', name: 'Marcos Trio', email: 'marcos@aiprint.com', role: 'trio', team: 'Equipe Comunicação Centro' },
  { id: 'usr-7', name: 'Fernanda Trio', email: 'fernanda@aiprint.com', role: 'trio', team: 'Equipe Comunicação Centro' }
];

export const INITIAL_TEAMS: Team[] = [
  { id: 'team-1', name: 'Equipe Comunicação Centro', members: ['coordenador@aiprint.com', 'patrocinador@aiprint.com', 'trio@aiprint.com', 'marcos@aiprint.com', 'fernanda@aiprint.com'] },
  { id: 'team-2', name: 'Equipe Distribuição Rápida', members: [] }
];

export const INITIAL_APIS: PrintAPI[] = [
  { id: 'api-1', name: 'PrintMaster Premium API', endpoint: 'https://api.printmaster.com/v3/print', token: 'pm_live_8fa389bcde20a' },
  { id: 'api-2', name: 'FichaPrint Cloud API', endpoint: 'https://cloud.fichaprint.br/api/v1/jobs', token: 'fp_tok_382bc81fa3d' }
];

// Meetings initialized for the current month June 2026.
// In June 2026: Tuesdays and Thursdays (e.g., 2026-06-05, 2026-06-12, 2026-06-19)
export const INITIAL_MEETINGS: Meeting[] = [
  { id: 'meet-1', date: '2026-06-05', description: 'Reunião de Alinhamento de Fichas de Produção', team: 'Equipe Comunicação Centro' },
  { id: 'meet-2', date: '2026-06-12', description: 'Revisão Editorial com Patrocinadores', team: 'Equipe Comunicação Centro' },
  { id: 'meet-3', date: '2026-06-19', description: 'Alinhamento Final da Linha de Produção', team: 'Equipe Comunicação Centro' }
];

export const INITIAL_CONFIG: PrintConfig = {
  defaultCopies: 350,
  paperType: 'Couchê 115g',
  maxSponsors: 5
};

export const INITIAL_MONTHLY_OS: MonthlyOS[] = [
  {
    id: 'os-june-2026',
    month: '2026-06',
    meetingsCount: 3,
    dayOfWeek: 'Sexta-feira',
    dayOfWeekCode: 5,
    totalCopies: 450,
    paperType: '90g',
    costPerCopy: 6.00,
    totalCost: 2700.00,
    team: 'Equipe Comunicação Centro',
    dateCreated: '2026-06-01',
    maxSponsors: 3
  },
  {
    id: 'os-july-2026',
    month: '2026-07',
    meetingsCount: 4,
    dayOfWeek: 'Quarta-feira',
    dayOfWeekCode: 3,
    totalCopies: 600,
    paperType: '90g',
    costPerCopy: 6.00,
    totalCost: 3600.00,
    team: 'Equipe Comunicação Centro',
    dateCreated: '2026-06-05',
    maxSponsors: 4
  }
];

export const INITIAL_SPONSORS_QUEUE: SponsorQueueItem[] = [
  {
    id: 'sp-1',
    sponsorName: 'Carlos Patrocinador',
    sponsorEmail: 'patrocinador@aiprint.com',
    position: 1,
    paperType: 'Couchê 115g',
    copies: 350,
    amount: 525.00,
    status: 'pago',
    date: '2026-06-01',
    team: 'Equipe Comunicação Centro',
    osId: 'os-june-2026'
  },
  {
    id: 'sp-2',
    sponsorName: 'Imobiliária Novo Lar',
    sponsorEmail: 'marketing@novolardf.com.br',
    position: 2,
    paperType: 'Couchê 115g',
    copies: 350,
    amount: 525.00,
    status: 'aprovado',
    date: '2026-06-02',
    team: 'Equipe Comunicação Centro',
    osId: 'os-june-2026'
  },
  {
    id: 'sp-3',
    sponsorName: 'Supermercados Sul',
    sponsorEmail: 'patrocinio@supersul.com.br',
    position: 3,
    paperType: 'Couchê 115g',
    copies: 350,
    amount: 525.00,
    status: 'pendente',
    date: '2026-06-03',
    team: 'Equipe Comunicação Centro',
    osId: 'os-june-2026'
  },
  {
    id: 'sp-4',
    sponsorName: 'Carlos Patrocinador',
    sponsorEmail: 'patrocinador@aiprint.com',
    position: 1,
    paperType: '90g',
    copies: 150,
    amount: 900.00,
    status: 'pendente',
    date: '2026-06-05',
    team: 'Equipe Comunicação Centro',
    osId: 'os-july-2026'
  }
];

export const INITIAL_ORDERS: PrintOrder[] = [
  {
    id: 'ord-1',
    filename: 'Ficha_Producao_Centro_Historico.pdf',
    paperType: 'Couchê 115g',
    copies: 350,
    sentBy: 'coordenador@aiprint.com',
    date: '2026-06-01 10:30',
    status: 'entregue',
    progress: 100,
    team: 'Equipe Comunicação Centro'
  },
  {
    id: 'ord-2',
    filename: 'Ficha_Referencia_Zona_Sul_v2.pdf',
    paperType: 'Couchê 115g',
    copies: 350,
    sentBy: 'coordenador@aiprint.com',
    date: '2026-06-03 14:15',
    status: 'em impressão',
    progress: 45,
    team: 'Equipe Comunicação Centro'
  },
  {
    id: 'ord-3',
    filename: 'Ficha_Alinhamento_Metropolitano.pdf',
    paperType: 'Offset 75g',
    copies: 500,
    sentBy: 'coordenador@aiprint.com',
    date: '2026-06-03 18:00',
    status: 'aguardando',
    progress: 0,
    team: 'Equipe Comunicação Centro'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'not-1',
    type: 'member',
    message: 'Carlos Patrocinador entrou na equipe Parceiro Ouro.',
    timestamp: 'Hoje, 10:24',
    read: false
  },
  {
    id: 'not-2',
    type: 'sponsor',
    message: 'Novo patrocinador "Supermercados Sul" solicitou inscrição na fila.',
    timestamp: 'Hoje, 15:40',
    read: false
  },
  {
    id: 'not-3',
    type: 'delivery',
    message: 'Pedido "Ficha_Producao_Centro_Historico.pdf" foi marcado como ENTREGUE.',
    timestamp: 'Ontem, 18:15',
    read: true
  },
  {
    id: 'not-4',
    type: 'system',
    message: 'Configuração de papel alterada para Couchê 115g por Mariana Coordenadora.',
    timestamp: 'Ontem, 09:30',
    read: true
  }
];

// Helper functions to manage LocalStorage
export const getStored = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(`aiprint_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

export const setStored = <T>(key: string, value: T): void => {
  localStorage.setItem(`aiprint_${key}`, JSON.stringify(value));
};

export const initLocalStorage = (): void => {
  if (!localStorage.getItem('aiprint_initialized') || !localStorage.getItem('aiprint_monthly_os')) {
    setStored('users', DEFAULT_USERS);
    setStored('teams', INITIAL_TEAMS);
    setStored('apis', INITIAL_APIS);
    setStored('meetings', INITIAL_MEETINGS);
    setStored('config', INITIAL_CONFIG);
    setStored('sponsors_queue', INITIAL_SPONSORS_QUEUE);
    setStored('orders', INITIAL_ORDERS);
    setStored('notifications', INITIAL_NOTIFICATIONS);
    setStored('monthly_os', INITIAL_MONTHLY_OS);
    localStorage.setItem('aiprint_initialized', 'true');
  }
};
