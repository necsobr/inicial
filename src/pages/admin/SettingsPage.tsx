import { useState } from 'react';
import {
  Printer, MessageCircle, CreditCard, CheckCircle, XCircle,
  Eye, EyeOff, Copy, Zap, Save, ChevronDown, ChevronUp,
  Wifi, WifiOff, AlertCircle
} from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import type { TipoIntegracao } from '../../types';

const CONFIG_TIPO: Record<TipoIntegracao, {
  icone: React.ComponentType<{ className?: string }>;
  cor: string;
  bg: string;
  border: string;
  badge: string;
}> = {
  impressao: {
    icone: Printer,
    cor: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  whatsapp: {
    icone: MessageCircle,
    cor: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  pagamento: {
    icone: CreditCard,
    cor: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
  },
};

const LABEL_TIPO: Record<TipoIntegracao, string> = {
  impressao: 'Impressão',
  whatsapp: 'WhatsApp',
  pagamento: 'Pagamentos',
};

export default function SettingsPage() {
  const { integracoes, setIntegracoes } = useStore();
  const [expandida, setExpandida] = useState<string | null>(integracoes[0]?.id ?? null);
  const [urls, setUrls] = useState<Record<string, string>>(Object.fromEntries(integracoes.map(i => [i.id, i.url])));
  const [chaves, setChaves] = useState<Record<string, string>>(Object.fromEntries(integracoes.map(i => [i.id, i.chaveApi])));
  const [mostrarChave, setMostrarChave] = useState<Record<string, boolean>>({});
  const [testando, setTestando] = useState<Record<string, boolean>>({});
  const [resultadoTeste, setResultadoTeste] = useState<Record<string, 'ok' | 'erro' | null>>({});
  const [copiado, setCopiado] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const toggleAtiva = (id: string) => {
    setIntegracoes(integracoes.map(i => i.id === id ? { ...i, ativa: !i.ativa } : i));
  };

  const testarConexao = (id: string) => {
    setTestando({ ...testando, [id]: true });
    setResultadoTeste({ ...resultadoTeste, [id]: null });
    setTimeout(() => {
      const int = integracoes.find(i => i.id === id);
      const ok = !!(int?.ativa && chaves[id] && urls[id]);
      setTestando({ ...testando, [id]: false });
      setResultadoTeste({ ...resultadoTeste, [id]: ok ? 'ok' : 'erro' });
    }, 1500);
  };

  const copiarChave = (id: string) => {
    navigator.clipboard.writeText(chaves[id] ?? '').catch(() => {});
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const salvar = () => {
    setIntegracoes(integracoes.map(i => ({ ...i, url: urls[i.id] ?? i.url, chaveApi: chaves[i.id] ?? i.chaveApi })));
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Configurações de API</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie as integrações externas do sistema.</p>
      </div>

      {salvo && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Configurações salvas com sucesso!
        </div>
      )}

      <div className="space-y-4">
        {integracoes.map(int => {
          const cfg = CONFIG_TIPO[int.tipo];
          const Icone = cfg.icone;
          const aberta = expandida === int.id;
          const resultado = resultadoTeste[int.id];

          return (
            <div key={int.id} className={`rounded-2xl border overflow-hidden transition-all shadow-md hover:shadow-lg ${int.ativa ? cfg.border : 'border-slate-200'}`}>
              {/* Header */}
              <div className={`flex items-center gap-4 p-5 cursor-pointer ${aberta ? cfg.bg : 'bg-white'}`} onClick={() => setExpandida(aberta ? null : int.id)}>
                <div className={`h-12 w-12 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                  <Icone className={`h-6 w-6 ${cfg.cor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-slate-900">{int.nome}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{LABEL_TIPO[int.tipo]}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{int.descricao}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Status */}
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${int.ativa ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                    {int.ativa ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                    {int.ativa ? 'Ativa' : 'Inativa'}
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleAtiva(int.id); }}
                    className={`relative h-6 w-11 rounded-full transition-all duration-300 ${int.ativa ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    title={int.ativa ? 'Desativar' : 'Ativar'}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-all duration-300 ${int.ativa ? 'left-5' : 'left-0.5'}`} />
                  </button>

                  {aberta ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
              </div>

              {/* Corpo expandido */}
              {aberta && (
                <div className="border-t border-slate-100 p-5 space-y-5 bg-white">
                  {/* URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL do Endpoint</label>
                    <input
                      type="url"
                      value={urls[int.id] ?? ''}
                      onChange={e => setUrls({ ...urls, [int.id]: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition"
                    />
                  </div>

                  {/* Chave API */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Chave de API</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={mostrarChave[int.id] ? 'text' : 'password'}
                          value={chaves[int.id] ?? ''}
                          onChange={e => setChaves({ ...chaves, [int.id]: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 pr-10 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition"
                        />
                        <button
                          onClick={() => setMostrarChave({ ...mostrarChave, [int.id]: !mostrarChave[int.id] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                        >
                          {mostrarChave[int.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <button
                        onClick={() => copiarChave(int.id)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${copiado === int.id ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        title="Copiar chave"
                      >
                        {copiado === int.id ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => testarConexao(int.id)}
                      disabled={testando[int.id]}
                      className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border transition-all ${testando[int.id] ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50'} border-slate-200 text-slate-700`}
                    >
                      {testando[int.id] ? (
                        <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {testando[int.id] ? 'Testando...' : 'Testar Conexão'}
                    </button>

                    {resultado === 'ok' && (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                        <CheckCircle className="h-4 w-4" />
                        Conexão bem-sucedida
                      </div>
                    )}
                    {resultado === 'erro' && (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-red-600">
                        <XCircle className="h-4 w-4" />
                        Falha na conexão — verifique as credenciais
                      </div>
                    )}
                  </div>

                  {/* Aviso de integração inativa */}
                  {!int.ativa && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2 text-xs text-amber-700 font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Esta integração está inativa. Ative o toggle acima para utilizá-la.
                    </div>
                  )}

                  {/* Info específica por tipo */}
                  {int.tipo === 'whatsapp' && (
                    <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700">
                      <p className="font-bold mb-1">Evolution API — WhatsApp</p>
                      <p>Esta integração utiliza a Evolution API para enviar notificações automáticas via WhatsApp para o coordenador e o trio. Configure a URL da sua instância Evolution e a chave de API gerada no painel.</p>
                    </div>
                  )}
                  {int.tipo === 'pagamento' && (
                    <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-700">
                      <p className="font-bold mb-1">Asaas Pagamentos</p>
                      <p>Integração com Asaas para cobrança das cotas de patrocínio. Use a chave de API do ambiente de produção (aas_live_...) ou sandbox (aas_test_...) para testes.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
