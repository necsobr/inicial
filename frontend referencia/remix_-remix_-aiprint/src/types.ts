/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'patrocinador' | 'coordenador' | 'producao' | 'trio';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
  password?: string;
  pendingTeamRequest?: string;
  phone?: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[]; // array of user emails or IDs
}

export interface PrintAPI {
  id: string;
  name: string;
  endpoint: string;
  token: string;
}

export interface Meeting {
  id: string;
  date: string; // YYYY-MM-DD
  description?: string;
  team?: string; // Associated team/group name
  osId?: string; // Link to Monthly OS
  paperType?: string; // e.g. "90g"
  copies?: number; // copies count
  costPerCopy?: number; // e.g. 6.00
}

export interface MonthlyOS {
  id: string;
  month: string; // YYYY-MM
  osName?: string; // Optional custom name/label for the OS
  meetingsCount: number;
  dayOfWeek: string; // "Segunda-feira", etc.
  dayOfWeekCode: number; // 0-6
  totalCopies: number;
  paperType: string; // "90g"
  costPerCopy: number; // 6.00
  totalCost: number;
  team: string;
  dateCreated: string;
  maxSponsors?: number;
}

export interface PrintOrder {
  id: string;
  filename: string;
  paperType: string;
  copies: number;
  sentBy: string; // email of coordinator
  date: string; // YYYY-MM-DD HH:MM
  status: 'aguardando' | 'em impressão' | 'entregue';
  progress: number; // 0 to 100
  team?: string; // Associated team/group name
  deadlineMeetingId?: string; // Associated target meeting ID
  deadlineDate?: string; // Target meeting date representing the deadline
  deliveryDate?: string; // Target delivery date
  deliveryTime?: string; // Target delivery time
}

export interface SponsorQueueItem {
  id: string;
  sponsorName: string;
  sponsorEmail: string;
  position: number;
  paperType: string;
  copies: number;
  amount: number;
  status: 'pendente' | 'aprovado' | 'recusado' | 'pago';
  date: string;
  team?: string; // Associated team/group name
  osId?: string; // Linked Monthly OS ID
  timerDeadline?: string; // ISO string 2 days deadline
  hasNotifiedTimer?: boolean; // Avoid duplicate notifications
}

export interface NotificationItem {
  id: string;
  type: 'member' | 'sponsor' | 'delivery' | 'system';
  message: string;
  timestamp: string; // HH:MM or date
  read: boolean;
}

export interface PrintConfig {
  defaultCopies: number;
  paperType: string;
  maxSponsors: number;
}
