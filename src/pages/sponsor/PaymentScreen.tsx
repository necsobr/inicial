import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CreditCard, CheckCircle, ShieldCheck, DollarSign, ArrowLeft } from 'lucide-react';
import { formatarMoeda } from '../../utils/format';

interface PaymentScreenProps {
  empresa: string;
  equipeNome: string;
  semana: string;
  valor: number;
  onSucesso: () => void;
  onCancelar: () => void;
}

export default function PaymentScreen({ empresa, equipeNome, semana, valor, onSucesso, onCancelar }: PaymentScreenProps) {
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleNumeroCartao = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    const partes = [];
    for (let i = 0; i < v.length; i += 4) partes.push(v.slice(i, i + 4));
    setNumeroCartao(partes.join(' '));
  };

  const handleValidade = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
    setValidade(v);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (numeroCartao.replace(/\s/g, '').length < 16 || !nomeCartao || validade.length < 5 || cvv.length < 3) {
      alert('Preencha todos os campos do cartão corretamente.');
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setSucesso(true);
    }, 1500);
  };

  if (sucesso) {
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
              <span>Status:</span>
              <strong className="text-emerald-600 uppercase">Aguardando Aprovação</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Empresa:</span>
              <strong>{empresa}</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Mapa / Equipe:</span>
              <strong>{equipeNome}</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Semana:</span>
              <strong>{semana.split('-').reverse().join('/')}</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Valor Pago:</span>
              <strong className="text-[#E63946]">{formatarMoeda(valor)}</strong>
            </div>
            <div className="py-2 flex justify-between text-[10px] text-slate-400">
              <span>ID Transação:</span>
              <span className="font-mono">txn_{Math.random().toString(36).substring(2, 11)}</span>
            </div>
          </div>
          <button
            onClick={onSucesso}
            className="w-full py-3.5 bg-[#E63946] hover:bg-[#d62839] text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Retornar ao Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      <button
        onClick={onCancelar}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Formulário
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl p-6 shadow-xl glass-card">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#E63946]" />
              Resumo do Patrocínio
            </h3>
            <div className="space-y-4 text-xs text-slate-600">
              <div className="bg-white/40 p-4 rounded-xl border border-white/20 space-y-2">
                <div className="flex justify-between">
                  <span>Empresa:</span>
                  <strong className="text-slate-800">{empresa}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mapa / Equipe:</span>
                  <strong className="text-slate-800">{equipeNome}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Semana desejada:</span>
                  <strong className="text-slate-800">{semana.split('-').reverse().join('/')}</strong>
                </div>
              </div>
              <div className="border-t border-white/35 pt-4 flex justify-between text-base font-bold text-slate-800">
                <span>Total:</span>
                <span className="text-[#E63946]">{formatarMoeda(valor)}</span>
              </div>
            </div>
            <div className="mt-6 p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2 text-[11px] text-indigo-700 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-600" />
              <div>
                <strong>Ambiente de Simulação:</strong> Nenhuma cobrança real será efetuada. Dados fictícios apenas para demonstração.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-3xl p-8 shadow-xl glass-card">
            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#E63946]" />
              Dados do Cartão de Crédito
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Número do Cartão</label>
                <input
                  type="text"
                  required
                  value={numeroCartao}
                  onChange={handleNumeroCartao}
                  placeholder="0000 0000 0000 0000"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-slate-800 outline-none focus:border-[#E63946] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Nome no Cartão</label>
                <input
                  type="text"
                  required
                  value={nomeCartao}
                  onChange={e => setNomeCartao(e.target.value)}
                  placeholder="Ex: CARLOS ALBERTO SILVA"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-slate-800 uppercase outline-none focus:border-[#E63946] focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Validade</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={validade}
                    onChange={handleValidade}
                    placeholder="MM/AA"
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-slate-800 outline-none focus:border-[#E63946] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-slate-800 outline-none focus:border-[#E63946] focus:bg-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={enviando}
                className="w-full py-4 bg-[#E63946] hover:bg-[#d62839] text-white font-bold rounded-xl shadow-lg shadow-[#E63946]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Pagamento Simulado'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
