/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, CheckCircle, ShieldCheck, DollarSign, Calendar, ArrowLeft } from 'lucide-react';

interface PaymentScreenProps {
  amount: number;
  paperType: string;
  copies: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentScreen({
  amount,
  paperType,
  copies,
  onPaymentSuccess,
  onCancel
}: PaymentScreenProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simple formatting helper
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // add spaces
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setExpiry(value.slice(0, 2) + '/' + value.slice(2));
    } else {
      setExpiry(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 15 || !cardName || expiry.length < 5 || cvv.length < 3) {
      alert('Por favor, preencha todos os campos do cartão de crédito corretamente.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 animate-in fade-in duration-300">
        <div className="rounded-3xl p-8 shadow-2xl glass-card text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800">Pagamento Confirmado!</h2>
            <p className="text-sm text-slate-500">Sua participação no patrocínio deste mês foi creditada com sucesso.</p>
          </div>

          <div className="bg-white/45 rounded-xl p-5 border border-white/50 text-xs text-left text-slate-700 divide-y divide-slate-100">
            <div className="py-2 flex justify-between">
              <span>Status faturamento:</span>
              <strong className="text-emerald-600 font-extrabold uppercase">Pago / Aprovado</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Tipo de Papel da Ficha:</span>
              <strong>{paperType}</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Tiragem de Cópias:</span>
              <strong>{copies} unidades</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span>Valor Creditado:</span>
              <strong className="text-slate-800">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="py-2 flex justify-between text-[10px] text-slate-400">
              <span>ID Transação:</span>
              <span className="font-mono">txn_{Math.random().toString(36).substr(2, 9)}</span>
            </div>
          </div>

          <button
            id="btn-return-sponsor-dashboard"
            onClick={onPaymentSuccess}
            className="w-full py-3.5 bg-[#E63946] hover:bg-[#d62839] text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Retornar ao Dashboard de Patrocínio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <button 
        onClick={onCancel}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Retornar ao Orçamento</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side Column: Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl p-6 shadow-xl glass-card">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#E63946]" />
              Resumo do Faturamento
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="bg-white/40 p-4 rounded-xl border border-white/20 space-y-2">
                <div className="flex justify-between">
                  <span>Papel da Ficha:</span>
                  <strong className="text-slate-800">{paperType}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tiragem contratada:</span>
                  <strong className="text-slate-800">{copies} cópias</strong>
                </div>
              </div>

              <div className="border-t border-white/35 pt-4 flex justify-between text-base font-bold text-slate-800">
                <span>Total Calculado:</span>
                <span className="text-[#E63946]">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2 text-[11px] text-indigo-700 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-600" />
              <div>
                <strong>Ambiente de Simulação Seguro:</strong> Suas credenciais fictícias digitadas não são enviadas a adquirentes e servem para simular as regras de checkout da AIprint.
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Column: Form checkout details */}
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
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-slate-800 outline-none focus:border-[#E63946] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Nome Impresso no Cartão</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
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
                    value={expiry}
                    onChange={handleExpiryChange}
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
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-slate-800 outline-none focus:border-[#E63946] focus:bg-white"
                  />
                </div>
              </div>

              <button
                id="btn-confirm-simulated-payment"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#E63946] hover:bg-[#d62839] text-white font-bold rounded-xl shadow-lg shadow-[#E63946]/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Processando simulação...</span>
                  </>
                ) : (
                  <span>Confirmar Pagamento Simulado</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
