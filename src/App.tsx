import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { LogOut } from 'lucide-react';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PendentePage from './pages/PendentePage';

import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import TeamsPage from './pages/admin/TeamsPage';
import SponsorsAdminPage from './pages/admin/SponsorsPage';
import ProductionAdminPage from './pages/admin/ProductionPage';
import SettingsPage from './pages/admin/SettingsPage';

import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import MembroDashboard from './pages/membro/MembroDashboard';
import TrioDashboard from './pages/trio/TrioDashboard';
import ProductionDashboard from './pages/production/ProductionDashboard';
import UserProfile from './pages/UserProfile';

function ImpersonationBanner() {
  const { usuario, impersonando, exitLoginAs } = useAuth();
  const navigate = useNavigate();

  if (!impersonando || !usuario) return null;

  const handleExit = async () => {
    await exitLoginAs();
    navigate('/admin');
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-900 shadow-md">
      <span>
        Você está visualizando como <strong>{usuario.nome}</strong> ({usuario.email})
      </span>
      <button
        onClick={handleExit}
        className="flex items-center gap-1.5 rounded-lg bg-amber-900/15 px-3 py-1 hover:bg-amber-900/25 transition-colors whitespace-nowrap"
      >
        <LogOut className="h-3.5 w-3.5" />
        Voltar para minha conta
      </button>
    </div>
  );
}

function AppRoutes() {
  const { usuario, carregando } = useAuth();
  const { pathname } = useLocation();
  const semNavbar = pathname.startsWith('/admin');
  const ehAppPage = semNavbar ||
    pathname.startsWith('/coordenador') ||
    pathname.startsWith('/membro') ||
    pathname.startsWith('/trio') ||
    pathname.startsWith('/producao') ||
    pathname.startsWith('/perfil');

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#E63946]/20 border-t-[#E63946] animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
     <div className={`relative selection:bg-[#E63946] selection:text-white flex flex-col ${ehAppPage ? 'h-screen overflow-hidden bg-white' : 'min-h-screen bg-[#F8F9FA]'}`}>
      {!ehAppPage && <div className="blob -top-40 -left-40 opacity-70 pointer-events-none" />}
      {!ehAppPage && <div className="blob top-1/2 right-0 opacity-40 pointer-events-none" />}
      {!ehAppPage && <div className="blob -bottom-40 left-10 opacity-50 pointer-events-none" />}

      <ImpersonationBanner />
      <Navbar />

      <main className={`flex-1 flex flex-col${ehAppPage ? ' overflow-y-auto' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              usuario
                ? usuario.pendente
                  ? <Navigate to="/pendente" replace />
                  : <Navigate to={usuario.papel === 'admin' ? '/admin' : usuario.papel === 'producao' ? '/producao' : '/membro'} replace />
                : <LandingPage />
            }
          />
          <Route
            path="/login"
            element={
              usuario
                ? usuario.pendente
                  ? <Navigate to="/pendente" replace />
                  : <Navigate to="/" replace />
                : <LoginPage />
            }
          />

          <Route
            path="/pendente"
            element={
              usuario
                ? <PendentePage />
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute papeis={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="equipes" element={<TeamsPage />} />
            <Route path="patrocinadores" element={<SponsorsAdminPage />} />
            <Route path="producao" element={<ProductionAdminPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>

          <Route
            path="/coordenador"
            element={
              <ProtectedRoute papeis={['coordenador']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/membro"
            element={
              <ProtectedRoute papeis={['membro', 'coordenador', 'trio']}>
                <MembroDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trio"
            element={
              <ProtectedRoute papeis={['trio']}>
                <TrioDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/producao"
            element={
              <ProtectedRoute papeis={['producao']}>
                <ProductionDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute papeis={['admin', 'coordenador', 'trio', 'membro', 'producao']}>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <AppRoutes />
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
