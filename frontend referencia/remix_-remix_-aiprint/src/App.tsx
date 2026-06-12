/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import SponsorDashboard from './components/SponsorDashboard';
import PaymentScreen from './components/PaymentScreen';
import CoordinatorDashboard from './components/CoordinatorDashboard';
import ProductionDashboard from './components/ProductionDashboard';
import TrioDashboard from './components/TrioDashboard';
import UserProfile from './components/UserProfile';
import { Sparkles } from 'lucide-react';

import { 
  User, Team, PrintAPI, Meeting, PrintOrder, 
  SponsorQueueItem, NotificationItem, PrintConfig, MonthlyOS 
} from './types';

import { 
  initLocalStorage, getStored, setStored, 
  DEFAULT_USERS, INITIAL_TEAMS, INITIAL_APIS, 
  INITIAL_MEETINGS, INITIAL_CONFIG, INITIAL_SPONSORS_QUEUE, 
  INITIAL_ORDERS, INITIAL_NOTIFICATIONS, INITIAL_MONTHLY_OS
} from './mockData';

export default function App() {
  // Shared application states loaded dynamically of localStorage or mock fallbacks
  const [users, setUsers] = useState<User[]>(() => { initLocalStorage(); return getStored('users', DEFAULT_USERS); });
  const [teams, setTeams] = useState<Team[]>(() => { initLocalStorage(); return getStored('teams', INITIAL_TEAMS); });
  const [apis, setApis] = useState<PrintAPI[]>(() => { initLocalStorage(); return getStored('apis', INITIAL_APIS); });
  const [meetings, setMeetings] = useState<Meeting[]>(() => { initLocalStorage(); return getStored('meetings', INITIAL_MEETINGS); });
  const [printConfig, setPrintConfig] = useState<PrintConfig>(() => { initLocalStorage(); return getStored('config', INITIAL_CONFIG); });
  const [sponsorsQueue, setSponsorsQueue] = useState<SponsorQueueItem[]>(() => { initLocalStorage(); return getStored('sponsors_queue', INITIAL_SPONSORS_QUEUE); });
  const [orders, setOrders] = useState<PrintOrder[]>(() => { initLocalStorage(); return getStored('orders', INITIAL_ORDERS); });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => { initLocalStorage(); return getStored('notifications', INITIAL_NOTIFICATIONS); });
  const [monthlyOS, setMonthlyOS] = useState<MonthlyOS[]>(() => { initLocalStorage(); return getStored('monthly_os', INITIAL_MONTHLY_OS); });

  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedSession = localStorage.getItem('aiprint_current_user');
    if (storedSession) {
      try {
        return JSON.parse(storedSession) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<string>('landing');
  const [trioActiveTab, setTrioActiveTab] = useState<'membro' | 'trio'>('membro');

  // Simulated Payment Budget details passed from Sponsor -> checkout Form
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentPaperType, setPaymentPaperType] = useState<string>('');
  const [paymentCopies, setPaymentCopies] = useState<number>(0);

  // Automated routine to scan meetings and alert Trio if coordinator has not submitted print/PDF orders
  useEffect(() => {
    // Current date (June 8, 2026 is our reference from metadata)
    const today = new Date('2026-06-08T12:00:00Z');
    today.setUTCHours(0, 0, 0, 0);

    setNotifications((prevNotifications) => {
      let updated = false;
      const newNotifications = [...prevNotifications];

      meetings.forEach((meeting) => {
        // Find if there is any print order/pdf submitted with a deadline matching this meeting
        const hasOrder = orders.some((o) => o.deadlineMeetingId === meeting.id);
        if (hasOrder) return; // Already has order, no notification needed

        // Compute day distance between mock today and meeting date
        const [year, month, day] = meeting.date.split('-').map(Number);
        const meetingDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
        meetingDate.setUTCHours(0, 0, 0, 0);

        const diffTime = meetingDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // 1-day remaining warning notification
        if (diffDays === 1) {
          const notifId = `not-1day-missing-${meeting.id}`;
          const alreadyExists = prevNotifications.some((n) => n.id === notifId);
          if (!alreadyExists) {
            const newAlert: NotificationItem = {
              id: notifId,
              type: 'system',
              message: `⚠️ [Aviso de Prazo] O Coordenador ainda não enviou nenhum PDF para a reunião de amanhã (${meeting.date.split('-').reverse().join('/')} - "${meeting.description || 'Pauta Editorial'}"). O Trio de Apoio deve cobrar a entrega!`,
              timestamp: 'Hoje, 08:00',
              read: false
            };
            newNotifications.unshift(newAlert);
            updated = true;
          }
        }

        // Same-day deadline notification
        if (diffDays === 0) {
          const notifId = `not-today-missing-${meeting.id}`;
          const alreadyExists = prevNotifications.some((n) => n.id === notifId);
          if (!alreadyExists) {
            const newAlert: NotificationItem = {
              id: notifId,
              type: 'system',
              message: `🚨 [URGENTE] Hoje é o prazo final! O Coordenador não realizou nenhuma entrega de PDF da ficha de produção para a reunião de hoje (${meeting.date.split('-').reverse().join('/')} - "${meeting.description || 'Pauta Editorial'}").`,
              timestamp: 'Hoje, 07:00',
              read: false
            };
            newNotifications.unshift(newAlert);
            updated = true;
          }
        }
      });

      if (updated) {
        localStorage.setItem('aiprint_notifications', JSON.stringify(newNotifications));
        return newNotifications;
      }
      return prevNotifications;
    });
  }, [meetings, orders]);

  // Sync state modifications to local storage
  const updateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    setStored('users', newUsers);
    if (currentUser) {
      const match = newUsers.find(u => u.id === currentUser.id);
      if (match && (match.role !== currentUser.role || match.team !== currentUser.team || match.pendingTeamRequest !== currentUser.pendingTeamRequest)) {
        setCurrentUser(match);
        localStorage.setItem('aiprint_current_user', JSON.stringify(match));
      }
    }
  };

  const updateTeams = (newTeams: Team[]) => {
    setTeams(newTeams);
    setStored('teams', newTeams);
  };

  const updateApis = (newApis: PrintAPI[]) => {
    setApis(newApis);
    setStored('apis', newApis);
  };

  const updateMeetings = (newMeetings: Meeting[]) => {
    setMeetings(newMeetings);
    setStored('meetings', newMeetings);
  };

  const updatePrintConfig = (newConfig: PrintConfig) => {
    setPrintConfig(newConfig);
    setStored('config', newConfig);

    // Trigger an audit notification automatically
    const alertId = `not-${Date.now()}`;
    const newAlert: NotificationItem = {
      id: alertId,
      type: 'system',
      message: `Configuração de lote atualizada para ${newConfig.paperType} (${newConfig.defaultCopies} unidades).`,
      timestamp: 'Agora mesmo',
      read: false
    };
    const updatedAlerts = [newAlert, ...notifications];
    setNotifications(updatedAlerts);
    setStored('notifications', updatedAlerts);
  };

  const updateSponsorsQueue = (newQueue: SponsorQueueItem[]) => {
    setSponsorsQueue(newQueue);
    setStored('sponsors_queue', newQueue);
  };

  const updateOrders = (newOrders: PrintOrder[]) => {
    setOrders(newOrders);
    setStored('orders', newOrders);
  };

  const updateNotifications = (newNotificationList: NotificationItem[]) => {
    setNotifications(newNotificationList);
    setStored('notifications', newNotificationList);
  };

  const updateMonthlyOS = (newOSList: MonthlyOS[]) => {
    setMonthlyOS(newOSList);
    setStored('monthly_os', newOSList);
  };

  // Login handler
  const handleLogin = (email: string, role: string): boolean => {
    // Find of existing user list
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Fallback automatic create if logins shortcut was clicked but user deleted
    if (!user) {
      const defaultUserFound = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (defaultUserFound) {
        user = defaultUserFound;
        const expandedUsersList = [...users, defaultUserFound];
        setUsers(expandedUsersList);
        setStored('users', expandedUsersList);
      }
    }

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('aiprint_current_user', JSON.stringify(user));
      
      // Navigate to correct dashboard based on priority
      if (user.role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('dashboard');
      }

      // Add a system notification
      const alertId = `not-${Date.now()}`;
      const newAlert: NotificationItem = {
        id: alertId,
        type: 'member',
        message: `${user.name} ingressou na sessão do AIprint.`,
        timestamp: 'Agora mesmo',
        read: false
      };
      const updatedAlerts = [newAlert, ...notifications];
      setNotifications(updatedAlerts);
      setStored('notifications', updatedAlerts);

      return true;
    }
    return false;
  };

  // Logout handler
  const handleLogout = () => {
    if (currentUser) {
      const alertId = `not-${Date.now()}`;
      const newAlert: NotificationItem = {
        id: alertId,
        type: 'member',
        message: `${currentUser.name} fez logout do sistema.`,
        timestamp: 'Agora mesmo',
        read: false
      };
      const updatedAlerts = [newAlert, ...notifications];
      setNotifications(updatedAlerts);
      setStored('notifications', updatedAlerts);
    }

    setCurrentUser(null);
    localStorage.removeItem('aiprint_current_user');
    setCurrentView('landing');
  };

  // Router dispatcher
  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  // Trigger payment checkout
  const handleNavigateToPayment = (amount: number, paperType: string, copies: number) => {
    setPaymentAmount(amount);
    setPaymentPaperType(paperType);
    setPaymentCopies(copies);
    setCurrentView('payment');
  };

  // Request join a team/group
  const handleJoinTeam = (teamName: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
        return { ...u, pendingTeamRequest: teamName };
      }
      return u;
    });
    updateUsers(updatedUsers);

    const updatedProfile = { ...currentUser, pendingTeamRequest: teamName };
    setCurrentUser(updatedProfile);
    localStorage.setItem('aiprint_current_user', JSON.stringify(updatedProfile));

    const alertId = `not-${Date.now()}`;
    const newAlert: NotificationItem = {
      id: alertId,
      type: 'member',
      message: `${currentUser.name} solicitou associação ao grupo "${teamName}".`,
      timestamp: 'Agora mesmo',
      read: false
    };
    const updatedAlerts = [newAlert, ...notifications];
    setNotifications(updatedAlerts);
    setStored('notifications', updatedAlerts);
    alert(`Sua solicitação de associação ao grupo "${teamName}" foi enviada com sucesso! O coordenador será notificado.`);
  };

  // Successful payment callback to insert partner in sponsors list
  const handlePaymentSuccess = () => {
    if (!currentUser) return;

    // Check if user already has an item in sponsorsQueue for their team
    const hasExisting = sponsorsQueue.find(
      s => s.sponsorEmail.toLowerCase() === currentUser.email.toLowerCase() && s.team === currentUser.team
    );

    let updatedQueue;
    if (hasExisting) {
      updatedQueue = sponsorsQueue.map(s => {
        if (s.id === hasExisting.id) {
          return { ...s, status: 'pago' as const, amount: paymentAmount };
        }
        return s;
      });
    } else {
      const nextPosition = sponsorsQueue.length + 1;
      const newSponsorItem: SponsorQueueItem = {
        id: `sp-${Date.now()}`,
        sponsorName: currentUser.name,
        sponsorEmail: currentUser.email,
        position: nextPosition,
        paperType: paymentPaperType,
        copies: paymentCopies,
        amount: paymentAmount,
        status: 'pago',
        date: new Date().toISOString().substring(0, 10),
        team: currentUser.team
      };
      updatedQueue = [...sponsorsQueue, newSponsorItem];
    }
    updateSponsorsQueue(updatedQueue);

    // Send a real notification block
    const alertId = `not-${Date.now()}`;
    const newAlert: NotificationItem = {
      id: alertId,
      type: 'sponsor',
      message: `Novo patrocinador "${currentUser.name}" pagou o aporte de R$ ${paymentAmount.toLocaleString('pt-BR')}!`,
      timestamp: 'Agora mesmo',
      read: false
    };
    const updatedAlerts = [newAlert, ...notifications];
    setNotifications(updatedAlerts);
    setStored('notifications', updatedAlerts);

    setCurrentView('dashboard');
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] overflow-x-hidden font-sans text-slate-800 selection:bg-[#E63946] selection:text-white flex flex-col">
      {/* Beautiful background gradient blobs for the Professional Polish theme */}
      <div className="blob -top-40 -left-40 opacity-80 pointer-events-none"></div>
      <div className="blob top-1/2 right-0 md:right-10 opacity-50 pointer-events-none"></div>
      <div className="blob -bottom-40 left-10 opacity-60 pointer-events-none"></div>

      {/* Dynamic Navigation */}
      <Navbar 
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentView={currentView}
        hasAdminAccess={currentUser?.role === 'admin'}
        unreadCount={unreadCount}
      />

      {/* Primary Application layout */}
      <main className="flex-grow flex flex-col">
        {currentView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={currentUser !== null} />
        )}

        {currentView === 'login' && (
          <LoginScreen 
            onLogin={handleLogin} 
            users={users}
            teams={teams}
            onRegister={(newUser: User) => updateUsers([...users, newUser])}
          />
        )}

        {currentView === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel 
            users={users}
            onUpdateUsers={updateUsers}
            teams={teams}
            onUpdateTeams={updateTeams}
            apis={apis}
            onUpdateApis={updateApis}
            orders={orders}
            sponsors={sponsorsQueue}
          />
        )}

        {currentView === 'payment' && (currentUser?.role === 'patrocinador' || currentUser?.role === 'trio') && (
          <PaymentScreen 
            amount={paymentAmount}
            paperType={paymentPaperType}
            copies={paymentCopies}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {/* Dynamic Multi-role dashboard selection */}
        {currentView === 'dashboard' && currentUser && (
          <div className="animate-in fade-in duration-300">
            {currentUser.role === 'admin' && (
              <div className="text-center py-20 px-4">
                <p className="text-slate-400 font-mono text-xs">Aviso de redirecionador</p>
                <h2 className="text-2xl font-bold text-slate-800 mt-2">Você está logado como Administrador.</h2>
                <button
                  id="btn-admin-panel-redirect-app"
                  onClick={() => setCurrentView('admin')}
                  className="mt-6 inline-flex px-6 py-3 bg-[#E63946] text-white font-bold rounded-xl"
                >
                  Entrar no Painel ADM
                </button>
              </div>
            )}

            {currentUser.role === 'patrocinador' && (
              <SponsorDashboard 
                meetings={meetings}
                sponsorsQueue={sponsorsQueue}
                onUpdateSponsorsQueue={updateSponsorsQueue}
                printConfig={printConfig}
                currentUser={currentUser}
                users={users}
                onNavigateToPayment={handleNavigateToPayment}
                teams={teams}
                monthlyOS={monthlyOS}
                onJoinRequest={handleJoinTeam}
                notifications={notifications}
                onUpdateNotifications={updateNotifications}
              />
            )}

            {currentUser.role === 'coordenador' && (
              <CoordinatorDashboard 
                meetings={meetings}
                onUpdateMeetings={updateMeetings}
                printConfig={printConfig}
                onUpdatePrintConfig={updatePrintConfig}
                sponsorsQueue={sponsorsQueue}
                onUpdateSponsorsQueue={updateSponsorsQueue}
                orders={orders}
                onUpdateOrders={updateOrders}
                users={users}
                onUpdateUsers={updateUsers}
                currentUser={currentUser}
                teams={teams}
                onUpdateTeams={updateTeams}
                notifications={notifications}
                onUpdateNotifications={updateNotifications}
                monthlyOS={monthlyOS}
                onUpdateMonthlyOS={updateMonthlyOS}
              />
            )}

            {currentUser.role === 'producao' && (
              <ProductionDashboard 
                orders={orders}
                onUpdateOrders={updateOrders}
              />
            )}

            {currentUser.role === 'trio' && (
              <div className="space-y-6">
                {/* Beautiful Modern Toggle Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200/60 p-4 rounded-3xl shadow-sm gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-805 uppercase tracking-wider flex items-center gap-1.5 text-indigo-600">
                      <Sparkles className="h-4 w-4" />
                      Painel Duplo (Trio de Apoio)
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Como integrante do Trio de Apoio, você pode tanto cooperar lendo/limpando alertas quanto patrocinar fichas regionais.</p>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
                    <button
                      onClick={() => setTrioActiveTab('membro')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        trioActiveTab === 'membro' 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      Interface de Membro
                    </button>
                    <button
                      onClick={() => setTrioActiveTab('trio')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        trioActiveTab === 'trio' 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      Painel do Trio de Apoio
                    </button>
                  </div>
                </div>

                {trioActiveTab === 'membro' ? (
                  <SponsorDashboard 
                    meetings={meetings}
                    sponsorsQueue={sponsorsQueue}
                    onUpdateSponsorsQueue={updateSponsorsQueue}
                    printConfig={printConfig}
                    currentUser={currentUser}
                    users={users}
                    onNavigateToPayment={handleNavigateToPayment}
                    teams={teams}
                    monthlyOS={monthlyOS}
                    onJoinRequest={handleJoinTeam}
                    notifications={notifications}
                    onUpdateNotifications={updateNotifications}
                  />
                ) : (
                  <TrioDashboard 
                    notifications={notifications}
                    onUpdateNotifications={updateNotifications}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {currentView === 'profile' && currentUser && (
          <UserProfile 
            currentUser={currentUser}
            users={users}
            onUpdateProfile={(updatedUser: User) => {
              const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
              updateUsers(updatedUsers);
              setCurrentUser(updatedUser);
              localStorage.setItem('aiprint_current_user', JSON.stringify(updatedUser));
            }}
            onBackToDashboard={() => {
              if (currentUser.role === 'admin') {
                setCurrentView('admin');
              } else {
                setCurrentView('dashboard');
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
