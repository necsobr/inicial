import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Layers, DollarSign, Printer, Settings, Menu, X, LogOut, MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { to: '/admin', icone: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/usuarios', icone: Users, label: 'Usuários' },
  { to: '/admin/equipes', icone: Layers, label: 'Gestores e Equipes' },
  { to: '/admin/patrocinadores', icone: DollarSign, label: 'Patrocinadores' },
  { to: '/admin/producao', icone: Printer, label: 'Produção' },
  { to: '/admin/whatsapp', icone: MessageCircle, label: 'Mensagens WhatsApp' },
  { to: '/admin/configuracoes', icone: Settings, label: 'Configurações' },
];

export default function AdminLayout() {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Overlay mobile */}
      {sidebarAberta && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300
        ${sidebarAberta ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E63946] text-white shadow-md shrink-0">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">AIprint</p>
              <p className="text-[10px] font-bold text-[#E63946] uppercase tracking-wider">Administração</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarAberta(false)}>
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map(l => {
            const Icone = l.icone;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.exact}
                onClick={() => setSidebarAberta(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icone className="h-4 w-4 shrink-0" />
                {l.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Usuário + logout */}
        <div className="border-t border-slate-100 px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{usuario?.nome}</p>
            <p className="text-xs text-slate-400">Administrador</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 rounded-lg text-slate-400 hover:text-[#E63946] hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white sticky top-0 z-20">
          <button
            onClick={() => setSidebarAberta(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-slate-700">Menu</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
