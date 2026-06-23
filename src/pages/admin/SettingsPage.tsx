import { useState, useEffect, useRef } from 'react';
import {
  Printer, MessageCircle, CreditCard, CheckCircle, XCircle,
  Eye, EyeOff, Copy, Zap, Save, ChevronDown, ChevronUp,
  Wifi, WifiOff, AlertCircle, QrCode, RefreshCw, Smartphone,
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
  impressao: { icone: Printer,        cor: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700' },
  whatsapp:  { icone: MessageCircle,  cor: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700' },
  pagamento: { icone: CreditCard,     cor: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
};

const LABEL_TIPO: Record<TipoIntegracao, string> = {
  impressao: 'Impressão',
  whatsapp:  'WhatsApp',
  pagamento: 'Pagamentos',
};

function WhatsAppCard({ id, nome, descricao, ativa, onToggle }: {
  id: string; nome: string; descricao: string; ativa: boolean;
  onToggle: () => void;
}) {
  const { conectarWhatsApp, buscarQrCode, statusWhatsApp } = useStore();
  const cfg = CONFIG_TIPO.whatsapp;
  const Icone = cfg.icone;

  const [conectado, setConectado] = useState(false);
  const [estado, setEstado] = useState('');
  const [qr, setQr] = useState<string | null>(null);
  const [aguardando, setAguardando] = useState(false);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pararPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const verificarStatus = async () => {
    const res = await statusWhatsApp(id);
    setConectado(res.connected);
    setEstado(res.state);
    if (res.connected) { setQr(null); setAguardando(false); pararPoll(); }
  };

  useEffect(() => {
    if (aberto) void verificarStatus();
    return pararPoll;
  }, [aberto]);

  const iniciarConexao = async () => {
    setAguardando(true);
    setErro('');
    setQr(null);

    const res = await conectarWhatsApp(id);
    if (!res.success) {
      setAguardando(false);
      setErro(res.message ?? 'Não foi possível conectar à Evolution API.');
      return;
    }

    // Polling: tenta buscar QR a cada 3s (até 40 tentativas = ~2min)
    let tentativas = 0;
    pollRef.current = setInterval(async () => {
      tentativas++;

      // Verifica se já conectou
      const status = await statusWhatsApp(id);
      if (status.connected) {
        setConectado(true); setEstado(status.state);
        setQr(null); setAguardando(false); pararPoll();
        return;
      }

      // Tenta buscar o QR
      const { qr: qrCode } = await buscarQrCode(id);
      if (qrCode) {
        setQr(qrCode);
        setAguardando(false);
      }

      if (tentativas >= 40) {
        pararPoll();
        setAguardando(false);
        if (!qr) setErro('Tempo esgotado. Clique em "Conectar" para tentar novamente.');
      }
    }, 3000);
  };

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-md hover:shadow-lg transition-all ${ativa ? cfg.border : 'border-slate-200'}`}>
      {/* Header */}
      <div
        className={`flex items-center gap-4 p-5 cursor-pointer ${aberto ? cfg.bg : 'bg-white'}`}
        onClick={() => setAberto(v => !v)}
      >
        <div className={`h-12 w-12 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
          <Icone className={`h-6 w-6 ${cfg.cor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-slate-900">{nome}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>WhatsApp</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{descricao}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${ativa ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
            {ativa ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {ativa ? 'Ativa' : 'Inativa'}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onToggle(); }}
            className={`relative h-6 w-11 rounded-full transition-all duration-300 ${ativa ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-all duration-300 ${ativa ? 'left-5' : 'left-0.5'}`} />
          </button>
          {aberto ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </div>
      </div>

      {/* Corpo */}
      {aberto && (
        <div className="border-t border-slate-100 p-6 bg-white space-y-5">
          {/* Status de conexão */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${conectado ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`h-3 w-3 rounded-full shrink-0 ${conectado ? 'bg-emerald-500 shadow-[0_0_6px_#22c55e]' : 'bg-slate-300'}`} />
            <div>
              <p className={`text-sm font-bold ${conectado ? 'text-emerald-700' : 'text-slate-600'}`}>
                {conectado ? 'WhatsApp conectado' : 'WhatsApp desconectado'}
              </p>
              {estado && !conectado && (
                <p className="text-xs text-slate-400 mt-0.5">Estado: {estado}</p>
              )}
            </div>
            <button
              onClick={verificarStatus}
              className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
              title="Atualizar status"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Área do QR code */}
          {!conectado && (
            <div className="space-y-4">
              {!qr ? (
                <div className="space-y-3">
                  <button
                    onClick={iniciarConexao}
                    disabled={aguardando}
                    className="flex items-center gap-2 text-sm font-bold text-white bg-[#25D366] hover:bg-[#1ebe5c] px-5 py-2.5 rounded-xl shadow transition disabled:opacity-60"
                  >
                    {aguardando
                      ? <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <QrCode className="h-4 w-4" />
                    }
                    {aguardando ? 'Conectando ao WhatsApp...' : 'Conectar WhatsApp'}
                  </button>
                  {aguardando && (
                    <p className="text-xs text-slate-400">Aguardando QR code da Evolution API... (pode levar até 15s)</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="shrink-0 p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
                    <img src={qr} alt="QR Code WhatsApp" className="h-48 w-48" />
                  </div>
                  <div className="space-y-3">
                    <p className="font-bold text-slate-800">Como conectar:</p>
                    <ol className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <Smartphone className="h-4 w-4 mt-0.5 shrink-0 text-[#25D366]" />
                        Abra o WhatsApp no celular
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-[#25D366] shrink-0">2.</span>
                        Toque em <strong>⋮ → Dispositivos Vinculados</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-[#25D366] shrink-0">3.</span>
                        Toque em <strong>Vincular um dispositivo</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-[#25D366] shrink-0">4.</span>
                        Aponte a câmera para o QR code ao lado
                      </li>
                    </ol>
                    <p className="text-xs text-slate-400">O QR code expira em ~90 segundos.</p>
                    <button
                      onClick={iniciarConexao}
                      disabled={aguardando}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Gerar novo QR code
                    </button>
                  </div>
                </div>
              )}

              {erro && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {erro}
                </div>
              )}
            </div>
          )}

          {!ativa && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2 text-xs text-amber-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Esta integração está inativa. Ative o toggle acima para que as notificações sejam enviadas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { integracoes, atualizarIntegracao, testarIntegracao } = useStore();
  const [expandida, setExpandida] = useState<string | null>(
    integracoes.find(i => i.tipo !== 'whatsapp')?.id ?? null
  );
  const [urls, setUrls]           = useState<Record<string, string>>(Object.fromEntries(integracoes.map(i => [i.id, i.url])));
  const [chaves, setChaves]       = useState<Record<string, string>>(Object.fromEntries(integracoes.map(i => [i.id, i.chaveApi])));
  const [mostrarChave, setMostrarChave] = useState<Record<string, boolean>>({});
  const [testando, setTestando]         = useState<Record<string, boolean>>({});
  const [resultadoTeste, setResultadoTeste] = useState<Record<string, 'ok' | 'erro' | null>>({});
  const [copiado, setCopiado] = useState<string | null>(null);
  const [salvo, setSalvo]     = useState(false);

  const toggleAtiva = async (id: string) => {
    const int = integracoes.find(i => i.id === id);
    if (!int) return;
    try { await atualizarIntegracao(id, { ativa: !int.ativa }); } catch {}
  };

  const testarConexao = async (id: string) => {
    setTestando(prev => ({ ...prev, [id]: true }));
    setResultadoTeste(prev => ({ ...prev, [id]: null }));
    const ok = await testarIntegracao(id);
    setTestando(prev => ({ ...prev, [id]: false }));
    setResultadoTeste(prev => ({ ...prev, [id]: ok ? 'ok' : 'erro' }));
  };

  const copiarChave = (id: string) => {
    navigator.clipboard.writeText(chaves[id] ?? '').catch(() => {});
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const salvar = async () => {
    try {
      await Promise.all(
        integracoes.filter(i => i.tipo !== 'whatsapp').map(i =>
          atualizarIntegracao(i.id, {
            url:      urls[i.id]   ?? i.url,
            chaveApi: chaves[i.id] ?? i.chaveApi,
          })
        )
      );
    } catch {}
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  const naoWhatsApp = integracoes.filter(i => i.tipo !== 'whatsapp');
  const whatsApp    = integracoes.filter(i => i.tipo === 'whatsapp');

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

      {/* Cards WhatsApp — fluxo de QR */}
      {whatsApp.map(int => (
        <WhatsAppCard
          key={int.id}
          id={int.id}
          nome={int.nome}
          descricao={int.descricao}
          ativa={int.ativa}
          onToggle={() => toggleAtiva(int.id)}
        />
      ))}

      {/* Outros cards — URL + chave */}
      <div className="space-y-4">
        {naoWhatsApp.map(int => {
          const cfg   = CONFIG_TIPO[int.tipo];
          const Icone = cfg.icone;
          const aberta = expandida === int.id;
          const resultado = resultadoTeste[int.id];

          return (
            <div key={int.id} className={`rounded-2xl border overflow-hidden shadow-md hover:shadow-lg transition-all ${int.ativa ? cfg.border : 'border-slate-200'}`}>
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
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${int.ativa ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                    {int.ativa ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                    {int.ativa ? 'Ativa' : 'Inativa'}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); toggleAtiva(int.id); }}
                    className={`relative h-6 w-11 rounded-full transition-all duration-300 ${int.ativa ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-all duration-300 ${int.ativa ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  {aberta ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
              </div>

              {aberta && (
                <div className="border-t border-slate-100 p-5 space-y-5 bg-white">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL do Endpoint</label>
                    <input
                      type="url"
                      value={urls[int.id] ?? ''}
                      onChange={e => setUrls({ ...urls, [int.id]: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition"
                    />
                  </div>

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
                      >
                        {copiado === int.id ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => testarConexao(int.id)}
                      disabled={testando[int.id]}
                      className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border transition-all ${testando[int.id] ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50'} border-slate-200 text-slate-700`}
                    >
                      {testando[int.id]
                        ? <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        : <Zap className="h-4 w-4" />
                      }
                      {testando[int.id] ? 'Testando...' : 'Testar Conexão'}
                    </button>
                    {resultado === 'ok' && (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                        <CheckCircle className="h-4 w-4" /> Conexão bem-sucedida
                      </div>
                    )}
                    {resultado === 'erro' && (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-red-600">
                        <XCircle className="h-4 w-4" /> Falha na conexão
                      </div>
                    )}
                  </div>

                  {!int.ativa && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2 text-xs text-amber-700 font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Esta integração está inativa. Ative o toggle acima para utilizá-la.
                    </div>
                  )}

                  {int.tipo === 'pagamento' && (
                    <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-700">
                      <p className="font-bold mb-1">Asaas Pagamentos</p>
                      <p>Use a chave de API do ambiente de produção (aas_live_...) ou sandbox (aas_test_...) para testes.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {naoWhatsApp.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={salvar}
            className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-6 py-2.5 rounded-xl shadow-md transition"
          >
            <Save className="h-4 w-4" />
            Salvar Configurações
          </button>
        </div>
      )}
    </div>
  );
}
