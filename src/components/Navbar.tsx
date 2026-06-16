import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Printer, LogOut, User, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { labelPapel } from '../utils/format';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const rotaDashboard = () => {
    if (!usuario) return '/login';
    if (usuario.papel === 'admin') return '/admin';
    if (usuario.papel === 'coordenador') return '/coordenador';
    if (usuario.papel === 'trio') return '/trio';
    if (usuario.papel === 'membro') return '/membro';
    if (usuario.papel === 'producao') return '/producao';
    return '/';
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-card border-b border-white/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E63946] text-white shadow-md">
              <Printer className="h-4 w-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">AIprint</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {usuario ? (
              <>
                <Link
                  to={rotaDashboard()}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Painel
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <Link to="/perfil" className="text-right hover:opacity-75 transition-opacity">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{usuario.nome}</p>
                    <p className="text-xs text-slate-400">
                      {labelPapel(usuario.papel)}
                    </p>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#E63946] border border-slate-200 hover:border-[#E63946]/40 px-3 py-2 rounded-lg transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-4 py-2 rounded-lg shadow-md shadow-red-500/20 transition"
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-white/60"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuAberto && (
        <div className="md:hidden border-t border-white/30 bg-white/80 backdrop-blur-md px-4 py-4 space-y-2">
          {usuario ? (
            <>
              <div className="pb-3 border-b border-slate-100">
                <p className="font-bold text-slate-800">{usuario.nome}</p>
                <p className="text-xs text-slate-400">{labelPapel(usuario.papel)}</p>
              </div>
              <Link
                to={rotaDashboard()}
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-slate-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                Meu Painel
              </Link>
              <Link
                to="/perfil"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-slate-700"
              >
                <User className="h-4 w-4" />
                Meu Perfil
              </Link>
              <button
                onClick={() => { handleLogout(); setMenuAberto(false); }}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-[#E63946]"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuAberto(false)}
              className="flex items-center gap-2 py-2 text-sm font-bold text-[#E63946]"
            >
              <User className="h-4 w-4" />
              Entrar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
