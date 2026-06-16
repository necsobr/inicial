import { useState } from 'react';
import { Settings, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

export default function SettingsPage() {
  const { integracoes, setIntegracoes } = useStore();
  const [salvo, setSalvo] = useState(false);

  const toggleAtiva = (id: string) => {
    setIntegracoes(integracoes.map(i => i.id === id ? { ...i, ativa: !i.ativa } : i));
  };

  const salvar = () => {
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500">APIs e integrações externas</p>
      </div>

      {salvo && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-700">
          Configurações salvas com sucesso! (Demonstração)
        </div>
      )}

      <div className="space-y-4">
        {integracoes.map(int => (
          <div key={int.id} className="rounded-2xl p-6 glass-card shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Settings className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{int.nome}</h3>
                  <p className="text-sm text-slate-500">{int.descricao}</p>
                </div>
              </div>
              <button onClick={() => toggleAtiva(int.id)} className="shrink-0">
                {int.ativa
                  ? <ToggleRight className="h-8 w-8 text-emerald-500" />
                  : <ToggleLeft className="h-8 w-8 text-slate-300" />
                }
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">URL do Endpoint</label>
                <input
                  type="text"
                  defaultValue={int.url}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Chave de API</label>
                <input
                  type="password"
                  defaultValue={int.chaveApi}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={salvar}
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-6 py-2.5 rounded-xl shadow-md transition"
        >
          <Save className="h-4 w-4" />
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
