import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, BookOpen, Truck, Award, ArrowLeft, UserPlus, Phone, Building2, Users, PlusCircle, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';

const atalhos = [
  { label: 'ADM', email: 'admin@aiprint.com', icone: Shield, cor: 'bg-red-500/10 text-red-600 hover:bg-red-500/20' },
  { label: 'Coordenador', email: 'coordenador@aiprint.com', icone: BookOpen, cor: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
  { label: 'Trio', email: 'trio@aiprint.com', icone: Award, cor: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20' },
  { label: 'Membro', email: 'membro@aiprint.com', icone: Award, cor: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20' },
  { label: 'Produção', email: 'producao@aiprint.com', icone: Truck, cor: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
];

function rotaPorPapel(papel: string): string {
  switch (papel) {
    case 'admin': return '/admin';
    case 'coordenador': return '/coordenador';
    case 'trio': return '/trio';
    case 'producao': return '/producao';
    default: return '/membro';
  }
}

export default function LoginPage() {
  const { login, registrar, registrarNovoGrupo } = useAuth();
  const { equipes } = useStore();
  const navigate = useNavigate();
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [modoRegistro, setModoRegistro] = useState<'equipe' | 'grupo'>('equipe');

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const [formCadastro, setFormCadastro] = useState({ nome: '', empresa: '', email: '', telefone: '', equipeId: '', senha: '', confirmarSenha: '' });
  const [formGrupo, setFormGrupo] = useState({ nome: '', empresa: '', email: '', telefone: '', nomeGrupo: '', regional: '', cidade: '', senha: '', confirmarSenha: '' });
  const [erroCadastro, setErroCadastro] = useState('');

  const preencherAtalho = (emailAtalho: string) => {
    setEmail(emailAtalho);
    setSenha('123456');
    setErro('');
    setModo('login');
  };

  const [enviando, setEnviando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (!email || !senha) { setErro('Preencha o e-mail e a senha.'); return; }
    setEnviando(true);
    const u = await login(email, senha);
    setEnviando(false);
    if (!u) { setErro('E-mail ou senha inválidos.'); return; }
    if (u.pendente) { navigate('/pendente'); return; }
    navigate(rotaPorPapel(u.papel));
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroCadastro('');
    const { nome, empresa, email: em, telefone, equipeId, senha: s, confirmarSenha } = formCadastro;
    if (!nome || !empresa || !em || !telefone || !equipeId || !s) { setErroCadastro('Preencha todos os campos.'); return; }
    if (s !== confirmarSenha) { setErroCadastro('As senhas não coincidem.'); return; }
    setEnviando(true);
    const novoUsuario = await registrar({ nome, empresa, email: em, telefone, equipeId });
    setEnviando(false);
    if (!novoUsuario) { setErroCadastro('Este e-mail já está cadastrado ou os dados são inválidos.'); return; }
    navigate('/pendente');
  };

  const handleCadastroGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroCadastro('');
    const { nome, empresa, email: em, telefone, nomeGrupo, regional, cidade, senha: s, confirmarSenha } = formGrupo;
    if (!nome || !empresa || !em || !telefone || !nomeGrupo || !cidade || !s) { setErroCadastro('Preencha todos os campos obrigatórios.'); return; }
    if (s !== confirmarSenha) { setErroCadastro('As senhas não coincidem.'); return; }
    setEnviando(true);
    const novoUsuario = await registrarNovoGrupo({ nome, empresa, email: em, telefone, nomeGrupo, regional, cidade });
    setEnviando(false);
    if (!novoUsuario) { setErroCadastro('Este e-mail já está cadastrado ou os dados são inválidos.'); return; }
    navigate('/pendente');
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-red-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6">
        <div className="relative rounded-3xl p-8 glass-card shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-2xl overflow-hidden border border-slate-200/60 mb-8">
            <button
              onClick={() => { setModo('login'); setErro(''); }}
              className={`flex-1 py-3 text-sm font-bold transition-all ${modo === 'login' ? 'bg-[#E63946] text-white' : 'text-slate-500 hover:text-slate-800 bg-white/50'}`}
            >
              <LogIn className="h-4 w-4 inline mr-1.5" />
              Entrar
            </button>
            <button
              onClick={() => { setModo('cadastro'); setSenha(''); setErro(''); }}
              className={`flex-1 py-3 text-sm font-bold transition-all ${modo === 'cadastro' ? 'bg-[#E63946] text-white' : 'text-slate-500 hover:text-slate-800 bg-white/50'}`}
            >
              <UserPlus className="h-4 w-4 inline mr-1.5" />
              Criar Conta
            </button>
          </div>

          {modo === 'login' ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Acesse sua conta</h2>
                <p className="mt-1 text-sm text-slate-500">Inicie sessão com seu e-mail cadastrado</p>
              </div>

              {erro && (
                <div className="rounded-xl bg-red-50 p-3.5 mb-6 text-sm font-semibold text-red-700 border border-red-200">{erro}</div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
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
                <button type="submit" disabled={enviando} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E63946]/20 hover:bg-[#d62839] hover:shadow-xl transition-all active:scale-95 mt-2 disabled:opacity-60">
                  {enviando ? <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <LogIn className="h-4 w-4" />}
                  {enviando ? 'Entrando...' : 'Entrar no Sistema'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Criar nova conta</h2>
              </div>

              {/* Toggle equipe/grupo */}
              <div className="flex rounded-2xl overflow-hidden border border-slate-200/60 mb-6">
                <button
                  type="button"
                  onClick={() => { setModoRegistro('equipe'); setErroCadastro(''); }}
                  className={`flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${modoRegistro === 'equipe' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800 bg-white/50'}`}
                >
                  <Users className="h-4 w-4" />
                  Entrar em Equipe
                </button>
                <button
                  type="button"
                  onClick={() => { setModoRegistro('grupo'); setErroCadastro(''); }}
                  className={`flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${modoRegistro === 'grupo' ? 'bg-[#E63946] text-white' : 'text-slate-500 hover:text-slate-800 bg-white/50'}`}
                >
                  <PlusCircle className="h-4 w-4" />
                  Criar Novo Grupo
                </button>
              </div>

              {erroCadastro && (
                <div className="rounded-xl bg-red-50 p-3.5 mb-4 text-sm font-semibold text-red-700 border border-red-200">{erroCadastro}</div>
              )}

              {modoRegistro === 'equipe' ? (
                <form onSubmit={handleCadastro} className="space-y-4">
                  <p className="text-xs text-slate-500 -mt-2 mb-2">Após o cadastro, aguarde aprovação do coordenador.</p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nome Completo</label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="text" required value={formCadastro.nome} onChange={e => setFormCadastro({ ...formCadastro, nome: e.target.value })} placeholder="Seu nome" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Empresa</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="text" required value={formCadastro.empresa} onChange={e => setFormCadastro({ ...formCadastro, empresa: e.target.value })} placeholder="Nome da sua empresa" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="email" required value={formCadastro.email} onChange={e => setFormCadastro({ ...formCadastro, email: e.target.value })} placeholder="seu@email.com" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Telefone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="tel" required value={formCadastro.telefone} onChange={e => setFormCadastro({ ...formCadastro, telefone: e.target.value })} placeholder="(11) 99999-0000" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Grupo / Equipe</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <select required value={formCadastro.equipeId} onChange={e => setFormCadastro({ ...formCadastro, equipeId: e.target.value })} className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 focus:border-[#E63946] focus:bg-white outline-none transition appearance-none">
                        <option value="">Selecione sua equipe</option>
                        {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome} — {eq.cidade}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="password" required value={formCadastro.senha} onChange={e => setFormCadastro({ ...formCadastro, senha: e.target.value })} placeholder="••••••••" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="password" required value={formCadastro.confirmarSenha} onChange={e => setFormCadastro({ ...formCadastro, confirmarSenha: e.target.value })} placeholder="••••••••" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                    </div>
                  </div>
                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E63946]/20 hover:bg-[#d62839] transition-all active:scale-95 mt-2">
                    <UserPlus className="h-4 w-4" />
                    Solicitar Cadastro
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCadastroGrupo} className="space-y-4">
                  <p className="text-xs text-slate-500 -mt-2 mb-2">O administrador da plataforma receberá e aprovará a criação do grupo. Você será definido como coordenador.</p>

                  <div className="rounded-xl bg-[#E63946]/5 border border-[#E63946]/20 p-3 space-y-3">
                    <p className="text-[10px] font-bold text-[#E63946] uppercase tracking-widest">Dados do Novo Grupo</p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nome do Grupo *</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="text" required value={formGrupo.nomeGrupo} onChange={e => setFormGrupo({ ...formGrupo, nomeGrupo: e.target.value })} placeholder="Ex: BNI Liderança Norte" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Cidade / UF *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <input type="text" required value={formGrupo.cidade} onChange={e => setFormGrupo({ ...formGrupo, cidade: e.target.value })} placeholder="São Paulo/SP" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Regional</label>
                        <input type="text" value={formGrupo.regional} onChange={e => setFormGrupo({ ...formGrupo, regional: e.target.value })} placeholder="Regional Norte" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seus Dados</p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nome Completo *</label>
                      <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="text" required value={formGrupo.nome} onChange={e => setFormGrupo({ ...formGrupo, nome: e.target.value })} placeholder="Seu nome" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Empresa *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="text" required value={formGrupo.empresa} onChange={e => setFormGrupo({ ...formGrupo, empresa: e.target.value })} placeholder="Nome da sua empresa" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">E-mail *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="email" required value={formGrupo.email} onChange={e => setFormGrupo({ ...formGrupo, email: e.target.value })} placeholder="seu@email.com" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Telefone / WhatsApp *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="tel" required value={formGrupo.telefone} onChange={e => setFormGrupo({ ...formGrupo, telefone: e.target.value })} placeholder="(11) 99999-0000" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Senha *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <input type="password" required value={formGrupo.senha} onChange={e => setFormGrupo({ ...formGrupo, senha: e.target.value })} placeholder="••••••••" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Confirmar *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <input type="password" required value={formGrupo.confirmarSenha} onChange={e => setFormGrupo({ ...formGrupo, confirmarSenha: e.target.value })} placeholder="••••••••" className="block w-full rounded-xl border border-white/40 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#E63946] focus:bg-white outline-none transition" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E63946]/20 hover:bg-[#d62839] transition-all active:scale-95">
                    <PlusCircle className="h-4 w-4" />
                    Solicitar Criação do Grupo
                  </button>
                </form>
              )}
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar à página inicial
            </Link>
          </div>
        </div>

        <div className="rounded-3xl p-6 glass-card shadow-xl">
          <h3 className="text-sm font-bold text-slate-700 mb-4 text-center">Acesso Rápido para Demonstração</h3>
          <div className="grid grid-cols-2 gap-3">
            {atalhos.map(a => {
              const Icone = a.icone;
              return (
                <button key={a.label} onClick={() => preencherAtalho(a.email)} className={`flex items-center gap-2.5 p-3 rounded-xl border border-white/30 text-left transition-all hover:scale-[1.02] shadow-sm ${a.cor}`}>
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
            Senha padrão: <strong className="text-[#E63946]">123456</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
