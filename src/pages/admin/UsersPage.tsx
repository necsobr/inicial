import { useState } from 'react';
import { Edit, Trash2, CheckCircle, Search } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import Modal from '../../components/Modal';
import { labelPapel } from '../../utils/format';
import { usuarioService } from '../../services/storeService';
import type { Usuario, UserRole } from '../../types';

interface FormData {
  nome: string;
  email: string;
  papel: UserRole;
  equipeId: string;
}

const formVazio: FormData = { nome: '', email: '', papel: 'coordenador', equipeId: '' };

const badgePapel: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  coordenador: 'bg-emerald-100 text-emerald-700',
  trio: 'bg-violet-100 text-violet-700',
  membro: 'bg-indigo-100 text-indigo-700',
  producao: 'bg-amber-100 text-amber-700',
};

export default function UsersPage() {
  const { usuarios, setUsuarios, equipes } = useStore();
  const [busca, setBusca] = useState('');
  const [filtroPapel, setFiltroPapel] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormData>(formVazio);

  const filtrados = usuarios.filter(u => {
    const buscaOk = !busca || u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase());
    const papelOk = !filtroPapel || u.papel === filtroPapel;
    const statusOk = !filtroStatus || (filtroStatus === 'ativo' ? u.ativo : !u.ativo);
    return buscaOk && papelOk && statusOk;
  });

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setForm({ nome: u.nome, email: u.email, papel: u.papel, equipeId: u.equipeId ?? '' });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!editando) return;
    try {
      const atualizado = await usuarioService.atualizar(editando.id, {
        papel: form.papel,
        equipeId: form.equipeId || null,
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

  const excluir = async (id: string) => {
    try {
      await usuarioService.excluir(id);
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch {}
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500">Gerencie contas e permissões</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 p-4 rounded-2xl glass-card">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar nome ou e-mail..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-[#E63946]"
          />
        </div>
        <select
          value={filtroPapel}
          onChange={e => setFiltroPapel(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-[#E63946]"
        >
          <option value="">Todos os papéis</option>
          <option value="admin">Administrador</option>
          <option value="coordenador">Coordenador</option>
          <option value="trio">Trio</option>
          <option value="membro">Membro</option>
          <option value="producao">Produção</option>
        </select>
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-[#E63946]"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-2xl glass-card shadow-xl">
        <table className="min-w-full divide-y divide-slate-200/40">
          <thead className="bg-[#E63946]/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Papel</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Equipe</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/20">
            {filtrados.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Nenhum usuário encontrado.</td></tr>
            ) : filtrados.map(u => {
              const eq = equipes.find(e => e.id === u.equipeId);
              return (
                <tr key={u.id} className="hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{u.nome}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgePapel[u.papel] ?? 'bg-slate-100 text-slate-600'}`}>
                      {labelPapel(u.papel)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{eq?.nome ?? '—'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${u.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => abrirEditar(u)} className="text-indigo-500 hover:text-indigo-700 p-1"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => alternarStatus(u)} className="text-emerald-500 hover:text-emerald-700 p-1"><CheckCircle className="h-4 w-4" /></button>
                      <button onClick={() => excluir(u.id)} className="text-[#E63946] hover:text-red-700 p-1"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo="Editar Usuário">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Papel</label>
            <select
              value={form.papel}
              onChange={e => setForm({ ...form, papel: e.target.value as UserRole })}
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            >
              <option value="admin">Administrador</option>
              <option value="coordenador">Coordenador</option>
              <option value="trio">Trio</option>
              <option value="membro">Membro</option>
              <option value="producao">Produção</option>
            </select>
          </div>
          {(form.papel === 'coordenador' || form.papel === 'trio' || form.papel === 'membro') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Equipe</label>
              <select
                value={form.equipeId}
                onChange={e => setForm({ ...form, equipeId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
              >
                <option value="">Nenhuma</option>
                {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
            <button onClick={salvar} className="px-5 py-2 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839]">Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
