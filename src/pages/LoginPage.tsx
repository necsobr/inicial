import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, BookOpen, Truck, Award, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const atalhos = [
  { label: 'ADM', email: 'admin@aiprint.com', icone: Shield, cor: 'bg-red-500/10 text-red-600 hover:bg-red-500/20' },
  { label: 'Coordenador', email: 'coordenador@aiprint.com', icone: BookOpen, cor: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
  { label: 'Trio', email: 'trio@aiprint.com', icone: Award, cor: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20' },
  { label: 'Membro', email: 'membro@aiprint.com', icone: Award, cor: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20' },
  { label: 'Produção', email: 'producao@aiprint.com', icone: Truck, cor: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const preencherAtalho = (emailAtalho: string) => {
    setEmail(emailAtalho);
    setSenha('123456');
    setErro('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (!email || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    const ok = login(email, senha);
    if (!ok) {
      setErro('E-mail ou senha inválidos. A senha padrão é 123456.');
      return;
    }
    const u = email.toLowerCase();
    if (u.includes('admin') || u === 'admin@aiprint.com') return navigate('/admin');
    if (u === 'coordenador@aiprint.com' || u.includes('gestor')) return navigate('/coordenador');
    if (u === 'trio@aiprint.com') return navigate('/trio');
    if (u === 'membro@aiprint.com') return navigate('/membro');
    if (u === 'producao@aiprint.com') return navigate('/producao');
    navigate('/');
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-red-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6">
        <div className="relative rounded-3xl p-8 glass-card shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Acesse sua conta</h2>
            <p className="mt-1 text-sm text-slate-500">Inicie sessão com seu e-mail cadastrado</p>
          </div>

          {erro && (
            <div className="rounded-xl bg-red-50 p-3.5 mb-6 text-sm font-semibold text-red-700 border border-red-200">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="exemplo@aiprint.com"
                  className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E63946]/20 hover:bg-[#d62839] hover:shadow-xl transition-all active:scale-95 mt-2"
            >
              <LogIn className="h-4 w-4" />
              Entrar no Sistema
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar à página inicial
            </Link>
          </div>
        </div>

        {/* Card de acesso rápido para demonstração */}
        <div className="rounded-3xl p-6 glass-card shadow-xl">
          <h3 className="text-sm font-bold text-slate-700 mb-4 text-center">
            Acesso Rápido para Demonstração
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {atalhos.map(a => {
              const Icone = a.icone;
              return (
                <button
                  key={a.label}
                  onClick={() => preencherAtalho(a.email)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border border-white/30 text-left transition-all hover:scale-[1.02] shadow-sm ${a.cor}`}
                >
                  <Icone className="h-5 w-5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold leading-tight">{a.label}</div>
                    <div className="text-xs text-slate-400 truncate">{a.email.split('@')[0]}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Senha padrão para todos: <strong className="text-[#E63946]">123456</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
