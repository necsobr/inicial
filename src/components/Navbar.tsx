import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Printer, LogOut, User, Menu, X, LayoutDashboard,
  Layers, Crown, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { labelPapel } from '../utils/format';
import type { UserRole } from '../types';

type Painel = { label: string; path: string; Icone: React.ElementType };

function paineisPorPapel(papel: UserRole): Painel[] {
  const lista: Painel[] = [];
  if (['membro', 'coordenador', 'trio'].includes(papel)) {
    lista.push({ label: 'Meu Painel', path: '/membro', Icone: User });
  }
  if (papel === 'coordenador') lista.push({ label: 'Coordenação', path: '/coordenador', Icone: Layers });
  if (papel === 'trio') lista.push({ label: 'Trio', path: '/trio', Icone: Crown });
  if (papel === 'admin') lista.push({ label: 'Administração', path: '/admin', Icone: LayoutDashboard });
  if (papel === 'producao') lista.push({ label: 'Produção', path: '/producao', Icone: Printer });
  return lista;
}

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const paineis = usuario ? paineisPorPapel(usuario.papel) : [];

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPainelAberto(false);
      }
    }
    document.addEventListener('mousedown', fechar);
    return () => document.removeEventListener('mousedown', fechar);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
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

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {usuario ? (
              <>
                {/* Botão Painel */}
                {paineis.length === 1 ? (
                  <Link
                    to={paineis[0].path}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Painel
                  </Link>
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setPainelAberto(v => !v)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Painel
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${painelAberto ? 'rotate-180' : ''}`} />
                    </button>
                    {painelAberto && (
                      <div className="absolute left-0 top-full mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 py-1 z-50">
                        {paineis.map(p => {
                          const Icone = p.Icone;
                          return (
                            <Link
                              key={p.path}
                              to={p.path}
                              onClick={() => setPainelAberto(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#E63946] transition"
                            >
                              <Icone className="h-4 w-4" />
                              {p.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <Link to="/perfil" className="text-right hover:opacity-75 transition-opacity">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{usuario.nome}</p>
                    <p className="text-xs text-slate-400">{labelPapel(usuario.papel)}</p>
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
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-4 py-2 rounded-lg shadow-md shadow-red-500/20 transition"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
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

      {/* Mobile menu */}
      {menuAberto && (
        <div className="md:hidden border-t border-white/30 bg-white/80 backdrop-blur-md px-4 py-4 space-y-1">
          {usuario ? (
            <>
              <div className="pb-3 mb-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">{usuario.nome}</p>
                <p className="text-xs text-slate-400">{labelPapel(usuario.papel)}</p>
              </div>
              {paineis.map(p => {
                const Icone = p.Icone;
                return (
                  <Link
                    key={p.path}
                    to={p.path}
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Icone className="h-4 w-4" />
                    {p.label}
                  </Link>
                );
              })}
              <Link
                to="/perfil"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                Meu Perfil
              </Link>
              <button
                onClick={() => { handleLogout(); setMenuAberto(false); }}
                className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-sm font-semibold text-[#E63946] w-full"
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
