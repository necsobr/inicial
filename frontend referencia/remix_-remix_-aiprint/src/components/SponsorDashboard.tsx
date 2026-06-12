/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, HelpCircle, User, Users, ChevronRight, Award, Plus, 
  CheckCircle, AlertCircle, Sparkles, DollarSign, BadgeHelp,
  Search, ChevronDown, ChevronUp
} from 'lucide-react';
import { Meeting, SponsorQueueItem, PrintConfig, User as Profile, Team, MonthlyOS, NotificationItem } from '../types';

interface TickingTimerProps {
  deadline: string;
  onExpire: () => void;
}

export function TickingTimer({ deadline, onExpire }: TickingTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Tempo Esgotado!');
        clearInterval(interval);
        onExpire();
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      let str = '';
      if (days > 0) str += `${days}d `;
      str += `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
      setTimeLeft(str);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  return (
    <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-bold bg-amber-500/10 px-2 py-1 rounded-md w-fit">
      <span className="animate-pulse">⏳</span>
      <span>Prazo: {timeLeft}</span>
    </div>
  );
}

interface SponsorDashboardProps {
  meetings: Meeting[];
  sponsorsQueue: SponsorQueueItem[];
  printConfig: PrintConfig;
  currentUser: Profile | null;
  users: Profile[];
  onNavigateToPayment: (amount: number, paperType: string, copies: number) => void;
  teams: Team[];
  onJoinRequest: (teamName: string) => void;
  monthlyOS?: MonthlyOS[];
  onUpdateSponsorsQueue?: (queue: SponsorQueueItem[]) => void;
  notifications?: NotificationItem[];
  onUpdateNotifications?: (notifications: NotificationItem[]) => void;
}

export default function SponsorDashboard({
  meetings,
  sponsorsQueue,
  printConfig,
  currentUser,
  users,
  onNavigateToPayment,
  teams,
  onJoinRequest,
  monthlyOS = [],
  onUpdateSponsorsQueue,
  notifications = [],
  onUpdateNotifications
}: SponsorDashboardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  // Constants for simulated paper multipliers (cost in BRL or USD/item)
  const getPaperMultiplier = (type: string) => {
    const norm = type.toLowerCase();
    if (norm.includes('90g')) return 1.20;
    if (norm.includes('115g')) return 1.50;
    if (norm.includes('150g')) return 2.00;
    if (norm.includes('75g')) return 0.90;
    return 1.10;
  };

  const costPerCopy = getPaperMultiplier(printConfig.paperType);
  const calculatedTotal = printConfig.defaultCopies * costPerCopy;

  const currentTeam = currentUser?.team && currentUser?.team !== 'Nenhuma' ? currentUser.team : null;

  // Find O.S. list for the current team
  const teamOSList = currentTeam ? monthlyOS.filter(o => o.team === currentTeam) : [];

  const [selectedOSId, setSelectedOSId] = useState<string>(() => {
    return teamOSList[0]?.id || 'os-june-2026';
  });

  // Filter meetings, sponsor list, and members by the current user's team/group and selected O.S.
  const displayMeetings = currentTeam 
    ? meetings.filter(m => m.team === currentTeam) 
    : [];

  const displaySponsors = currentTeam 
    ? sponsorsQueue.filter(s => s.team === currentTeam && (s.osId === selectedOSId || (!s.osId && selectedOSId === 'os-june-2026'))) 
    : [];

  const teamMembers = currentTeam 
    ? users.filter(u => u.team === currentTeam) 
    : [];

  // Group roles breakdown
  const coordinators = teamMembers.filter(u => u.role === 'coordenador');
  const trioMembers = teamMembers.filter(u => u.role === 'trio');
  const sponsorMembers = teamMembers.filter(u => u.role === 'patrocinador');

  // Rule checklist validations
  const hasOneCoordinator = coordinators.length === 1;
  const hasExactlyThreeTrio = trioMembers.length === 3;
  const isTeamValid = hasOneCoordinator && hasExactlyThreeTrio;

  const isUserAlreadyInQueue = sponsorsQueue.some(
    s => s.sponsorEmail === currentUser?.email && s.team === currentTeam && (s.osId === selectedOSId || (!s.osId && selectedOSId === 'os-june-2026'))
  );

  // Active O.S. details
  const activeOS = currentTeam ? monthlyOS?.find(o => o.id === selectedOSId) : null;
  const maxSpots = activeOS?.maxSponsors || printConfig.maxSponsors || 8;
  
  // Cost per sponsor is split among total O.S. budget or default backup
  const costPerSponsor = activeOS 
    ? Math.ceil((activeOS.totalCopies * 6) / maxSpots)
    : 600;

  // Background scanner to detect when a pending member enters eligible spots (position <= maxSpots)
  // and automatically initialize a 2-day timer and push a notification.
  useEffect(() => {
    if (!onUpdateSponsorsQueue || !sponsorsQueue.length) return;

    let updated = false;
    const newQueue = sponsorsQueue.map(item => {
      // Find the specific OS object to read its custom maxSponsors limit
      const itemOSObj = monthlyOS.find(o => o.id === item.osId);
      const itemMaxSpots = itemOSObj?.maxSponsors || printConfig.maxSponsors || 8;
      
      const isEligible = item.status === 'pendente' && item.team === currentTeam && item.position <= itemMaxSpots;

      if (isEligible && !item.timerDeadline) {
        updated = true;
        // Deadline is 2 days from now (48 hours)
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 2);

        // Add a notification for this eligible position
        if (onUpdateNotifications && notifications) {
          const alertId = `not-timer-init-${item.id}`;
          if (!notifications.some(n => n.id === alertId)) {
            const isCurrentUserItem = item.sponsorEmail === currentUser?.email;
            const newAlert: NotificationItem = {
              id: alertId,
              type: 'sponsor',
              message: `⏱️ [Vaga Elegível] ${isCurrentUserItem ? 'Você' : item.sponsorName} entrou na faixa de faturamento da O.S. de ${itemOSObj ? itemOSObj.month.split('-').reverse().join('/') : 'Referência'}. Pague em até 2 dias para confirmar, ou sua cota cederá para o próximo na fila!`,
              timestamp: 'Agora mesmo',
              read: false
            };
            setTimeout(() => {
              onUpdateNotifications([newAlert, ...notifications]);
            }, 0);
          }
        }

        return {
          ...item,
          timerDeadline: deadline.toISOString(),
          hasNotifiedTimer: true
        };
      }
      return item;
    });

    if (updated) {
      onUpdateSponsorsQueue(newQueue);
    }
  }, [sponsorsQueue, currentTeam, monthlyOS, printConfig.maxSponsors, onUpdateSponsorsQueue, onUpdateNotifications, notifications, currentUser]);

  // Handle immediate simulation/expiry of the 2-day timer (cedes spot to the next)
  const handleForceExpireTimer = (itemId: string) => {
    if (!onUpdateSponsorsQueue) return;

    // Find the item
    const item = sponsorsQueue.find(s => s.id === itemId);
    if (!item) return;

    const targetOSId = item.osId || 'os-june-2026';
    const targetTeam = item.team;

    // Separate items from other queues
    const otherItems = sponsorsQueue.filter(s => s.id !== itemId && (s.team !== targetTeam || (s.osId || 'os-june-2026') !== targetOSId));

    // Get items in this specific team's O.S. queue (excluding ourselves)
    const osQueue = sponsorsQueue.filter(s => s.id !== itemId && s.team === targetTeam && (s.osId || 'os-june-2026') === targetOSId);

    // Sort current queue by position and re-index them
    const sortedQueue = [...osQueue].sort((a, b) => a.position - b.position);
    sortedQueue.forEach((s, idx) => {
      s.position = idx + 1;
    });

    // Make expired item cede spot: status is set to 'recusado', position changes to the end
    const expiredItem = {
      ...item,
      status: 'recusado' as const,
      position: sortedQueue.length + 1,
      timerDeadline: undefined
    };

    const finalQueue = [...otherItems, ...sortedQueue, expiredItem];
    onUpdateSponsorsQueue(finalQueue);

    // Create system notification
    if (onUpdateNotifications && notifications) {
      const alertId = `not-expire-${Date.now()}`;
      const newAlert: NotificationItem = {
        id: alertId,
        type: 'system',
        message: `⏰ [Prazo Expirado] O patrocinador ${item.sponsorName} excedeu o limite de 2 dias e cedeu seu lugar na O.S. de ${targetOSId === 'os-june-2026' ? 'Junho/2026' : 'Julho/2026'}.`,
        timestamp: 'Agora mesmo',
        read: false
      };
      onUpdateNotifications([newAlert, ...notifications]);
    }

    alert(`O prazo expirou para ${item.sponsorName}. O lugar foi cedido ao próximo participante e a fila desta O.S. foi reorganizada!`);
  };

  // Close June/Current O.S. and transfer remaining/pending members with priority to July O.S.
  const handleCloseCotaAndTransfer = () => {
    if (!onUpdateSponsorsQueue || !onUpdateNotifications || !notifications) return;

    const currentOSObj = monthlyOS.find(o => o.id === selectedOSId);
    if (!currentOSObj) return;

    // Find next chronological O.S.
    const teamOSSorted = [...monthlyOS]
      .filter(o => o.team === currentTeam)
      .sort((a,b) => a.month.localeCompare(b.month));

    const currentIdx = teamOSSorted.findIndex(o => o.id === selectedOSId);
    let nextOSObj = currentIdx !== -1 ? teamOSSorted[currentIdx + 1] : null;

    if (!nextOSObj) {
      // Look for the seeded July OS
      nextOSObj = teamOSSorted.find(o => o.id === 'os-july-2026') || null;

      // If still missing, create a mock object
      if (!nextOSObj) {
        nextOSObj = {
          id: 'os-july-2026',
          month: '2026-07',
          meetingsCount: 4,
          dayOfWeek: 'Quarta-feira',
          dayOfWeekCode: 3,
          totalCopies: 600,
          paperType: '90g',
          costPerCopy: 6.00,
          totalCost: 3600.00,
          team: currentTeam || 'Equipe Comunicação Centro',
          dateCreated: '2026-06-05',
          maxSponsors: 4
        };
      }
    }

    const currentOSID = currentOSObj.id;
    const nextOSID = nextOSObj.id;

    const currentOSQueue = sponsorsQueue.filter(s => s.team === currentTeam && (s.osId === currentOSID || (!s.osId && currentOSID === 'os-june-2026')));
    const sortedCurrentOSQueue = [...currentOSQueue].sort((a,b) => a.position - b.position);

    const confirmedItems = sortedCurrentOSQueue.filter((s, idx) => idx < maxSpots && (s.status === 'pago' || s.status === 'aprovado'));
    const leftOutItems = sortedCurrentOSQueue.filter((s, idx) => idx >= maxSpots || s.status === 'pendente');

    if (leftOutItems.length === 0) {
      alert('Não há membros adicionais pendentes ou excedentes para transferir nesta O.S.!');
      return;
    }

    const nextOSQueue = sponsorsQueue.filter(s => s.team === currentTeam && s.osId === nextOSID);

    // Map leftOutItems to the next OS queue WITH PRIORITY (at the top)
    const transferredItems: SponsorQueueItem[] = leftOutItems.map((item, idx) => ({
      ...item,
      id: `sp-transferred-${item.id}-${Date.now()}`,
      osId: nextOSID,
      position: idx + 1, // priority index at top of the queue
      status: 'pendente', // reset to pending so they can confirm/pay in new OS
      timerDeadline: undefined, // calculate brand new timer when loaded
      hasNotifiedTimer: false // allow sending new alerts
    }));

    // Shift original/subsequent items in the next OS down
    const shiftedNextOSItems: SponsorQueueItem[] = nextOSQueue
      .filter(s => !leftOutItems.some(lo => lo.sponsorEmail === s.sponsorEmail))
      .map((item, idx) => ({
        ...item,
        position: transferredItems.length + idx + 1
      }));

    // Other items globally
    const restOfQueue = sponsorsQueue.filter(s => {
      if (s.team !== currentTeam) return true;
      if ((s.osId || 'os-june-2026') === currentOSID && confirmedItems.some(c => c.id === s.id)) return true;
      if ((s.osId || 'os-june-2026') === currentOSID && leftOutItems.some(lo => lo.id === s.id)) return false;
      if (s.osId === nextOSID) return false;
      return true;
    });

    const finalQueue = [...restOfQueue, ...transferredItems, ...shiftedNextOSItems];
    onUpdateSponsorsQueue(finalQueue);

    // Create notifications
    const newNotifications = [...notifications];
    transferredItems.forEach((item) => {
      const alertId = `not-transferred-${Date.now()}-${item.id}`;
      const newAlert: NotificationItem = {
        id: alertId,
        type: 'member',
        message: `🔄 [Prioridade] O patrocinador ${item.sponsorName} foi transferido com prioridade para a O.S. do mês seguinte (${nextOSObj.month.split('-').reverse().join('/')}) devido ao fechamento do grupo anterior.`,
        timestamp: 'Agora mesmo',
        read: false
      };
      newNotifications.unshift(newAlert);
    });

    onUpdateNotifications(newNotifications);
    setSelectedOSId(nextOSID); // Transition automatically to July view to showcase the priority transfer!
    alert(`Sucesso! O grupo de patrocinadores da pauta atual foi faturado e fechado. ${leftOutItems.length} membros excedentes foram transferidos com prioridade máxima no topo da fila da O.S. do mês de ${nextOSObj.month.split('-').reverse().join('/')}.`);
  };

  const handleJoinSponsorQueue = () => {
    if (!currentUser || !currentTeam || !onUpdateSponsorsQueue) return;

    const currentOSID = selectedOSId;
    const currentOSQueue = sponsorsQueue.filter(s => s.team === currentTeam && (s.osId === currentOSID || (!s.osId && currentOSID === 'os-june-2026')));
    const nextPosition = currentOSQueue.length + 1;

    const newQueueItem: SponsorQueueItem = {
      id: `sp-${Date.now()}`,
      sponsorName: currentUser.name,
      sponsorEmail: currentUser.email,
      position: nextPosition,
      paperType: '90g',
      copies: activeOS ? Math.ceil(activeOS.totalCopies / maxSpots) : 125,
      amount: costPerSponsor,
      status: 'pendente',
      date: new Date().toISOString().substring(0, 10),
      team: currentTeam,
      osId: currentOSID
    };

    onUpdateSponsorsQueue([...sponsorsQueue, newQueueItem]);
    alert(`Sucesso! Seu nome foi incluído na posição #${nextPosition} da Fila de Preferência da O.S. selecionada.`);
  };

  const handleDeclineSpot = (itemId: string) => {
    if (!currentTeam || !onUpdateSponsorsQueue) return;

    const targetItem = sponsorsQueue.find(s => s.id === itemId);
    if (!targetItem) return;

    const targetOSID = targetItem.osId || 'os-june-2026';

    const otherSponsors = sponsorsQueue.filter(s => s.id !== itemId && (s.team !== currentTeam || (s.osId || 'os-june-2026') !== targetOSID));
    const sameOSSponsors = sponsorsQueue.filter(s => s.id !== itemId && s.team === currentTeam && (s.osId || 'os-june-2026') === targetOSID);

    const sortedSameOS = [...sameOSSponsors].sort((a, b) => a.position - b.position);
    sortedSameOS.forEach((s, idx) => {
      s.position = idx + 1;
    });

    const declinedItem = {
      ...targetItem,
      status: 'recusado' as const,
      position: sortedSameOS.length + 1,
      timerDeadline: undefined
    };

    const finalQueue = [
      ...otherSponsors,
      ...sortedSameOS,
      declinedItem
    ];

    onUpdateSponsorsQueue(finalQueue);
    alert('Você declinou esta vaga de patrocínio. Sua oportunidade foi disponibilizada ao próximo na fila.');
  };

  const handleAcceptSpot = (item: SponsorQueueItem) => {
    onNavigateToPayment(costPerSponsor, '90g', item.copies || 125);
  };

  // Generate calendar days for June 2026 (June 2026 starts on a Monday, has 30 days)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const getDayMeeting = (day: number) => {
    const formattedDate = `2026-06-${day.toString().padStart(2, '0')}`;
    return displayMeetings.find(m => m.date === formattedDate);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome & Intro */}
      <div className="p-6 shadow-xl glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-3xl animate-in fade-in duration-300">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#E63946] bg-[#E63946]/10 px-2.5 py-1 rounded-full animate-pulse">
            {currentTeam ? `Grupo: ${currentTeam}` : 'Falta conexão com grupo'}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 mt-2">Painel de Patrocínio Local</h1>
          <p className="text-sm text-slate-500 mt-1">
            Inscreva-se na fila de patrocínio das fichas de produção da sua região e acompanhe o pagamento dos patrocinadores parceiros.
          </p>
        </div>
        {currentTeam && (
          <div>
            {!isUserAlreadyInQueue ? (
              <button
                id="btn-trigger-sponsor-modal"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#d62839] px-6 py-3 rounded-xl shadow-lg shadow-[#E63946]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Patrocinar Próxima Ficha</span>
              </button>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-emerald-600 animate-pulse" />
                Inscrição Ativa para {currentUser?.name}
              </div>
            )}
          </div>
        )}
      </div>

      {!currentTeam ? (
        <div className="space-y-6">
          {currentUser?.pendingTeamRequest ? (
            (() => {
              const pendingTeamName = currentUser.pendingTeamRequest;
              const chosenTeamObj = teams.find(t => t.name === pendingTeamName);
              const chosenCoordinator = chosenTeamObj ? users.find(u => u.role === 'coordenador' && u.team === chosenTeamObj.name) : null;
              const chosenMembersCount = chosenTeamObj ? users.filter(u => u.team === chosenTeamObj.name).length : 0;

              return (
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
                  {/* Status Box */}
                  <div className="rounded-3xl p-8 bg-amber-500/10 border border-amber-500/20 shadow-sm space-y-4 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2 animate-pulse">
                      <BadgeHelp className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800">Aguardando Aprovação de Associação</h3>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      Sua solicitação de associação ao grupo <strong>{pendingTeamName}</strong> está pendente de aprovação. O coordenador deste grupo foi notificado e revisará seu vínculo.
                    </p>
                  </div>

                  {/* Single Chosen Group Card */}
                  <div className="relative rounded-3xl p-8 shadow-xl border border-amber-200 bg-white">
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-700 animate-pulse border border-amber-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Pendente
                      </span>
                    </div>

                    <div className="mb-6">
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        Grupo Escolhido
                      </span>
                      <h4 className="text-2xl font-black text-slate-800 mt-2.5 tracking-tight">
                        {pendingTeamName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {chosenMembersCount} {chosenMembersCount === 1 ? 'membro correspondente' : 'membros correspondentes'} neste grupo local
                      </p>
                    </div>

                    <div className="space-y-4 py-4 border-y border-slate-200/50 mb-6 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Coordenador do Grupo:</span>
                        <span className="font-extrabold text-slate-800">
                          {chosenCoordinator ? chosenCoordinator.name : 'Pendente de Alocação'}
                        </span>
                      </div>
                      {chosenCoordinator && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Contato Oficial:</span>
                          <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                            {chosenCoordinator.email}
                          </span>
                        </div>
                      )}
                      {chosenTeamObj && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">ID da Filial Regional:</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {chosenTeamObj.id}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Change request option using the dropdown */}
                    <div className="space-y-3 pt-2">
                      <div className="text-center">
                        <p className="text-[11px] text-slate-400 font-medium mb-3">
                          Deseja escolher outra regional? Selecione um novo grupo abaixo:
                        </p>
                      </div>

                      <div className="relative max-w-md mx-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setIsTeamDropdownOpen(!isTeamDropdownOpen);
                            setTeamSearchQuery('');
                          }}
                          className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs text-slate-700 text-left hover:border-[#E63946] focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/10 transition-all outline-none cursor-pointer shadow-sm"
                        >
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Users className="h-4 w-4 text-[#E63946]" />
                          </div>
                          <span className="truncate">Trocar de grupo...</span>
                          {isTeamDropdownOpen ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </button>

                        {isTeamDropdownOpen && (
                          <div className="absolute z-30 mt-2 w-full rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 space-y-2 text-left animate-in fade-in duration-200">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Pesquisar grupos locais..."
                                value={teamSearchQuery}
                                onChange={(e) => setTeamSearchQuery(e.target.value)}
                                className="block w-full text-[11px] rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-slate-800 placeholder-slate-400 outline-none focus:border-[#E63946] focus:bg-white"
                              />
                            </div>

                            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                              {teams.filter(t => t.name.toLowerCase().includes(teamSearchQuery.toLowerCase())).length === 0 ? (
                                <div className="py-3 text-center text-[11px] text-slate-400 italic">
                                  Nenhum grupo encontrado.
                                </div>
                              ) : (
                                teams
                                  .filter(t => t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()))
                                  .map((t) => (
                                    <button
                                      key={t.id}
                                      type="button"
                                      onClick={() => {
                                        onJoinRequest(t.name);
                                        setIsTeamDropdownOpen(false);
                                        setTeamSearchQuery('');
                                      }}
                                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#E63946]/5 hover:text-[#E63946] transition-colors flex items-center justify-between text-slate-700"
                                    >
                                      <span>{t.name}</span>
                                      <span className="text-[10px] text-emerald-600 font-bold">Selecionar</span>
                                    </button>
                                  ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="max-w-xl mx-auto space-y-6 text-center py-10 animate-in fade-in duration-300">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-2">
                <Users className="h-6 w-6 text-[#E63946]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Associar-se a um Grupo Local</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                  Para começar, pesquise e escolha a regional onde deseja patrocinar pautas e fichas de faturamento da rede AIprint.
                </p>
              </div>

              <div className="relative max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsTeamDropdownOpen(!isTeamDropdownOpen);
                    setTeamSearchQuery('');
                  }}
                  className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-xs text-slate-800 text-left hover:border-[#E63946] focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/10 transition-all outline-none cursor-pointer shadow-sm"
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Users className="h-4 w-4 text-[#E63946]" />
                  </div>
                  <span className="truncate">Pesquisar ou selecionar grupo...</span>
                  {isTeamDropdownOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {isTeamDropdownOpen && (
                  <div className="absolute z-30 mt-2 w-full rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 space-y-2 text-left animate-in fade-in duration-200">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Pesquisar por nome de grupo..."
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        className="block w-full text-[11px] rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-slate-800 placeholder-slate-400 outline-none focus:border-[#E63946] focus:bg-white"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                      {teams.filter(t => t.name.toLowerCase().includes(teamSearchQuery.toLowerCase())).length === 0 ? (
                        <div className="py-3 text-center text-[11px] text-slate-400 italic">
                          Nenhum grupo encontrado.
                        </div>
                      ) : (
                        teams
                          .filter(t => t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()))
                          .map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                onJoinRequest(t.name);
                                setIsTeamDropdownOpen(false);
                                setTeamSearchQuery('');
                              }}
                              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#E63946]/5 hover:text-[#E63946] transition-colors flex items-center justify-between text-slate-700"
                            >
                              <span>{t.name}</span>
                              <span className="text-[10px] text-emerald-600 font-bold">Pedir Vínculo</span>
                            </button>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Group Formulation and Sponsor Payment Tracking */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* 1.1 Team validation status constraint */}
            <div className="rounded-3xl p-6 shadow-xl glass-card border border-white/40">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#E63946]" />
                Conformidade Logística
              </h3>
              
              <div className="text-xs text-slate-600 space-y-3">
                <p className="font-medium text-slate-500">
                  Para emitir fichas válidas para faturamento e impressão, cada grupo local deve cumprir a formação regulamentar:
                </p>
                
                <div className="space-y-2 border-y border-slate-200/50 py-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${hasOneCoordinator ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span>1 Coordenador Geral</span>
                    </span>
                    <strong className="text-slate-800">{coordinators.length} / 1</strong>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${hasExactlyThreeTrio ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>Exatamente 3 do Trio de Apoio</span>
                    </span>
                    <strong className="text-slate-800">{trioMembers.length} / 3</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span>Patrocinadores Conectados</span>
                    </span>
                    <strong className="text-slate-800">{sponsorMembers.length} ativos</strong>
                  </div>
                </div>

                <div className={`p-3 rounded-xl flex items-center gap-2 ${
                  isTeamValid 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50' 
                    : 'bg-amber-50 text-amber-800 border border-amber-200/50'
                }`}>
                  {isTeamValid ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-xs">Grupo Homologado</p>
                        <p className="text-[10px] opacity-90">Atende plenamente os requisitos de distribuição física.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 animate-pulse" />
                      <div>
                        <p className="font-bold text-xs">Composição Pendente</p>
                        <p className="text-[10px] opacity-90">Necessita de exatamente 1 coordenador e 3 trio de apoio.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 1.2 Patrocinadores do Mês (confirmados, que ja pagaram) */}
            <div className="rounded-3xl p-6 shadow-xl glass-card">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
                Patrocinadores do Mês
              </h3>
              <p className="text-[10px] text-slate-500 mb-3 font-medium">Marcas parceiras e patrocinadores com faturamento já liquidado para este ciclo.</p>
              
              <div className="space-y-3">
                {displaySponsors.filter(item => item.status === 'pago').length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum faturamento de cota compensado para este mês ainda.</p>
                ) : (
                  displaySponsors.filter(item => item.status === 'pago').map((member) => (
                    <div key={member.id} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{member.sponsorName}</p>
                        <p className="text-[10px] text-slate-400">{member.sponsorEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-slate-800">R$ {member.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 mt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Confirmado (Pago)
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 1.3 Fila de Preferência de Patrocinadores */}
            <div className="rounded-3xl p-6 shadow-xl glass-card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-[#E63946]" />
                  Fila de Preferência de Patrocinadores
                </h3>
              </div>
              <p className="text-[10px] text-slate-500 mb-2 leading-normal font-medium">
                Sua posição define sua prioridade de faturamento de acordo com a meta limite de <strong>{maxSpots} vagas mensais</strong>. Se declinar, sua oportunidade é repassada ao próximo.
              </p>

              {/* 📂 Seletor de Fila por O.S. • REQUISITO 1 */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fila por Ordem de Serviço (O.S.):</label>
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  {teamOSList.map(os => {
                    const isSelected = selectedOSId === os.id;
                    const count = sponsorsQueue.filter(s => s.team === currentTeam && (s.osId === os.id || (!s.osId && os.id === 'os-june-2026'))).length;
                    return (
                      <button
                        key={os.id}
                        type="button"
                        onClick={() => setSelectedOSId(os.id)}
                        className={`flex-1 min-w-[124px] px-3 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                        }`}
                      >
                        O.S. {os.month.split('-').reverse().join('/')} ({count} na Fila)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ⚡ Ação de Fechar Cota e Transferir Excedentes com Prioridade • REQUISITO 2 */}
              <div className="mb-4 p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <p className="text-[10px] font-semibold text-slate-600 mb-2 leading-normal">
                  <strong>🔄 Transferência de Prioridade (Simulador):</strong> Se o grupo fechar sem todos os membros inclusos, os excedentes serão migrados com prioridade máxima para a O.S. do mês seguinte!
                </p>
                <button
                  type="button"
                  onClick={handleCloseCotaAndTransfer}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition hover:scale-[1.01] cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5 animate-pulse" />
                  <span>Fechar Turma de {activeOS ? activeOS.month.split('-').reverse().join('/') : 'Referência'} & Transferir Excedentes</span>
                </button>
              </div>

              {/* Botão de Entrar na Fila se o usuário ainda não estiver nela */}
              {!isUserAlreadyInQueue && currentUser?.role === 'patrocinador' && (
                <button
                  onClick={handleJoinSponsorQueue}
                  className="w-full mb-4 py-2.5 rounded-xl bg-slate-900 border border-slate-950 text-white font-black text-xs flex items-center justify-center gap-1.5 transition hover:bg-[#E63946] hover:border-[#E63946] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Entrar na Fila de Preferência</span>
                </button>
              )}

              <div className="space-y-4">
                {displaySponsors.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Fila de preferências de faturamento vazia no momento.</p>
                ) : (
                  // Sort by position
                  [...displaySponsors].sort((a,b) => a.position - b.position).map((item, index) => {
                    const isCurrentUser = item.sponsorEmail === currentUser?.email;
                    // User is eligible if they are in the available slots (position <= maxSpots) and they have NOT paid yet nor declined
                    const isEligible = (index < maxSpots) && (item.status !== 'pago') && (item.status !== 'recusado');

                    const isInTheoryGuaranteed = index < maxSpots;

                    return (
                      <div 
                        key={item.id} 
                        className={`flex flex-col p-4 rounded-2xl border transition-all ${
                          isInTheoryGuaranteed
                            ? isCurrentUser 
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-400 shadow-md shadow-emerald-500/10'
                              : 'bg-emerald-500/5 border-emerald-500/20 shadow-sm'
                            : isCurrentUser 
                              ? 'bg-[#E63946]/5 border-[#E63946]/25 shadow-md shadow-[#E63946]/5' 
                              : 'bg-white/40 border-slate-150/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 text-left">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              isInTheoryGuaranteed ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' : 'bg-slate-100 text-slate-500'
                            }`}>
                              Posição #{index + 1} {isInTheoryGuaranteed ? '• Aparecerá na Folha' : '• Lista de Espera'}
                            </span>
                            <h4 className="font-extrabold text-slate-800 text-xs mt-1.5 truncate max-w-[150px]">{item.sponsorName}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">{item.sponsorEmail}</p>
                            
                            {/* Renderizar Timer de 2 dias se for qualificado • REQUISITO 3 */}
                            {item.status === 'pendente' && item.timerDeadline && isInTheoryGuaranteed && (
                              <div className="mt-2 text-left">
                                <TickingTimer 
                                  deadline={item.timerDeadline} 
                                  onExpire={() => handleForceExpireTimer(item.id)} 
                                />
                                <button
                                  type="button"
                                  onClick={() => handleForceExpireTimer(item.id)}
                                  className="mt-1 px-2.5 py-1 text-[9px] font-bold text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 rounded-md shadow-sm transition inline-block cursor-pointer"
                                >
                                  ⏳ Simular Expiração (Ceder p/ Próximo)
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-800">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <span className={`inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-full mt-1.5 uppercase ${
                              item.status === 'pago' 
                                ? 'bg-emerald-500/10 text-emerald-600' 
                                : item.status === 'recusado'
                                ? 'bg-red-500/10 text-[#E63946]'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {item.status === 'pago' ? 'Pago' : item.status === 'recusado' ? 'Recusado' : 'Aguardando'}
                            </span>
                          </div>
                        </div>

                        {/* Action notifications if the sponsor is the logged-in user and is eligible for a spot */}
                        {isCurrentUser && isEligible && (
                          <div className="mt-3.5 pt-3.5 border-t border-slate-200/50 space-y-2.5">
                            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100/30 flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                              <div className="text-[10px] text-indigo-800 leading-normal font-semibold text-left">
                                Você está no topo da fila de preferência e há uma das <strong>{maxSpots} vagas</strong> disponíveis para patrocínio neste lote!
                              </div>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <button
                                onClick={() => handleAcceptSpot(item)}
                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Quero Patrocinar
                              </button>
                              <button
                                onClick={() => handleDeclineSpot(item.id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                Negar Vaga
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Column 2: Segregated Calendar & Group Members Grid */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 2.1 Display Group Members Directory */}
            <div className="rounded-3xl p-6 shadow-xl glass-card">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-600" />
                Colegiado de Apoio Integrado do Grupo
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Coordinator card view */}
                <div className="p-4 rounded-2xl bg-white/60 border border-[#E63946]/10 flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#E63946]/15 flex items-center justify-center text-[#E63946] font-bold text-xs">CO</div>
                  <div>
                    <p className="text-xs text-[#E63946] font-bold uppercase tracking-wider">Coordenador</p>
                    <p className="text-xs font-extrabold text-slate-800">{coordinators[0]?.name || 'Nenhum definido'}</p>
                    {coordinators[0] && <p className="text-[10px] text-slate-400">{coordinators[0].email}</p>}
                  </div>
                </div>

                {/* Support Trio overview */}
                <div className="p-4 rounded-2xl bg-white/60 border border-indigo-600/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Trio de Apoio</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${hasExactlyThreeTrio ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {trioMembers.length}/3 Membros
                    </span>
                  </div>
                  {trioMembers.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">Nenhum membro do Trio de Apoio associado.</p>
                  ) : (
                    <div className="space-y-1">
                      {trioMembers.map(m => (
                        <div key={m.id} className="text-[11px] text-slate-700 bg-white/40 px-2 py-0.5 rounded border border-slate-200/30 flex justify-between">
                          <span>{m.name}</span>
                          <span className="text-[10px] text-slate-400 italic font-mono">{m.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2.2 Segregated Calendar layout */}
            <div className="rounded-3xl p-6 shadow-xl glass-card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#E63946]" />
                  Calendário Editorial do Grupo ({currentTeam})
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-white/40 px-2.5 py-1 rounded-md">
                  Agenda de Reuniões Segregadas
                </span>
              </div>

              {/* Grid Days headings */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 border-b border-white/20 pb-3 mb-3">
                <div>DOM</div>
                <div>SEG</div>
                <div>TER</div>
                <div>QUA</div>
                <div>QUI</div>
                <div>SEX</div>
                <div>SÁB</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {/* June 2026 starts on Monday. 1 empty block representing Sunday */}
                <div className="aspect-video sm:aspect-square bg-slate-50/10 rounded-lg" />
                
                {calendarDays.map((day) => {
                  const meeting = getDayMeeting(day);
                  return (
                    <div
                      key={day}
                      className={`relative aspect-video sm:aspect-square flex flex-col justify-between p-1.5 rounded-lg border transition-all ${
                        meeting 
                          ? 'bg-[#E63946] border-[#E63946] text-white shadow shadow-red-500/20' 
                          : 'bg-white/40 border-slate-200/40 text-slate-700 hover:bg-white/60'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-left">{day}</span>
                      {meeting && (
                        <span className="text-[8px] font-semibold leading-tight truncate block text-left" title={meeting.description}>
                          {meeting.description}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* COST CALCULATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative rounded-2xl border border-white/45 bg-white/95 p-6 shadow-2xl max-w-lg w-full animate-in fade-in zoom-in duration-200">
            <h4 className="text-lg font-bold text-slate-800 mb-2">Aporte de Patrocínio de Ficha</h4>
            <p className="text-xs text-slate-500 mb-6 font-medium">Os valores da cota são calculados com base no tipo de papel e volume configurados para seu grupo.</p>

            <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-100 space-y-3.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Tipo de papel definido:</span>
                <strong className="text-slate-800">{printConfig.paperType}</strong>
              </div>
              <div className="flex justify-between">
                <span>Volume de impressões:</span>
                <strong className="text-slate-800">{printConfig.defaultCopies} cópias</strong>
              </div>
              <div className="flex justify-between">
                <span>Custo base de insumo:</span>
                <strong className="text-slate-800">R$ {costPerCopy.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900">
                <span>Valor Final do Patrocínio:</span>
                <span className="text-[#E63946]">R$ {calculatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs font-semibold px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  onNavigateToPayment(calculatedTotal, printConfig.paperType, printConfig.defaultCopies);
                }}
                className="flex items-center gap-1 text-xs font-bold px-5 py-2.5 bg-[#E63946] hover:bg-[#d62839] text-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Confirmar e Proceder ao Pagamento</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
