import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, DollarSign, ArrowLeft, Copy, ExternalLink,
  RefreshCw, QrCode, FileText, Clock,
} from 'lucide-react';
import { formatarMoeda } from '../../utils/format';
import { sponsorshipService } from '../../services/storeService';
import type { SolicitacaoPatrocinio } from '../../types';

interface PaymentScreenProps {
  solicitacao: SolicitacaoPatrocinio;
  onSucesso: (atualizada: SolicitacaoPatrocinio) => void;
  onVoltar: () => void;
}

const STATUS_PAGO = ['RECEIVED', 'CONFIRMED'];
const POLL_INTERVAL = 5000;

export default function PaymentScreen({ solicitacao, onSucesso, onVoltar }: PaymentScreenProps) {
  const [copiado, setCopiado] = useState<'pix' | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [statusAsaas, setStatusAsaas] = useState(solicitacao.asaasPaymentStatus ?? 'PENDING');
  const [pago, setPago] = useState(STATUS_PAGO.includes(solicitacao.asaasPaymentStatus ?? ''));
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPix = solicitacao.billingType === 'PIX';

  const verificarStatus = async () => {
    setVerificando(true);
    try {
      const res = await sponsorshipService.verificarPagamento(solicitacao.id);
      setStatusAsaas(res.asaasStatus);
      if (STATUS_PAGO.includes(res.asaasStatus)) {
        setPago(true);
        pararPolling();
        onSucesso({ ...solicitacao, status: res.status as SolicitacaoPatrocinio['status'], asaasPaymentStatus: res.asaasStatus });
      }
    } catch {} finally {
      setVerificando(false);
    }
  };

  const pararPolling = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  };

  useEffect(() => {
    if (!pago) {
      pollingRef.current = setInterval(verificarStatus, POLL_INTERVAL);
    }
    return pararPolling;
  }, []);

  const copiarPix = () => {
    if (!solicitacao.asaasPixCopyPaste) return;
    navigator.clipboard.writeText(solicitacao.asaasPixCopyPaste).catch(() => {});
    setCopiado('pix');
    setTimeout(() => setCopiado(null), 3000);
  };

  const labelStatus = () => {
    const map: Record<string, string> = {
      PENDING: 'Aguardando pagamento',
      RECEIVED: 'Pagamento confirmado',
      CONFIRMED: 'Pagamento confirmado',
      OVERDUE: 'Vencido',
      REFUNDED: 'Reembolsado',
      CANCELED: 'Cancelado',
    };
    return map[statusAsaas] ?? statusAsaas;
  };

  if (pago) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 animate-in fade-in duration-300">
        <div className="rounded-3xl p-8 shadow-2xl glass-card text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800">Pagamento Confirmado!</h2>
            <p className="text-sm text-slate-500">Sua solicitação de patrocínio foi registrada com sucesso.</p>
          </div>
          <div className="bg-white/45 rounded-xl p-5 border border-white/50 text-xs text-left text-slate-700 divide-y divide-slate-100">
            <div className="py-2 flex justify-between">
              <span>Empresa:</span><strong>{solicitacao.empresa}</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Equipe:</span><strong>{solicitacao.equipeNome}</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Semana:</span><strong>{solicitacao.semana.split('-').reverse().join('/')}</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Valor Pago:</span><strong className="text-[#E63946]">{formatarMoeda(solicitacao.valor)}</strong>
            </div>
          </div>
          <button onClick={() => onSucesso(solicitacao)} className="w-full py-3.5 bg-[#E63946] hover:bg-[#d62839] text-white font-bold rounded-xl shadow-lg transition-all">
            Retornar ao Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      <button onClick={onVoltar} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Resumo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl p-6 shadow-xl glass-card">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#E63946]" />
              Resumo do Patrocínio
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-white/40 p-4 rounded-xl border border-white/20 space-y-2">
                <div className="flex justify-between"><span>Empresa:</span><strong className="text-slate-800">{solicitacao.empresa}</strong></div>
                <div className="flex justify-between"><span>Equipe:</span><strong className="text-slate-800">{solicitacao.equipeNome}</strong></div>
                <div className="flex justify-between"><span>Semana:</span><strong className="text-slate-800">{solicitacao.semana.split('-').reverse().join('/')}</strong></div>
              </div>
              <div className="border-t border-white/35 pt-3 flex justify-between text-base font-bold text-slate-800">
                <span>Total:</span>
                <span className="text-[#E63946]">{formatarMoeda(solicitacao.valor)}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            {STATUS_PAGO.includes(statusAsaas) ? (
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <Clock className="h-5 w-5 text-amber-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium">Status do pagamento</p>
              <p className="text-sm font-bold text-slate-800">{labelStatus()}</p>
            </div>
            <button
              onClick={verificarStatus}
              disabled={verificando}
              title="Verificar status"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <RefreshCw className={`h-4 w-4 ${verificando ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            O status é verificado automaticamente a cada 5 segundos.
          </p>
        </div>

        {/* Pagamento */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl p-8 shadow-xl glass-card">

            {/* PIX */}
            {isPix && (
              <div className="space-y-5">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-green-600" />
                  Pague com PIX
                </h3>
                <p className="text-sm text-slate-500">Escaneie o QR code ou copie o código abaixo no seu banco.</p>

                {solicitacao.asaasPixQrcode ? (
                  <div className="flex justify-center">
                    <div className="rounded-2xl border-2 border-green-200 p-4 bg-white inline-block shadow-sm">
                      <img
                        src={`data:image/png;base64,${solicitacao.asaasPixQrcode}`}
                        alt="QR Code PIX"
                        className="w-52 h-52 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-52 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-400">QR Code não disponível</p>
                  </div>
                )}

                {solicitacao.asaasPixCopyPaste && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PIX Copia e Cola</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={solicitacao.asaasPixCopyPaste}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-mono text-slate-700 truncate outline-none"
                      />
                      <button
                        onClick={copiarPix}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${copiado === 'pix' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {copiado === 'pix' ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiado === 'pix' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Boleto */}
            {!isPix && (
              <div className="space-y-5">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  Pague com Boleto Bancário
                </h3>
                <p className="text-sm text-slate-500">Clique no botão abaixo para abrir o boleto. O pagamento pode levar até 3 dias úteis para ser confirmado.</p>

                <div className="rounded-2xl bg-violet-50 border border-violet-200 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-violet-500 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Boleto gerado</p>
                      <p className="text-xs text-slate-500">Vencimento em 3 dias úteis · {formatarMoeda(solicitacao.valor)}</p>
                    </div>
                  </div>
                  {solicitacao.asaasBankSlipUrl && (
                    <a
                      href={solicitacao.asaasBankSlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir Boleto
                    </a>
                  )}
                  {solicitacao.asaasInvoiceUrl && (
                    <a
                      href={solicitacao.asaasInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 border border-violet-200 text-violet-700 font-bold rounded-xl transition text-sm hover:bg-violet-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver fatura completa
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={verificarStatus}
                disabled={verificando}
                className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${verificando ? 'animate-spin' : ''}`} />
                {verificando ? 'Verificando...' : 'Verificar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
