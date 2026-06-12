/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Calendar, Printer, Users, Upload, CheckCircle, ChevronRight, Check, X, 
  Trash2, Plus, UsersRound, FilePlus, HelpCircle, AlertCircle, Sparkles, UserCheck, Lock
} from 'lucide-react';
import { Meeting, PrintConfig, SponsorQueueItem, PrintOrder, User, Team, NotificationItem, MonthlyOS } from '../types';

interface CoordinatorDashboardProps {
  meetings: Meeting[];
  onUpdateMeetings: (meetings: Meeting[]) => void;
  printConfig: PrintConfig;
  onUpdatePrintConfig: (config: PrintConfig) => void;
  sponsorsQueue: SponsorQueueItem[];
  onUpdateSponsorsQueue: (queue: SponsorQueueItem[]) => void;
  orders: PrintOrder[];
  onUpdateOrders: (orders: PrintOrder[]) => void;
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  currentUser: User | null;
  teams: Team[];
  onUpdateTeams: (teams: Team[]) => void;
  notifications: NotificationItem[];
  onUpdateNotifications: (notifications: NotificationItem[]) => void;
  monthlyOS: MonthlyOS[];
  onUpdateMonthlyOS: (list: MonthlyOS[]) => void;
}

export default function CoordinatorDashboard({
  meetings,
  onUpdateMeetings,
  printConfig,
  onUpdatePrintConfig,
  sponsorsQueue,
  onUpdateSponsorsQueue,
  orders,
  onUpdateOrders,
  users,
  onUpdateUsers,
  currentUser,
  teams,
  onUpdateTeams,
  notifications,
  onUpdateNotifications,
  monthlyOS = [],
  onUpdateMonthlyOS
}: CoordinatorDashboardProps) {

  const [activeTab, setActiveTab] = useState<'meetings' | 'print' | 'sponsors' | 'team'>('meetings');
  
  // O.S. creation states
  const [osGenerationType, setOsGenerationType] = useState<'automatico' | 'unica'>('automatico');
  const [osSingleMeetingDate, setOsSingleMeetingDate] = useState('');
  const [osMonth, setOsMonth] = useState('2026-06');
  const [osCustomName, setOsCustomName] = useState('');
  const [osMeetingsCount, setOsMeetingsCount] = useState(4);
  const [osDayOfWeek, setOsDayOfWeek] = useState(3); // Wednesday (3)
  const [osTotalCopies, setOsTotalCopies] = useState(500);
  const [osMaxSponsors, setOsMaxSponsors] = useState(printConfig.maxSponsors || 8);

  // Meeting form
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingDesc, setNewMeetingDesc] = useState('');
  const [newMeetingOSId, setNewMeetingOSId] = useState('');

  // Print Config inputs
  const [copies, setCopies] = useState(printConfig.defaultCopies);
  const [paperType, setPaperType] = useState(printConfig.paperType);
  const [maxSponsors, setMaxSponsors] = useState(printConfig.maxSponsors);

  // Drag and drop states
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');

  // Delivery date and time states
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Group member adding state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedUnassignedUser, setSelectedUnassignedUser] = useState('');

  const [selectedOSId, setSelectedOSId] = useState<string>('');

  // Group-segregated scopes
  const currentTeam = currentUser?.team && currentUser?.team !== 'Nenhuma' ? currentUser.team : null;
  const teamOSList = currentTeam ? monthlyOS.filter(o => o.team === currentTeam) : [];
  
  const activeOS = selectedOSId 
    ? (teamOSList.find(o => o.id === selectedOSId) || teamOSList[0] || null)
    : (teamOSList[0] || null);

  // Filter resources to bind strictly to coordinator's group
  const displayMeetings = currentTeam 
    ? meetings.filter(m => m.team === currentTeam) 
    : [];

  const selectedMeeting = displayMeetings.find(m => m.id === selectedMeetingId);
  const calculatedDeliveryDate = selectedMeeting ? (() => {
    const d = new Date(selectedMeeting.date + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })() : '';

  const displayOrders = currentTeam 
    ? orders.filter(o => o.team === currentTeam) 
    : [];

  const displaySponsors = currentTeam 
    ? sponsorsQueue.filter(s => s.team === currentTeam) 
    : [];

  const teamMembers = currentTeam 
    ? users.filter(u => u.team === currentTeam) 
    : [];

  // Categorize members
  const coordinators = teamMembers.filter(u => u.role === 'coordenador');
  const trioMembers = teamMembers.filter(u => u.role === 'trio');
  const sponsorMembers = teamMembers.filter(u => u.role === 'patrocinador');

  // Validate formatting constraints (1 coordinator, exactly 3 trio, optional sponsors)
  const hasOneCoordinator = coordinators.length === 1;
  const hasExactlyThreeTrio = trioMembers.length === 3;
  const isTeamValid = hasOneCoordinator && hasExactlyThreeTrio;

  // Find eligible users inside the system who are not yet in any team
  const unassignedUsers = users.filter(u => 
    (!u.team || u.team === 'Nenhuma') && 
    (u.role === 'trio' || u.role === 'patrocinador')
  );

  // Constants for paper multipliers (cost in BRL per item)
  const getPaperMultiplier = (type: string) => {
    const norm = type.toLowerCase();
    if (norm.includes('90g')) return 1.20;
    if (norm.includes('115g')) return 1.50;
    if (norm.includes('150g')) return 2.00;
    if (norm.includes('75g')) return 0.90;
    return 1.10;
  };

  const currentMultiplier = getPaperMultiplier(paperType);
  const calculatedCost = copies * currentMultiplier;

  // --- MEETINGS HANDLERS ---
  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingDate) return;

    // Find the linked OS if chosen
    const linkedOS = teamOSList.find(o => o.id === newMeetingOSId);

    const created: Meeting = {
      id: `meet-${Date.now()}`,
      date: newMeetingDate,
      description: newMeetingDesc.trim() || 'Reunião de Alinhamento',
      team: currentTeam || undefined,
      osId: newMeetingOSId || undefined,
      paperType: '90g',
      copies: linkedOS ? Math.ceil(linkedOS.totalCopies / (linkedOS.meetingsCount || 1)) : 125,
      costPerCopy: 6.00
    };

    onUpdateMeetings([...meetings, created]);
    setNewMeetingDate('');
    setNewMeetingDesc('');
    setNewMeetingOSId('');
    alert('Reunião agendada para o seu grupo com sucesso!');
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) {
      alert('Certifique-se de que possui uma equipe vinculada.');
      return;
    }

    const weekdayLabels: { [key: number]: string } = {
      1: 'Segunda-feira',
      2: 'Terça-feira',
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
      6: 'Sábado',
      0: 'Domingo'
    };

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let finalOSId = `os-${Date.now()}`;
    let finalMonth = '';
    let finalDayOfWeek = '';
    let finalDayOfWeekCode = 0;
    let finalMeetingsCount = 0;
    let generatedMeetings: Meeting[] = [];

    const osNameString = osCustomName.trim();

    if (osGenerationType === 'unica') {
      if (!osSingleMeetingDate) {
        alert('Selecione uma data para a reunião única.');
        return;
      }
      finalMonth = osSingleMeetingDate.substring(0, 7); // YYYY-MM
      const dateObj = new Date(osSingleMeetingDate + 'T12:00:00');
      const dayOfWeekCode = dateObj.getDay(); // 0-6
      finalDayOfWeekCode = dayOfWeekCode;
      finalDayOfWeek = weekdayLabels[dayOfWeekCode] || 'Dia';
      finalMeetingsCount = 1;

      const year = dateObj.getFullYear();
      const monthIndex = dateObj.getMonth();
      const monthLabel = monthNames[monthIndex];

      generatedMeetings = [{
        id: `meet-os-${finalOSId}-0`,
        date: osSingleMeetingDate,
        description: osNameString 
          ? `Reunião Única O.S. "${osNameString}" (${monthLabel}/${year})`
          : `Reunião Única O.S. - ${osSingleMeetingDate.split('-').reverse().join('/')}`,
        team: currentTeam,
        osId: finalOSId,
        paperType: '90g',
        copies: osTotalCopies,
        costPerCopy: 6.00
      }];
    } else {
      if (!osMonth) {
        alert('Selecione o mês de faturamento.');
        return;
      }
      finalMonth = osMonth;
      const parts = osMonth.split('-');
      const year = parseInt(parts[0]);
      const monthIndex = parseInt(parts[1]) - 1;

      finalDayOfWeekCode = osDayOfWeek;
      finalDayOfWeek = weekdayLabels[osDayOfWeek] || 'Dia';
      finalMeetingsCount = osMeetingsCount;

      const dates: string[] = [];
      for (let d = 1; d <= 31; d++) {
        const dateObj = new Date(Date.UTC(year, monthIndex, d, 12, 0, 0));
        if (dateObj.getUTCMonth() !== monthIndex) break;
        if (dateObj.getUTCDay() === osDayOfWeek) {
          dates.push(dateObj.toISOString().substring(0, 10));
        }
      }

      const generatedDates = dates.slice(0, osMeetingsCount);

      if (generatedDates.length === 0) {
        alert('Nenhum dia correspondente encontrado no mês selecionado.');
        return;
      }

      const monthLabel = monthNames[monthIndex];

      generatedMeetings = generatedDates.map((dateStr, index) => ({
        id: `meet-os-${finalOSId}-${index}`,
        date: dateStr,
        description: osNameString 
          ? `Reunião O.S. "${osNameString}" #${index + 1} (${monthLabel}/${year})`
          : `Reunião O.S. ${finalDayOfWeek} - #${index + 1} (${monthLabel}/${year})`,
        team: currentTeam,
        osId: finalOSId,
        paperType: '90g',
        copies: Math.ceil(osTotalCopies / osMeetingsCount),
        costPerCopy: 6.00
      }));
    }

    const newOS: MonthlyOS = {
      id: finalOSId,
      month: finalMonth,
      osName: osNameString || undefined,
      meetingsCount: finalMeetingsCount,
      dayOfWeek: finalDayOfWeek,
      dayOfWeekCode: finalDayOfWeekCode,
      totalCopies: osTotalCopies,
      paperType: '90g',
      costPerCopy: 6.00,
      totalCost: osTotalCopies * 6.00,
      team: currentTeam,
      dateCreated: new Date().toISOString(),
      maxSponsors: osMaxSponsors
    };

    // Clean existing meetings for this month
    const cleanMeetings = meetings.filter(m => {
      if (m.team === currentTeam) {
        return !m.date.startsWith(finalMonth);
      }
      return true;
    });

    onUpdateMeetings([...cleanMeetings, ...generatedMeetings]);
    onUpdateMonthlyOS([...monthlyOS.filter(o => o.team !== currentTeam || o.month !== finalMonth), newOS]);

    // Send notification
    const alertId = `not-${Date.now()}`;
    const newAlert: NotificationItem = {
      id: alertId,
      type: 'system',
      message: `Ordem de Serviço (O.S.)${osNameString ? ` "${osNameString}"` : ''} gerada para o mês ${finalMonth.split('-').reverse().join('/')}: ${generatedMeetings.length} reunião(ões) com faturamento total de R$ ${(osTotalCopies * 6).toLocaleString('pt-BR')}.`,
      timestamp: 'Agora mesmo',
      read: false
    };
    onUpdateNotifications([newAlert, ...notifications]);

    const displayMonth = finalMonth.split('-').reverse().join('/');
    alert(`Ordem de Serviço (O.S)${osNameString ? ` "${osNameString}"` : ''} de ${displayMonth} criada com sucesso!\nAgendada(s) ${generatedMeetings.length} reunião(ões) no calendário.`);
    setOsCustomName('');
    setOsSingleMeetingDate('');
  };

  const handleRemoveOS = (id: string, monthStr: string) => {
    if (confirm('Tem certeza que deseja excluir esta O.S.? Isso também removerá as reuniões geradas no calendário.')) {
      onUpdateMonthlyOS(monthlyOS.filter(o => o.id !== id));
      onUpdateMeetings(meetings.filter(m => m.osId !== id));
      alert('Ordem de Serviço excluída com sucesso.');
    }
  };

  const handleRemoveMeeting = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta agenda?')) {
      onUpdateMeetings(meetings.filter(m => m.id !== id));
    }
  };

  // --- PRINT CONFIG HANDLERS ---
  const handleSavePrintConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePrintConfig({
      defaultCopies: Number(copies),
      paperType: paperType,
      maxSponsors: Number(maxSponsors)
    });
    alert('Configurações de impressão salvas!');
  };

  // --- SPONSORS APPROVALS ---
  const handleSponsorStatus = (id: string, status: 'aprovado' | 'recusado') => {
    const updated = sponsorsQueue.map(s => {
      if (s.id === id) {
        return { ...s, status };
      }
      return s;
    });
    onUpdateSponsorsQueue(updated);
  };

  // --- FILE SUBMISSION GRAPHICS ---
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Por favor, faça upload apenas de arquivos no formato PDF!');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Por favor, faça upload apenas de arquivos no formato PDF!');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor, selecione ou arraste um arquivo PDF antes de submeter.');
      return;
    }
    if (!selectedMeetingId) {
      alert('Por favor, selecione uma das reuniões marcadas como prazo!');
      return;
    }

    const meeting = displayMeetings.find(m => m.id === selectedMeetingId);
    if (!meeting) {
      alert('Reunião inválida selecionada.');
      return;
    }

    const created: PrintOrder = {
      id: `ord-${Date.now()}`,
      filename: selectedFile.name,
      paperType: printConfig.paperType,
      copies: printConfig.defaultCopies,
      sentBy: currentUser?.email || 'coordenador@aiprint.com',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'aguardando',
      progress: 0,
      team: currentTeam || undefined,
      deadlineMeetingId: selectedMeetingId,
      deadlineDate: meeting.date,
      deliveryDate: calculatedDeliveryDate || undefined,
      deliveryTime: deliveryTime || undefined
    };

    onUpdateOrders([created, ...orders]);
    alert(`Pedido de ficha "${selectedFile.name}" submetido com sucesso! Prazo vinculado à reunião de ${meeting.date}.`);
    
    // Clear form
    setSelectedFile(null);
    setSelectedMeetingId('');
    setDeliveryDate('');
    setDeliveryTime('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- TEAM MEMBERS HANDLERS ---
  const handleAcceptJoinRequest = (pendingUserId: string) => {
    const pendingUser = users.find(u => u.id === pendingUserId);
    if (!pendingUser || !currentTeam) return;

    // 1. Update user's team state
    const updatedUsers = users.map(u => {
      if (u.id === pendingUserId) {
        return { 
          ...u, 
          team: currentTeam, 
          pendingTeamRequest: undefined 
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);

    // 2. Update teams state list
    const updatedTeams = teams.map(t => {
      if (t.name === currentTeam) {
        const currentMembers = t.members || [];
        if (!currentMembers.includes(pendingUser.email)) {
          return { ...t, members: [...currentMembers, pendingUser.email] };
        }
      }
      return t;
    });
    onUpdateTeams(updatedTeams);

    // 3. Add system notification
    const alertId = `not-${Date.now()}`;
    const newAlert: NotificationItem = {
      id: alertId,
      type: 'member',
      message: `Associação Aprovada: ${pendingUser.name} foi adicionado ao grupo "${currentTeam}".`,
      timestamp: 'Agora mesmo',
      read: false
    };
    onUpdateNotifications([newAlert, ...notifications]);

    alert(`Você aprovou o pedido de associação de ${pendingUser.name}!`);
  };

  const handleRejectJoinRequest = (pendingUserId: string) => {
    const pendingUser = users.find(u => u.id === pendingUserId);
    if (!pendingUser || !currentTeam) return;

    // 1. Clear user's pending request
    const updatedUsers = users.map(u => {
      if (u.id === pendingUserId) {
        const { pendingTeamRequest, ...rest } = u;
        return { ...rest, team: u.team || 'Nenhuma' };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);

    // 2. Add system notification
    const alertId = `not-${Date.now()}`;
    const newAlert: NotificationItem = {
      id: alertId,
      type: 'member',
      message: `Associação Recusada: O pedido de ${pendingUser.name} para o grupo "${currentTeam}" foi recusado.`,
      timestamp: 'Agora mesmo',
      read: false
    };
    onUpdateNotifications([newAlert, ...notifications]);

    alert(`Você recusou o pedido de associação de ${pendingUser.name}.`);
  };

  const handleRemoveMember = (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;

    if (confirm(`Deseja desvincular ${target.name} do seu grupo?`)) {
      const updated = users.map(u => {
        if (u.id === id) {
          return { ...u, team: 'Nenhuma' };
        }
        return u;
      });
      onUpdateUsers(updated);
      alert('Integrante removido do grupo!');
    }
  };

  const [showPassModal, setShowPassModal] = useState(false);
  const [targetUserForCoord, setTargetUserForCoord] = useState<User | null>(null);

  const handleUpdateMemberRole = (targetMember: User, newRole: User['role']) => {
    if (!currentTeam) return;

    if (newRole === 'coordenador') {
      setTargetUserForCoord(targetMember);
      setShowPassModal(true);
      return;
    }

    if (newRole === 'trio') {
      const currentTrios = teamMembers.filter(u => u.role === 'trio');
      if (currentTrios.length >= 3) {
        alert('Erro: O Trio de Apoio já possui o limite regulamentar máximo de 3 membros! Por favor, remova ou altere o cargo de algum outro integrante do Trio antes.');
        return;
      }
    }

    const updatedUsers = users.map(u => {
      if (u.id === targetMember.id) {
        return { ...u, role: newRole };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    alert(`Cargo de ${targetMember.name} alterado com sucesso para ${newRole === 'trio' ? 'Trio de Apoio' : 'Membro'}!`);
  };

  const handleConfirmPassCoordination = () => {
    if (!targetUserForCoord || !currentUser) return;

    const updatedUsers = users.map(u => {
      if (u.id === targetUserForCoord.id) {
        return { ...u, role: 'coordenador' as const };
      }
      if (u.id === currentUser.id) {
        return { ...u, role: 'patrocinador' as const };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    setShowPassModal(false);
    setTargetUserForCoord(null);
    alert(`Sucesso! Coordenação transferida para ${targetUserForCoord.name}. Você agora possui privilégios de Membro.`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/15 mb-3">
          {currentTeam ? `Equipe: ${currentTeam}` : 'Nenhuma Equipe Vinculada'}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Painel do Coordenador de Comunicação</h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize tiragens das fichas de produção locais, gerencie a agenda do seu grupo, e ordene cotas de patrocínio.
        </p>
      </div>

      {!currentTeam ? (
        <div className="rounded-3xl p-8 bg-[#E63946]/5 border border-[#E63946]/10 shadow-sm text-center max-w-xl mx-auto space-y-3">
          <HelpCircle className="h-12 w-12 text-[#E63946] mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-slate-800">Sem Equipe Ativa</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Seu perfil de Coordenador ainda não foi alocado em uma equipe de faturamento da rede AIprint.
            Sem uma equipe, o controle de PDFs, reuniões e fluxo financeiro locais não pode ser executado.
            <strong> Entre em contato com a Diretoria Administrativa para ser integrado.</strong>
          </p>
        </div>
      ) : (
        <>
          {/* Grid Tabs layout */}
          <div className="flex flex-wrap gap-2 p-2 rounded-2xl glass-card">
            <button
              onClick={() => setActiveTab('meetings')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'meetings' ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Agenda de Reuniões ({displayMeetings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('print')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'print' ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Printer className="h-4 w-4" />
              <span>Metas & Envio de Ficha</span>
            </button>
            <button
              onClick={() => setActiveTab('sponsors')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'sponsors' ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Patrocinadores do Grupo ({displaySponsors.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'team' ? 'bg-[#E63946] text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <UsersRound className="h-4 w-4" />
              <span>Composição Colegiado ({teamMembers.length})</span>
            </button>
          </div>

          {/* Tab contents */}

          {/* 1. agenda editorial & O.S. */}
          {activeTab === 'meetings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-305">
              
              {/* Left Column: Planejadores */}
              <div className="space-y-6">
                
                {/* Card 1: Gerador de O.S. Mensal */}
                <div className="rounded-3xl p-6 shadow-xl glass-card h-fit">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/15 mb-3">
                    Planejador O.S.
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-base mb-2">Definir Ordem de Serviço (O.S)</h3>
                  <p className="text-xs text-slate-500 mb-5 leading-normal">
                    Configure o mês e automatize as datas de reuniões do seu grupo local. A gramatura é fixada em <strong>90g</strong> com custo de <strong>R$ 6,00 por cópia</strong>.
                  </p>

                  <form onSubmit={handleCreateOS} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Formato da O.S.</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setOsGenerationType('automatico')}
                          className={`py-2 text-[11px] font-bold rounded-xl text-center cursor-pointer transition-all ${
                            osGenerationType === 'automatico'
                              ? 'bg-[#E63946] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Múltiplas (Auto)
                        </button>
                        <button
                          type="button"
                          onClick={() => setOsGenerationType('unica')}
                          className={`py-2 text-[11px] font-bold rounded-xl text-center cursor-pointer transition-all ${
                            osGenerationType === 'unica'
                              ? 'bg-[#E63946] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Reunião Única
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nome da O.S. (Opcional)</label>
                      <input
                        type="text"
                        value={osCustomName}
                        onChange={(e) => setOsCustomName(e.target.value)}
                        placeholder="Ex: Pauta Extra, Cota Anual, etc."
                        className="block w-full text-xs rounded-xl border border-slate-205 bg-white py-2.5 px-3 text-slate-800 placeholder-slate-400 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/10"
                      />
                    </div>

                    {osGenerationType === 'unica' ? (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Data da Reunião Única</label>
                        <input
                          type="date"
                          required
                          value={osSingleMeetingDate}
                          onChange={(e) => setOsSingleMeetingDate(e.target.value)}
                          className="block w-full text-xs rounded-xl border border-slate-205 bg-white py-2.5 px-3 text-slate-800 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/10"
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mês de Faturamento</label>
                          <input
                            type="month"
                            required
                            value={osMonth}
                            onChange={(e) => setOsMonth(e.target.value)}
                            className="block w-full text-xs rounded-xl border border-slate-205 bg-white py-2.5 px-3 text-slate-800 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/10"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reuniões / Mês</label>
                            <select
                              value={osMeetingsCount}
                              onChange={(e) => setOsMeetingsCount(Number(e.target.value))}
                              className="block w-full text-xs rounded-xl border border-slate-205 bg-white py-2.5 px-3 text-slate-800 outline-none focus:border-[#E63946]"
                            >
                              <option value="2">2 Reuniões</option>
                              <option value="4">4 Reuniões</option>
                              <option value="5">5 Reuniões</option>
                              <option value="8">8 Reuniões</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dia da Semana</label>
                            <select
                              value={osDayOfWeek}
                              onChange={(e) => setOsDayOfWeek(Number(e.target.value))}
                              className="block w-full text-xs rounded-xl border border-slate-205 bg-white py-2.5 px-3 text-slate-800 outline-none focus:border-[#E63946]"
                            >
                              <option value="1">Segunda-feira</option>
                              <option value="2">Terça-feira</option>
                              <option value="3">Quarta-feira</option>
                              <option value="4">Quinta-feira</option>
                              <option value="5">Sexta-feira</option>
                              <option value="6">Sábado</option>
                              <option value="0">Domingo</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiragem Total do Mês</label>
                        <input
                          type="number"
                          min={10}
                          required
                          value={osTotalCopies}
                          onChange={(e) => setOsTotalCopies(Number(e.target.value))}
                          placeholder="Ex: 500 cópias"
                          className="block w-full text-xs rounded-xl border border-slate-205 bg-white py-2.5 px-3 text-slate-800 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/10"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sponsors do Mês (Limite)</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          required
                          value={osMaxSponsors}
                          onChange={(e) => setOsMaxSponsors(Number(e.target.value))}
                          placeholder="Ex: 8"
                          className="block w-full text-xs rounded-xl border border-slate-205 bg-white py-2.5 px-3 text-slate-800 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/10"
                        />
                      </div>
                    </div>

                    {/* Summary Box */}
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-150 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Papel Cadastrado:</span>
                        <strong className="text-slate-800">90g (Fixo)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Custo por cópia:</span>
                        <strong className="text-slate-800">R$ 6,00 (Fixo)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cota p/ Patrocinador:</span>
                        <strong className="text-emerald-600">R$ {Math.ceil((osTotalCopies * 6) / osMaxSponsors).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div className="border-t border-dashed border-slate-200/60 my-2 pt-2 flex justify-between text-slate-900 font-extrabold text-sm">
                        <span>Valor Final O.S:</span>
                        <span className="text-[#E63946]">R$ {(osTotalCopies * 6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] p-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer transform active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Gerar O.S & Reuniões</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Columns: O.S. Registradas e Compromissos Gerados */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* O.S. Ativa Info Sheet */}
                <div className="rounded-3xl p-6 shadow-xl glass-card">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">Ordens de Serviço Ativas</h3>
                  
                  {monthlyOS.filter(o => o.team === currentTeam).length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 italic">
                      Nenhuma O.S. cadastrada para este grupo ainda. Preencha o formulário ao lado de planejamento.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {monthlyOS.filter(o => o.team === currentTeam).map((os) => {
                        const dateFormatted = os.month.split('-').reverse().join('/');
                        return (
                          <div key={os.id} className="p-4 rounded-2xl bg-white/55 border border-slate-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-[10px] uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded font-extrabold">EM VIGOR</span>
                                <span className="text-xs font-bold text-slate-700">Mês: {dateFormatted}</span>
                                {os.osName && (
                                  <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-black uppercase tracking-wider">
                                    {os.osName}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {os.meetingsCount} reuniões no mês às <strong>{os.dayOfWeek}</strong>. Tiragem total de <strong>{os.totalCopies} cópias</strong> de papel {os.paperType} a R$ 6,00.
                                <br />Limite de <strong>{os.maxSponsors || 8} patrocinadores</strong> (R$ {Math.ceil((os.totalCopies * 6) / (os.maxSponsors || 8)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada).
                              </p>
                            </div>
                            <div className="text-right flex items-center gap-4 self-stretch sm:self-auto justify-between border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                              <div>
                                <span className="block text-[10px] text-slate-400 uppercase font-black">FATURAMENTO</span>
                                <span className="text-lg font-black text-[#E63946]">R$ {os.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveOS(os.id, os.month)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition"
                                title="Remover O.S."
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Compromissos no calendário gerados pela O.S. */}
                <div className="rounded-3xl p-6 shadow-xl glass-card">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">Datas Agendadas no Calendário Local</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayMeetings.length === 0 ? (
                      <p className="col-span-2 text-xs text-slate-400 italic py-6 text-center">Nenhuma data ou reunião gerada para este mês.</p>
                    ) : (
                      displayMeetings.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-3.5 bg-white/40 rounded-xl border border-white/35">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 font-bold px-3 py-1.5 rounded-lg text-xs min-w-[70px]">
                              <span>DIA</span>
                              <span>{m.date.split('-')[2]}</span>
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold text-slate-400">{m.date.split('-').reverse().join('/')}</span>
                              <h4 className="font-extrabold text-slate-800 text-xs truncate max-w-[150px]" title={m.description}>{m.description}</h4>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMeeting(m.id)}
                            className="text-[#E63946] hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Remover Reunião"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. PRINT CONFIG & DRAG/DROP FILE SUBMISSIONS (COMBINED) */}
          {activeTab === 'print' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
              
              {/* Left Column: Parâmetros da O.S. e Regras de Produção das Fichas */}
              <div className="rounded-3xl p-6 shadow-xl glass-card h-fit space-y-5">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wider flex items-center gap-2">
                    <Printer className="h-4.5 w-4.5 text-[#E63946]" />
                    Ordem de Serviço (O.S.) Associada
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Selecione a Ordem de Serviço (O.S.) de referência de faturamento e tiragem de seu grupo.
                  </p>
                </div>

                {/* BOTÕES DE ESCOLHA DE O.S. */}
                {teamOSList.length > 0 && (
                  <div className="p-3 bg-slate-100/50 rounded-2xl border border-slate-200/60 space-y-2">
                    <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Escolher O.S. Ativa:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {teamOSList.map((os) => {
                        const isSelected = activeOS?.id === os.id;
                        const formattedMonth = os.month.split('-').reverse().join('/');
                        return (
                          <button
                            key={os.id}
                            type="button"
                            onClick={() => setSelectedOSId(os.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                              isSelected
                                ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm transform scale-[1.02] font-extrabold'
                                : 'bg-white text-slate-600 hover:text-slate-800 border-slate-250 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#E63946]'}`}></span>
                            O.S. de {formattedMonth}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {activeOS ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-250/50 flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-800">Parâmetros Travados de Acordo com O.S. Vigente</h4>
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          A Ordem de Serviço de faturamento para o mês de {activeOS.month.split('-').reverse().join('/')} está em vigor.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grupo Local Beneficiário</span>
                        <span className="text-slate-800 font-extrabold text-sm">{activeOS.team}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mês de Referência</span>
                          <span className="text-slate-800 font-extrabold text-sm">{activeOS.month.split('-').reverse().join('/')}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reuniões Agendadas</span>
                          <span className="text-slate-800 font-extrabold text-sm">{activeOS.meetingsCount} Reuniões</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Especificação de Papel</span>
                          <span className="text-slate-800 font-extrabold text-sm">90g (Fixo)</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Unitário</span>
                          <span className="text-slate-800 font-extrabold text-sm">R$ 6,00 (Fixo)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume Total (Mês)</span>
                          <span className="text-slate-800 font-extrabold text-sm">{activeOS.totalCopies} cópias</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sponsors do Mês (Limite)</span>
                          <span className="text-slate-800 font-extrabold text-sm">{activeOS.maxSponsors || 8} Sponsors</span>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cota p/ Patrocinador</span>
                        <span className="text-emerald-600 font-black text-sm">R$ {Math.ceil(activeOS.totalCost / (activeOS.maxSponsors || 8)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Cost summary box */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">Faturamento Previsto para Patrocinadores:</span>
                        <div className="text-right">
                          <span className="text-xl font-black text-[#E63946] font-mono">
                            R$ {activeOS.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400">
                        * O rateio será diluído entre os patrocinadores que aceitarem o aporte no início do mês de vigência.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-dashed border-red-200 bg-red-50/50 text-center space-y-4">
                      <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-red-800">Nenhuma Ordem de Serviço Cadastrada</h4>
                        <p className="text-xs text-red-600 mt-1 max-w-sm mx-auto leading-relaxed">
                          É obrigatório gerar uma Ordem de Serviço (O.S.) antes de subir as Fichas de Produção oficiais. A O.S. define a agenda, a quantidade de impressões e os custos.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('meetings')}
                        className="inline-flex items-center gap-1.5 bg-[#E63946] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#d62839] transition shadow cursor-pointer"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Definir Nova O.S. Agora</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Submissão de PDFs e PDFs Sincronizados do Grupo */}
              <div className="space-y-6">
                <div className="rounded-3xl p-6 shadow-xl glass-card">
                  <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Upload className="h-4.5 w-4.5 text-[#E63946]" />
                    Submissão Oficial de Fichas de Produção
                  </h3>
                  
                  {!activeOS ? (
                    <div className="py-8 text-center space-y-3">
                      <Lock className="h-8 w-8 text-slate-400 mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-slate-700">Envio de PDF Bloqueado</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        A inserção de PDFs de faturamento e escolha da reunião associada só serão disponibilizadas após você definir a Ordem de Serviço (O.S) mensal.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 mb-6 font-medium">Selecione ou comande o upload do arquivo PDF correspondente e indique uma das reuniões marcadas para o grupo como pauta/prazo final.</p>

                      <form onSubmit={handleOrderSubmit} className="space-y-6">
                    <div className="flex flex-col gap-6">
                      {/* File Drop Area */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Arquivo PDF da Ficha *</label>
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleFileDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                            dragOver 
                              ? 'border-[#E63946] bg-[#E63946]/5' 
                              : selectedFile
                              ? 'border-emerald-500 bg-emerald-500/5 hover:border-emerald-600'
                              : 'border-slate-300 bg-white/40 hover:border-[#E63946]'
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pdf"
                            className="hidden"
                          />
                          <Upload className={`mx-auto h-10 w-10 mb-3 ${selectedFile ? 'text-emerald-500' : 'text-[#E63946]'}`} />
                          {selectedFile ? (
                            <>
                              <p className="font-bold text-emerald-800 text-xs">Arquivo Selecionado!</p>
                              <p className="text-[11px] font-mono text-slate-600 truncate mt-1 px-4">{selectedFile.name}</p>
                              <p className="text-[10px] text-slate-400 mt-2">Clique ou arraste outro para substituir.</p>
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-slate-700 text-xs">Arraste e solte o PDF aqui</p>
                              <p className="text-[10px] text-slate-400 mt-1">Ou clique para buscar nos arquivos.</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Deadline Field */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Definir Prazo (Reuniões do Mês) *</label>
                          {displayMeetings.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-4 text-center">
                              <p className="text-xs text-red-600 font-semibold mb-2">Seu grupo não possui reuniões agendadas para este mês!</p>
                              <p className="text-[10px] text-slate-500">Agende uma reunião na aba "Agenda de Reuniões" primeiro para poder submeter uma ficha de produção com prazo válido.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <select
                                required
                                value={selectedMeetingId}
                                onChange={(e) => setSelectedMeetingId(e.target.value)}
                                className="block w-full text-xs rounded-xl border border-slate-250 bg-white/60 p-3 text-slate-800 outline-none focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/10"
                              >
                                <option value="">-- Selecione uma reunião como prazo --</option>
                                {displayMeetings
                                  .filter(m => !activeOS || m.osId === activeOS.id || !m.osId)
                                  .map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.date.split('-').reverse().join('/')} - {m.description}
                                    </option>
                                  ))}
                              </select>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                * Pelo regulamento, o prazo limite de recebimento da ficha física pela gráfica de entrega é a data da reunião agendada.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Delivery Schedule Inputs */}
                        <div className="bg-[#E63946]/5 rounded-2xl p-4 border border-[#E63946]/10 space-y-3">
                          <label className="block text-xs font-bold text-[#E63946] uppercase tracking-wider flex items-center gap-1.5">
                            <span>🚚 Previsão de Entrega Física</span>
                          </label>
                          <p className="text-[10px] text-slate-500 font-medium">
                            A entrega física ocorrerá sempre <strong>1 dia antes</strong> da reunião selecionada. O horário é definido e editável por você abaixo.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-semibold">Data Calculada</span>
                              <div className="text-slate-800 font-bold text-xs p-2.5 bg-white/70 border border-slate-200 rounded-lg min-h-[34px] flex items-center">
                                {calculatedDeliveryDate ? calculatedDeliveryDate.split('-').reverse().join('/') : '(Selecione a reunião acima)'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Horário de Entrega</label>
                              <input
                                type="time"
                                required
                                value={deliveryTime}
                                onChange={(e) => setDeliveryTime(e.target.value)}
                                className="block w-full text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 outline-none focus:border-[#E63946]"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={!selectedFile || !selectedMeetingId}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-[#E63946] text-white p-3.5 text-xs font-black shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Printer className="h-4 w-4" />
                          <span>Submeter Pedido de Ficha</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>

                {/* PDFs Sincronizados do Grupo */}
                <div className="rounded-3xl p-6 shadow-xl glass-card">
                  <h4 className="font-bold text-slate-800 text-sm mb-4 uppercase">
                    PDFs Sincronizados do Grupo ({displayOrders.length})
                  </h4>
                  
                  <div className="divide-y divide-slate-100/15 space-y-2">
                    {displayOrders.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6">Nenhum lote de ficha submetido por seu grupo.</p>
                    ) : (
                      displayOrders.map((o) => (
                        <div key={o.id} className="flex flex-col sm:flex-row justify-between sm:items-center py-3 text-xs bg-white/35 px-4 rounded-xl border border-slate-200/40 gap-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-red-100 text-[#E63946] font-extrabold text-[10px]">PDF</div>
                            <div>
                              <strong className="text-slate-800">{o.filename}</strong>
                              <p className="text-[10px] text-slate-400">{o.date} • {o.paperType} • {o.copies} cópias</p>
                              {o.deadlineDate && (
                                <p className="text-[10px] text-indigo-655 font-bold mt-1 flex items-center gap-1 bg-indigo-50/70 py-0.5 px-1.5 rounded w-fit border border-indigo-100/40">
                                  📅 Prazo de Entrega: {o.deadlineDate.split('-').reverse().join('/')}
                                </p>
                              )}
                              {o.deliveryDate && (
                                <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1 bg-emerald-50/70 py-0.5 px-1.5 rounded w-fit border border-emerald-100/40">
                                  🚚 Agendado para: {o.deliveryDate.split('-').reverse().join('/')} {o.deliveryTime ? `às ${o.deliveryTime}` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase self-start sm:self-center ${
                            o.status === 'entregue' 
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : o.status === 'em impressão'
                              ? 'bg-blue-500/10 text-blue-600 animate-pulse'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 3. MODERAR SPONSORS */}
          {activeTab === 'sponsors' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl flex justify-between items-center text-xs glass-card">
                <span className="font-semibold text-slate-600">Limite de Pauta: {activeOS?.maxSponsors || printConfig.maxSponsors} patrocinadores máximos por tiragem local.</span>
                <span className="text-slate-400 font-medium">Exibindo somente cotas vinculadas ao grupo: <strong>{currentTeam}</strong></span>
              </div>

              <div className="overflow-x-auto rounded-3xl glass-card shadow-xl">
                <table className="min-w-full divide-y divide-slate-200/40">
                  <thead className="bg-[#E63946]/5">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase">Patrocinador</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase">Gramatura</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase">Tiragem</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase">Faturamento</th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                      <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 uppercase">Moderar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/20 text-sm">
                    {displaySponsors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">Prezados faturadores, nenhum patrocinador local inscrito na fila deste grupo ainda.</td>
                      </tr>
                    ) : (
                      displaySponsors.map((s) => (
                        <tr key={s.id} className="hover:bg-white/10 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-bold text-slate-800 text-xs">{s.sponsorName}</div>
                            <div className="text-slate-400 text-[10px] font-mono leading-normal">{s.sponsorEmail}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-xs">{s.paperType}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-800 font-bold text-xs">{s.copies}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-800 font-extrabold text-xs">R$ {s.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                              s.status === 'pago' 
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                : s.status === 'aprovado'
                                ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                                : s.status === 'recusado'
                                ? 'bg-red-500/10 text-[#E63946] border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-xs font-semibold">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleSponsorStatus(s.id, 'aprovado')}
                                disabled={s.status === 'aprovado' || s.status === 'pago'}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded disabled:opacity-40 cursor-pointer transition-colors"
                                title="Aprovar de Forma Definitiva"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleSponsorStatus(s.id, 'recusado')}
                                disabled={s.status === 'recusado' || s.status === 'pago'}
                                className="bg-[#E63946] hover:bg-red-700 text-white p-1 rounded disabled:opacity-40 cursor-pointer transition-colors"
                                title="Reprovar Patrocinador"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* 5. GESTÃO DOS COMPONENTES DO GRUPO (Formulação) */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Compliance banner */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white leading-relaxed shadow-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h4 className="font-extrabold text-sm tracking-wider uppercase text-[#E63946] flex items-center gap-2 mb-1.5">
                    <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                    Validação Regulamentar de Formação Geral
                  </h4>
                  <p className="text-slate-300 text-xs font-medium">
                    Políticas de equipe: 1 Coordenador (Atual: {coordinators.length}), Exatamente 3 Trio de Apoio (Atual: {trioMembers.length}/3) e quantos Membros quiser (Atual: {sponsorMembers.length}).
                  </p>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold flex-shrink-0 ${
                  isTeamValid 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {isTeamValid ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Colegiado Homologado</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 animate-spin" />
                      <span>Composição Irregular</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Pending requests management and regulatory guidelines */}
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* Pedidos de associação pendentes */}
                  <div className="rounded-3xl p-6 shadow-xl glass-card h-fit border border-amber-200">
                    <h3 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wider flex items-center gap-2 text-indigo-600">
                      <UserCheck className="h-4.5 w-4.5" />
                      Pedidos de Associação
                    </h3>
                    <p className="text-[10px] text-slate-500 mb-4 leading-normal">
                      Candidatos que solicitaram vinculação como Membro para o seu grupo local.
                    </p>

                    <div className="space-y-4">
                      {users.filter(u => u.pendingTeamRequest === currentTeam).length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 border border-dashed rounded-2xl">
                          <AlertCircle className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                          <p className="text-[11px] text-slate-400 italic">Nenhuma solicitação pendente.</p>
                        </div>
                      ) : (
                        users.filter(u => u.pendingTeamRequest === currentTeam).map((u) => (
                          <div key={u.id} className="p-3.5 bg-white/60 border border-slate-200 rounded-2xl space-y-3">
                            <div>
                              <h4 className="font-bold text-xs text-slate-800">{u.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{u.email}</p>
                              {u.phone && (
                                <p className="text-[10px] text-slate-600 font-medium mt-1 uppercase tracking-wider flex items-center gap-1 bg-slate-100 p-1 px-1.5 rounded-md w-fit">
                                  <span>📞 {u.phone}</span>
                                </p>
                              )}
                              <span className="inline-block mt-2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                                {u.role === 'patrocinador' ? 'Membro' : 'Trio de Apoio'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                              <button
                                onClick={() => handleAcceptJoinRequest(u.id)}
                                className="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Aceitar
                              </button>
                              <button
                                onClick={() => handleRejectJoinRequest(u.id)}
                                className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-200 hover:border-red-200 text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                              >
                                <X className="h-3.5 w-3.5" />
                                Recusar
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Administrative Disclaimer Card */}
                  <div className="rounded-3xl p-6 shadow-xl bg-slate-50 border border-slate-200 text-xs">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HelpCircle className="h-4.5 w-4.5 text-[#E63946]" />
                      Diretrizes Administrativas
                    </h4>
                    <p className="text-slate-500 leading-relaxed font-medium">
                      Estão sob governança central do <strong className="text-slate-800">Admin do Sistema</strong> todas as decisões de criação de novos grupos, configuração de permissões locais e alocação hierárquica.
                    </p>
                    <p className="text-slate-500 leading-relaxed font-medium mt-2">
                      Coordenadores de comunicação local atuam exclusivamente validando os termos de faturamento e associação dos patrocinadores regionais.
                    </p>
                  </div>

                </div>

                <div className="lg:col-span-2 rounded-3xl p-6 shadow-xl glass-card">
                  <h3 className="font-bold text-slate-800 text-base mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Diretório do Colegiado Integrado ({teamMembers.length} membros)
                  </h3>

                  <div className="space-y-3">
                    {teamMembers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nenhum membro ativo associado ao seu grupo.</p>
                    ) : (
                      teamMembers.map((m) => (
                        <div key={m.id} className="flex justify-between items-center p-3.5 bg-white/30 border border-slate-200/40 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold border ${
                              m.role === 'coordenador' 
                                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                : m.role === 'patrocinador'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                            }`}>
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-800 text-sm leading-none">{m.name}</h4>
                                {m.id === currentUser?.id ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-red-500/10 text-red-500 border border-red-500/15">
                                    Coordenador (Você)
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <select
                                      value={m.role}
                                      onChange={(e) => handleUpdateMemberRole(m, e.target.value as typeof m.role)}
                                      className="text-[10px] bg-white border border-slate-200 rounded-lg px-2 py-0.5 font-bold text-slate-700 outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946]/10 cursor-pointer shadow-sm"
                                    >
                                      <option value="patrocinador">Membro</option>
                                      <option value="trio">Trio de Apoio</option>
                                      <option value="coordenador">Coordenador</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{m.email} • Grupo: {m.team}</span>
                            </div>
                          </div>

                          {m.role !== 'coordenador' && (
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="text-slate-400 hover:text-[#E63946] p-2 rounded-lg transition-colors cursor-pointer"
                              title="Desassociar Membro do Grupo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}
        </>
      )}

      {/* Modal Passar Coordenação */}
      {showPassModal && targetUserForCoord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
                <AlertCircle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Passar Coordenação</h3>
                <p className="text-xs text-slate-500 mt-0.5">Transferência definitiva de liderança</p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl text-xs text-amber-800 leading-relaxed font-semibold">
              se você passar a coordenação para <span className="font-black text-slate-900">'{targetUserForCoord.name}'</span> você perderá os privilégios de coordenador e <span className="font-black text-slate-900">'{targetUserForCoord.name}'</span> recebera-los.
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowPassModal(false);
                  setTargetUserForCoord(null);
                }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-xs cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPassCoordination}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md transition hover:scale-[1.01]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
