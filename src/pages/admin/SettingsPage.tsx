import { useState, useEffect, useRef } from 'react';
import {
  Printer, MessageCircle, CreditCard, CheckCircle, XCircle,
  Eye, EyeOff, Copy, Zap, Save, ChevronDown, ChevronUp,
  Wifi, WifiOff, AlertCircle, QrCode, RefreshCw, Link,
  Send, Pencil, X,
} from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { integracaoService, templateService } from '../../services/storeService';
import type { TipoIntegracao, TemplateMensagem } from '../../types';

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
  const { integracoes, atualizarIntegracao, testarIntegracao } = useStore();
  const [expandida, setExpandida] = useState<string | null>(integracoes[0]?.id ?? null);
  const [urls, setUrls] = useState<Record<string, string>>(Object.fromEntries(integracoes.map(i => [i.id, i.url])));
  const [chaves, setChaves] = useState<Record<string, string>>(Object.fromEntries(integracoes.map(i => [i.id, i.chaveApi])));
  const [instancias, setInstancias] = useState<Record<string, string>>(Object.fromEntries(integracoes.map(i => [i.id, i.instancia])));
  const [mostrarChave, setMostrarChave] = useState<Record<string, boolean>>({});
  const [testando, setTestando] = useState<Record<string, boolean>>({});
  const [resultadoTeste, setResultadoTeste] = useState<Record<string, 'ok' | 'erro' | null>>({});
  const [copiado, setCopiado] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [qrCode, setQrCode] = useState<Record<string, string | null>>({});
  const [qrCarregando, setQrCarregando] = useState<Record<string, boolean>>({});
  const [qrErro, setQrErro] = useState<Record<string, string | null>>({});
  const [whatsappConectado, setWhatsappConectado] = useState<Record<string, boolean>>({});
  const pollingRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const [metodo, setMetodo] = useState<Record<string, 'qr' | 'codigo'>>({});
  const [telefone, setTelefone] = useState<Record<string, string>>({});
  const [pairingCode, setPairingCode] = useState<Record<string, string | null>>({});
  const [pairingCarregando, setPairingCarregando] = useState<Record<string, boolean>>({});

  // ── Mensagens WhatsApp ──
  const wppInt = integracoes.find(i => i.tipo === 'whatsapp');
  const [telefoneTeste, setTelefoneTeste] = useState('');
  const [mensagemTeste, setMensagemTeste] = useState('');
  const [enviandoTeste, setEnviandoTeste] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState<'ok' | 'erro' | null>(null);

  const [templates, setTemplates] = useState<TemplateMensagem[]>([]);
  const [editandoTemplate, setEditandoTemplate] = useState<string | null>(null);
  const [bodyEdicao, setBodyEdicao] = useState<Record<string, string>>({});
  const [salvandoTemplate, setSalvandoTemplate] = useState<Record<string, boolean>>({});

  useEffect(() => {
    templateService.listar().then(setTemplates).catch(() => {});
  }, []);

  // ── Handlers integrações ──

  const toggleAtiva = async (id: string) => {
    const int = integracoes.find(i => i.id === id);
    if (!int) return;
    try { await atualizarIntegracao(id, { ativa: !int.ativa }); } catch {}
  };

  const testarConexao = async (id: string) => {
    setTestando(prev => ({ ...prev, [id]: true }));
    setResultadoTeste(prev => ({ ...prev, [id]: null }));
    try {
      const ok = await testarIntegracao(id);
      setTestando(prev => ({ ...prev, [id]: false }));
      setResultadoTeste(prev => ({ ...prev, [id]: ok ? 'ok' : 'erro' }));
    } catch {
      setTestando(prev => ({ ...prev, [id]: false }));
      setResultadoTeste(prev => ({ ...prev, [id]: 'erro' }));
    }
  };

  const copiarChave = (id: string) => {
    navigator.clipboard.writeText(chaves[id] ?? '').catch(() => {});
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const pararPolling = (id: string) => {
    if (pollingRef.current[id]) {
      clearInterval(pollingRef.current[id]);
      delete pollingRef.current[id];
    }
  };

  useEffect(() => {
    return () => { Object.values(pollingRef.current).forEach(clearInterval); };
  }, []);

  const iniciarPollingConexao = (id: string) => {
    pararPolling(id);
    pollingRef.current[id] = setInterval(async () => {
      try {
        const res = await integracaoService.verificarConexao(id);
        if (res.connected) {
          setWhatsappConectado(prev => ({ ...prev, [id]: true }));
          setQrCode(prev => ({ ...prev, [id]: null }));
          pararPolling(id);
        }
      } catch {}
    }, 3000);
  };

  const gerarQrCode = async (id: string) => {
    setQrCarregando(prev => ({ ...prev, [id]: true }));
    setQrErro(prev => ({ ...prev, [id]: null }));
    setQrCode(prev => ({ ...prev, [id]: null }));
    setWhatsappConectado(prev => ({ ...prev, [id]: false }));
    pararPolling(id);
    try {
      const res = await integracaoService.obterQrCode(id);
      if (res.connected) {
        setWhatsappConectado(prev => ({ ...prev, [id]: true }));
      } else if (res.qrcode) {
        setQrCode(prev => ({ ...prev, [id]: res.qrcode! }));
        iniciarPollingConexao(id);
      } else {
        setQrErro(prev => ({ ...prev, [id]: res.message ?? 'Não foi possível gerar o QR code.' }));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao buscar QR code.';
      setQrErro(prev => ({ ...prev, [id]: msg }));
    } finally {
      setQrCarregando(prev => ({ ...prev, [id]: false }));
    }
  };

  const gerarCodigoPareamento = async (id: string) => {
    const phone = telefone[id] ?? '';
    if (!phone.trim()) return;
    setPairingCarregando(prev => ({ ...prev, [id]: true }));
    setPairingCode(prev => ({ ...prev, [id]: null }));
    setQrErro(prev => ({ ...prev, [id]: null }));
    pararPolling(id);
    try {
      const res = await integracaoService.obterCodigoPareamento(id, phone);
      if (res.connected) {
        setWhatsappConectado(prev => ({ ...prev, [id]: true }));
      } else if (res.pairingCode) {
        setPairingCode(prev => ({ ...prev, [id]: res.pairingCode! }));
        iniciarPollingConexao(id);
      } else {
        setQrErro(prev => ({ ...prev, [id]: res.message ?? 'Não foi possível gerar o código.' }));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao gerar código.';
      setQrErro(prev => ({ ...prev, [id]: msg }));
    } finally {
      setPairingCarregando(prev => ({ ...prev, [id]: false }));
    }
  };

  const salvar = async () => {
    try {
      await Promise.all(integracoes.map(i =>
        atualizarIntegracao(i.id, {
          url: urls[i.id] ?? i.url,
          chaveApi: chaves[i.id] ?? i.chaveApi,
          instancia: instancias[i.id] ?? i.instancia,
        })
      ));
    } catch {}
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  // ── Handlers mensagens ──

  const enviarTeste = async () => {
    if (!wppInt || !telefoneTeste.trim() || !mensagemTeste.trim()) return;
    setEnviandoTeste(true);
    setResultadoEnvio(null);
    try {
      await integracaoService.enviarMensagemTeste(wppInt.id, telefoneTeste, mensagemTeste);
      setResultadoEnvio('ok');
    } catch {
      setResultadoEnvio('erro');
    } finally {
      setEnviandoTeste(false);
      setTimeout(() => setResultadoEnvio(null), 4000);
    }
  };

  const iniciarEdicao = (t: TemplateMensagem) => {
    setEditandoTemplate(t.id);
    setBodyEdicao(p => ({ ...p, [t.id]: t.body }));
  };

  const salvarTemplate = async (t: TemplateMensagem) => {
    setSalvandoTemplate(p => ({ ...p, [t.id]: true }));
    try {
      const atualizado = await templateService.atualizar(t.id, bodyEdicao[t.id] ?? t.body);
      setTemplates(prev => prev.map(x => x.id === t.id ? atualizado : x));
      setEditandoTemplate(null);
    } catch {
    } finally {
      setSalvandoTemplate(p => ({ ...p, [t.id]: false }));
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-10 max-w-3xl">

      {/* ── Seção 1: Integrações de API ── */}
      <section className="space-y-4">
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
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${int.ativa ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                      {int.ativa ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                      {int.ativa ? 'Ativa' : 'Inativa'}
                    </div>
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

                {/* Corpo */}
                {aberta && (
                  <div className="border-t border-slate-100 p-5 space-y-5 bg-white">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL do Endpoint</label>
                      <input type="url" value={urls[int.id] ?? ''} onChange={e => setUrls({ ...urls, [int.id]: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition" />
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
                          <button onClick={() => setMostrarChave({ ...mostrarChave, [int.id]: !mostrarChave[int.id] })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
                            {mostrarChave[int.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <button onClick={() => copiarChave(int.id)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${copiado === int.id ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          title="Copiar chave">
                          {copiado === int.id ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {int.tipo === 'whatsapp' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nome da Instância</label>
                        <input type="text" placeholder="ex: aiprint-prod" value={instancias[int.id] ?? ''}
                          onChange={e => setInstancias({ ...instancias, [int.id]: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition" />
                        <p className="text-[11px] text-slate-400 mt-1">Nome da instância criada na Evolution API.</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <button onClick={() => testarConexao(int.id)} disabled={testando[int.id]}
                        className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border transition-all ${testando[int.id] ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50'} border-slate-200 text-slate-700`}>
                        {testando[int.id] ? <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Zap className="h-4 w-4" />}
                        {testando[int.id] ? 'Testando...' : 'Testar Conexão'}
                      </button>
                      {resultado === 'ok' && <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle className="h-4 w-4" />Conexão bem-sucedida</span>}
                      {resultado === 'erro' && <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600"><XCircle className="h-4 w-4" />Falha na conexão — verifique as credenciais</span>}
                    </div>

                    {!int.ativa && (
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2 text-xs text-amber-700 font-medium">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Esta integração está inativa. Ative o toggle acima para utilizá-la.
                      </div>
                    )}

                    {int.tipo === 'whatsapp' && (
                      <div className="space-y-3">
                        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700">
                          <p className="font-bold mb-1">Evolution API — WhatsApp</p>
                          <p>Configure URL, API Key e nome da instância acima. Depois escolha como vincular o número.</p>
                        </div>
                        {whatsappConectado[int.id] ? (
                          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-700">
                            <CheckCircle className="h-5 w-5 shrink-0" /> WhatsApp conectado com sucesso!
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <button onClick={() => { setMetodo(p => ({ ...p, [int.id]: 'qr' })); setPairingCode(p => ({ ...p, [int.id]: null })); setQrErro(p => ({ ...p, [int.id]: null })); }}
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${(metodo[int.id] ?? 'qr') === 'qr' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <QrCode className="h-3.5 w-3.5" /> QR Code
                              </button>
                              <button onClick={() => { setMetodo(p => ({ ...p, [int.id]: 'codigo' })); setQrCode(p => ({ ...p, [int.id]: null })); setQrErro(p => ({ ...p, [int.id]: null })); pararPolling(int.id); }}
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${metodo[int.id] === 'codigo' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <Link className="h-3.5 w-3.5" /> Código por número
                              </button>
                            </div>

                            {(metodo[int.id] ?? 'qr') === 'qr' && (
                              <div className="space-y-3">
                                <button onClick={() => gerarQrCode(int.id)} disabled={qrCarregando[int.id]}
                                  className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-60 disabled:cursor-not-allowed">
                                  {qrCarregando[int.id] ? <RefreshCw className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                                  {qrCarregando[int.id] ? 'Gerando...' : qrCode[int.id] ? 'Atualizar QR code' : 'Gerar QR code'}
                                </button>
                                {qrCode[int.id] && (
                                  <div className="rounded-xl border border-green-200 bg-white p-4 flex flex-col items-center gap-3">
                                    <p className="text-xs font-semibold text-green-700">Escaneie com o WhatsApp para conectar</p>
                                    <img src={qrCode[int.id]!} alt="QR Code WhatsApp" className="w-52 h-52 rounded-lg border border-slate-200" />
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><RefreshCw className="h-3 w-3 animate-spin" /> Aguardando conexão...</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {metodo[int.id] === 'codigo' && (
                              <div className="space-y-3">
                                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                                  <p className="font-bold mb-1">Como usar</p>
                                  <p>Digite o número → clique em gerar → no celular vá em <strong>Dispositivos conectados → Vincular com número de telefone</strong> → insira o código.</p>
                                </div>
                                <div className="flex gap-2">
                                  <input type="tel" placeholder="11999999999" value={telefone[int.id] ?? ''}
                                    onChange={e => setTelefone(p => ({ ...p, [int.id]: e.target.value }))}
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition" />
                                  <button onClick={() => gerarCodigoPareamento(int.id)} disabled={pairingCarregando[int.id] || !(telefone[int.id] ?? '').trim()}
                                    className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap">
                                    {pairingCarregando[int.id] ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
                                    {pairingCarregando[int.id] ? 'Gerando...' : 'Gerar código'}
                                  </button>
                                </div>
                                {pairingCode[int.id] && (
                                  <div className="rounded-xl border border-green-200 bg-white p-4 flex flex-col items-center gap-2">
                                    <p className="text-xs font-semibold text-green-700">Digite este código no WhatsApp</p>
                                    <div className="text-3xl font-extrabold tracking-[0.3em] text-slate-900 font-mono bg-slate-50 border border-slate-200 rounded-xl px-6 py-3">{pairingCode[int.id]}</div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><RefreshCw className="h-3 w-3 animate-spin" /> Aguardando conexão...</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {qrErro[int.id] && (
                              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                                <XCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{qrErro[int.id]}</span>
                              </div>
                            )}
                          </div>
                        )}
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

        <div className="flex justify-end">
          <button onClick={salvar}
            className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-6 py-2.5 rounded-xl shadow-md transition">
            <Save className="h-4 w-4" /> Salvar Configurações
          </button>
        </div>
      </section>

      {/* ── Seção 2: Mensagens WhatsApp ── */}
      {wppInt && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Mensagens WhatsApp</h2>
            <p className="text-sm text-slate-500 mt-1">Teste o envio e edite os textos dos disparos automáticos.</p>
          </div>

          {/* Disparo de teste */}
          <div className="rounded-2xl border border-slate-200 shadow-md bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
              <Send className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-bold text-slate-800 text-sm">Disparo de Teste</p>
                <p className="text-xs text-slate-400">Envie uma mensagem de teste para qualquer número via Evolution API.</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Número</label>
                <input type="tel" placeholder="11999999999" value={telefoneTeste}
                  onChange={e => setTelefoneTeste(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Mensagem</label>
                <textarea rows={3} placeholder="Digite a mensagem..." value={mensagemTeste}
                  onChange={e => setMensagemTeste(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={enviarTeste}
                  disabled={enviandoTeste || !telefoneTeste.trim() || !mensagemTeste.trim()}
                  className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {enviandoTeste ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {enviandoTeste ? 'Enviando...' : 'Enviar teste'}
                </button>
                {resultadoEnvio === 'ok' && <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle className="h-4 w-4" />Mensagem enviada!</span>}
                {resultadoEnvio === 'erro' && <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600"><XCircle className="h-4 w-4" />Falha ao enviar</span>}
              </div>
            </div>
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div className="rounded-2xl border border-slate-200 shadow-md bg-white overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                <Pencil className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">Templates de Mensagens Automáticas</p>
                  <p className="text-xs text-slate-400">Edite os textos enviados automaticamente pelo sistema.</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {templates.map(t => (
                  <div key={t.id}>
                    <div className="flex items-start gap-4 p-5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">{t.name}</p>
                        {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
                        {editandoTemplate !== t.id && (
                          <p className="text-xs text-slate-600 mt-2 font-mono bg-slate-50 rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed">{t.body}</p>
                        )}
                      </div>
                      {editandoTemplate !== t.id && (
                        <button onClick={() => iniciarEdicao(t)} title="Editar"
                          className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editandoTemplate === t.id && (
                      <div className="px-5 pb-5 space-y-2">
                        <textarea rows={4} value={bodyEdicao[t.id] ?? t.body}
                          onChange={e => setBodyEdicao(p => ({ ...p, [t.id]: e.target.value }))}
                          className="w-full rounded-xl border border-indigo-300 bg-white py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946] transition resize-none" />
                        <div className="flex items-center gap-2">
                          <button onClick={() => salvarTemplate(t)} disabled={salvandoTemplate[t.id]}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E63946] text-white hover:bg-[#d62839] transition disabled:opacity-60">
                            {salvandoTemplate[t.id] ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            {salvandoTemplate[t.id] ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button onClick={() => setEditandoTemplate(null)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition">
                            <X className="h-3.5 w-3.5" /> Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
