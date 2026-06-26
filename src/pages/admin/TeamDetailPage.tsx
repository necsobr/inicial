import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CheckCircle, MapPin, Users, LogIn } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/Modal';
import { labelPapel, formatarMoeda } from '../../utils/format';
import { usuarioService } from '../../services/storeService';
import type { Usuario, UserRole } from '../../types';

const badgePapel: Record<string, string> = {
  admin:       'bg-red-100 text-red-700',
  coordenador: 'bg-emerald-100 text-emerald-700',
  trio:        'bg-violet-100 text-violet-700',
  membro:      'bg-indigo-100 text-indigo-700',
  producao:    'bg-amber-100 text-amber-700',
};

interface FormData {
  nome: string; email: string; telefone: string; empresa: string; papel: UserRole;
}

const formVazio: FormData = { nome: '', email: '', telefone: '', empresa: '', papel: 'membro' };

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { equipes, usuarios, setUsuarios } = useStore();
  const { loginComo } = useAuth();

  const equipe = equipes.find(e => e.id === id);
  const membrosEquipe = usuarios.filter(u => u.equipeId === id);

  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormData>(formVazio);
  const [modalAberto, setModalAberto] = useState(false);

  if (!equipe) {
    return (
      <div className="p-8 text-center text-slate-400">
        Equipe não encontrada.{' '}
        <button onClick={() => navigate('/admin/equipes')} className="text-[#E63946] font-semibold">Voltar</button>
      </div>
    );
  }

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setForm({ nome: u.nome, email: u.email, telefone: u.telefone ?? '', empresa: u.empresa ?? '', papel: u.papel });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!editando) return;
    try {
      const atualizado = await usuarioService.atualizar(editando.id, {
        nome: form.nome, email: form.email,
        telefone: form.telefone || undefined, empresa: form.empresa || undefined,
        papel: form.papel,
      });
      setUsuarios(usuarios.map(u => u.id === editando.id ? atualizado : u));
      setModalAberto(false);
    } catch {}
  };

  const alternarStatus = async (u: Usuario) => {
    try {
      const atualizado = await usuarioService.atualizar(u.id, { ativo: !u.ativo });
      setUsuarios(usuarios.map(x => x.id === u.id ? atualizado : x));
    } catch {}
  };

  const removerDaEquipe = async (u: Usuario) => {
    if (!confirm(`Remover ${u.nome} desta equipe?`)) return;
    try {
      const atualizado = await usuarioService.atualizar(u.id, { equipeId: null });
      setUsuarios(usuarios.map(x => x.id === u.id ? atualizado : x));
    } catch {}
  };

  const handleLoginComo = async (u: Usuario) => {
    if (!confirm(`Logar como ${u.nome}?`)) return;
    try { await loginComo(u); } catch {}
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/admin/equipes')}
          className="mt-1 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900">{equipe.nome}</h1>
          <div className="flex items-center gap-1 text-sm text-slate-400 mt-0.5">
            <MapPin className="h-3.5 w-3.5" />
            {equipe.cidade}{equipe.regional ? ` · ${equipe.regional}` : ''}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Membros',       valor: equipe.stats.totalMembros },
          { label: 'Negócios',      valor: formatarMoeda(equipe.stats.negociosGeradosReais) },
          { label: 'Ref. Internas', valor: equipe.stats.referenciasInternas },
          { label: 'Ref. Externas', valor: equipe.stats.referenciasExternas },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className="font-extrabold text-slate-800 text-lg mt-0.5">{s.valor}</p>
          </div>
        ))}
      </div>

      {/* Usuários */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-slate-400" />
          <h2 className="text-lg font-extrabold text-slate-900">
            Usuários da equipe
            <span className="ml-2 text-sm font-semibold text-slate-400">({membrosEquipe.length})</span>
          </h2>
        </div>

        {membrosEquipe.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-400 italic">
            Nenhum usuário nesta equipe.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl glass-card shadow-xl">
            <table className="min-w-full divide-y divide-slate-200/40">
              <thead className="bg-[#E63946]/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">E-mail</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Papel</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20">
                {membrosEquipe.map(u => (
                  <tr key={u.id} className="hover:bg-white/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{u.nome}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.telefone ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.empresa ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgePapel[u.papel] ?? 'bg-slate-100 text-slate-600'}`}>
                        {labelPapel(u.papel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${u.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => void handleLoginComo(u)} className="text-slate-400 hover:text-slate-700 p-1" title="Logar como este usuário">
                          <LogIn className="h-4 w-4" />
                        </button>
                        <button onClick={() => abrirEditar(u)} className="text-indigo-500 hover:text-indigo-700 p-1" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => alternarStatus(u)} className="text-emerald-500 hover:text-emerald-700 p-1" title="Alternar status">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => removerDaEquipe(u)} className="text-[#E63946] hover:text-red-700 p-1" title="Remover da equipe">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo="Editar Usuário">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Telefone</label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={e => setForm({ ...form, telefone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Empresa</label>
              <input
                type="text"
                value={form.empresa}
                onChange={e => setForm({ ...form, empresa: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Papel</label>
            <select
              value={form.papel}
              onChange={e => setForm({ ...form, papel: e.target.value as UserRole })}
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            >
              <option value="coordenador">Coordenador</option>
              <option value="trio">Trio</option>
              <option value="membro">Membro</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
            <button onClick={salvar} className="px-5 py-2 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839]">Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
