import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

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

function AppRoutes() {
  const { usuario, carregando } = useAuth();

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
    <div className="relative min-h-screen bg-[#F8F9FA] selection:bg-[#E63946] selection:text-white flex flex-col">
      <div className="blob -top-40 -left-40 opacity-70 pointer-events-none" />
      <div className="blob top-1/2 right-0 opacity-40 pointer-events-none" />
      <div className="blob -bottom-40 left-10 opacity-50 pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex flex-col">
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
