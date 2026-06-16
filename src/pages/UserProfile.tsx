import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, Shield, Save, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { labelPapel } from '../utils/format';

export default function UserProfile() {
  const { usuario, atualizarPerfil } = useAuth();
  const { usuarios, setUsuarios } = useStore();
  const navigate = useNavigate();

  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [telefone, setTelefone] = useState(usuario?.telefone ?? '');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  if (!usuario) {
    navigate('/login');
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome.trim()) {
      setErro('O nome não pode estar vazio.');
      return;
    }
    if (!email.trim()) {
      setErro('O e-mail não pode estar vazio.');
      return;
    }

    const emailOcupado = usuarios.some(
      u => u.id !== usuario.id && u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (emailOcupado) {
      setErro('Este e-mail já está sendo usado por outro usuário.');
      return;
    }

    setSalvando(true);
    setTimeout(() => {
      atualizarPerfil({ nome: nome.trim(), email: email.trim().toLowerCase(), telefone: telefone.trim() });
      setUsuarios(usuarios.map(u =>
        u.id === usuario.id
          ? { ...u, nome: nome.trim(), email: email.trim().toLowerCase(), telefone: telefone.trim() }
          : u
      ));
      setSalvando(false);
      setSucesso('Perfil atualizado com sucesso!');
    }, 800);
  };

  const iniciaisNome = nome.trim().substring(0, 2).toUpperCase() || 'US';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FA]">
      <div className="relative bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="blob -top-20 right-0 opacity-30 pointer-events-none" />
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Meu Perfil</h1>
            <p className="text-xs text-slate-400 mt-0.5">Mantenha seus dados de acesso atualizados.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white shadow-sm border border-slate-200 px-4 py-2 rounded-xl transition-all hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl p-8 shadow-xl glass-card border border-white/40 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-200/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E63946] text-white shadow-md shadow-[#E63946]/20 shrink-0">
              <span className="text-xl font-black">{iniciaisNome}</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base">{nome || 'Usuário'}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 bg-[#E63946]/10 text-[#E63946] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  <Shield className="h-3 w-3" />
                  {labelPapel(usuario.papel)}
                </span>
              </div>
            </div>
          </div>

          {erro && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-[#E63946] border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              {sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nome Completo / Empresa</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-3 text-xs text-slate-800 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Papel no Sistema</label>
                <div className="rounded-xl border border-slate-200/60 bg-slate-100 py-3 px-3 text-xs text-slate-500 font-semibold cursor-not-allowed">
                  {labelPapel(usuario.papel)}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Controlado pelo administrador do sistema.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">E-mail de Login</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Será usado para login após salvar.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Telefone de contato para notificações.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nova Senha (opcional)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Deixe em branco para manter a atual"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-3 text-xs text-slate-800 focus:border-[#E63946] focus:bg-white focus:ring-2 focus:ring-[#E63946]/20 transition-all outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Guarde a nova senha para logins futuros.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={salvando}
                className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-[#E63946] py-3 px-6 text-xs font-extrabold text-white shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {salvando ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
