import { useState } from 'react';
import { Plus, Trash2, MapPin, Users } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import Modal from '../../components/Modal';
import { formatarMoeda } from '../../utils/format';
import type { Equipe } from '../../types';

export default function TeamsPage() {
  const { equipes, setEquipes, usuarios } = useStore();
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ nome: '', regional: '', cidade: '' });

  const salvar = () => {
    if (!form.nome) return;
    const nova: Equipe = {
      id: `eq-${Date.now()}`,
      nome: form.nome,
      regional: form.regional,
      cidade: form.cidade,
      gestoresIds: [],
      stats: { totalMembros: 0, referenciasInternas: 0, referenciasExternas: 0, reunioes1a1: 0, convidados: 0, educacao: 0, negociosGeradosReais: 0 },
      statsUltimoMes: { membrosAtivos: 0, referenciasInternas: 0, referenciasExternas: 0, reunioes1a1: 0, convidados: 0, negociosGeradosReais: 0 },
      especialidadesAberto: [],
      patrocinadores: [],
    };
    setEquipes([...equipes, nova]);
    setForm({ nome: '', regional: '', cidade: '' });
    setModalAberto(false);
  };

  const excluir = (id: string) => {
    setEquipes(equipes.filter(e => e.id !== id));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Gestores e Equipes</h1>
          <p className="text-sm text-slate-500">Gerencie equipes e seus gestores</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <Plus className="h-4 w-4" />
          Nova Equipe
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {equipes.map(eq => {
          const gestores = usuarios.filter(u => eq.gestoresIds.includes(u.id));
          return (
            <div key={eq.id} className="rounded-3xl p-6 glass-card shadow-xl space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{eq.nome}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {eq.cidade} · {eq.regional}
                  </div>
                </div>
                <button onClick={() => excluir(eq.id)} className="text-slate-300 hover:text-[#E63946] p-1 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Membros', valor: eq.stats.totalMembros },
                  { label: 'Negócios', valor: formatarMoeda(eq.stats.negociosGeradosReais) },
                  { label: 'Ref. Internas', valor: eq.stats.referenciasInternas },
                  { label: 'Ref. Externas', valor: eq.stats.referenciasExternas },
                ].map((s, i) => (
                  <div key={i} className="bg-white/50 rounded-xl p-3 border border-white/40">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                    <p className="font-extrabold text-slate-800 text-sm mt-0.5">{s.valor}</p>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase mb-2">
                  <Users className="h-3.5 w-3.5" />
                  Gestores ({gestores.length})
                </div>
                {gestores.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum gestor associado.</p>
                ) : gestores.map(g => (
                  <div key={g.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-700">{g.nome}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full capitalize">Coordenador</span>
                  </div>
                ))}
              </div>

              {eq.especialidadesAberto.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Especialidades em Aberto</p>
                  <div className="flex flex-wrap gap-1.5">
                    {eq.especialidadesAberto.slice(0, 4).map((esp, i) => (
                      <span key={i} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{esp}</span>
                    ))}
                    {eq.especialidadesAberto.length > 4 && (
                      <span className="text-[10px] text-slate-400">+{eq.especialidadesAberto.length - 4}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo="Nova Equipe">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome da Equipe</label>
            <input
              type="text"
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: BNI Liderança Norte"
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Regional</label>
            <input
              type="text"
              value={form.regional}
              onChange={e => setForm({ ...form, regional: e.target.value })}
              placeholder="Ex: Regional Norte Paulista"
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cidade / UF</label>
            <input
              type="text"
              value={form.cidade}
              onChange={e => setForm({ ...form, cidade: e.target.value })}
              placeholder="Ex: São Paulo/SP"
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm outline-none focus:border-[#E63946]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancelar</button>
            <button onClick={salvar} className="px-5 py-2 text-sm font-bold bg-[#E63946] text-white rounded-xl hover:bg-[#d62839]">Criar Equipe</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
