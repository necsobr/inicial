/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, Printer, Users, BarChart3, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  isLoggedIn: boolean;
}

export default function LandingPage({ onNavigate, isLoggedIn }: LandingPageProps) {
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex-grow flex flex-col justify-between w-full text-slate-800">
      {/* Absolute Decorative Circles for Glassmorphism backdrop popping */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-[#E63946]/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      
      <div className="flex-grow flex flex-col justify-center py-4">
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-4 pt-4 pb-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 text-[10px] font-bold tracking-wider uppercase mb-3 animate-pulse">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#E63946]" />
            Gestão inteligente de fichas de produção & impressão
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl max-w-2xl mx-auto leading-tight">
            Suas fichas de produção editadas com <span className="bg-gradient-to-r from-[#E63946] to-indigo-600 bg-clip-text text-transparent">alta fidelidade</span>, sob gestão integrada.
          </h1>
          
          <p className="mt-2.5 max-w-xl text-xs sm:text-sm text-slate-600 mx-auto leading-relaxed font-medium">
            A plataforma <strong>AIprint</strong> simplifica o fluxo de elaboração, patrocínio e entrega física de fichas de produção. Otimize orçamentos, integre com APIs de impressão automatizada e impulsione parcerias estratégicas.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              id="btn-hero-cta"
              onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'login')}
              className="flex items-center justify-center gap-2 font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-6 py-2.5 rounded-lg shadow-lg shadow-[#E63946]/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-xs"
            >
              <span>{isLoggedIn ? 'Ir para o Painel' : 'Acessar plataforma'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#features"
              className="flex items-center justify-center font-bold text-slate-700 bg-white/60 hover:bg-white/80 border border-white/40 backdrop-blur px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all text-xs"
            >
              Conhecer Funcionalidades
            </a>
          </div>
        </div>

        {/* Features Grid and Information cards with GLASS DESIGN */}
        <div id="features" className="mx-auto max-w-7xl px-4 py-4 border-t border-white/10">
          <div className="text-center mb-5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Uma solução, frentes integradas</h2>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto font-medium">
              Da concepção da ficha pelo Coordenador até a entrega física e faturamento.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="relative rounded-2xl p-4 glass-card transition-all duration-300 hover:bg-white/50 hover:shadow-md hover:scale-[1.01]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 mb-2.5 shadow-sm">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Multi-Perfis de Acesso</h3>
              <p className="text-slate-600 text-xs leading-normal">
                Painéis para Administradores, Patrocinadores, Coordenadores, Produção e Trio de Apoio, garantindo compliance e controle.
              </p>
            </div>

            {/* Card 2 */}
            <div className="relative rounded-2xl p-4 glass-card transition-all duration-300 hover:bg-white/50 hover:shadow-md hover:scale-[1.01]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 mb-2.5 shadow-sm">
                <Printer className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Automação Gráfica</h3>
              <p className="text-slate-600 text-xs leading-normal">
                Configure papéis das impressões, envie arquivos PDF do projeto e despache a produção direto para APIs gráficas parceiras.
              </p>
            </div>

            {/* Card 3 */}
            <div className="relative rounded-2xl p-4 glass-card transition-all duration-300 hover:bg-white/50 hover:shadow-md hover:scale-[1.01]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 mb-2.5 shadow-sm">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Simulação de Pagamento</h3>
              <p className="text-slate-600 text-xs leading-normal">
                Acesse a fila do mês, visualize o orçamento calculado de acordo com papel, e realize pagamentos de teste integrados.
              </p>
            </div>

            {/* Card 4 */}
            <div className="relative rounded-2xl p-4 glass-card transition-all duration-300 hover:bg-white/50 hover:shadow-md hover:scale-[1.01]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 mb-2.5 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Garantia Administrativa</h3>
              <p className="text-slate-600 text-xs leading-normal">
                Gerencie usuários cadastrados, configure as equipes ativas e defina os tokens criptográficos das APIs gráficas instaladas.
              </p>
            </div>

            {/* Card 5 */}
            <div className="relative rounded-2xl p-4 glass-card transition-all duration-300 hover:bg-white/50 hover:shadow-md hover:scale-[1.01]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 mb-2.5 shadow-sm">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Fila de Produção e Entrega</h3>
              <p className="text-slate-600 text-xs leading-normal">
                Siga status de impressão instantâneos, controle agendas de faturamento e agende entregas físicas com data e hora.
              </p>
            </div>

            {/* Card 6 */}
            <div className="relative rounded-2xl p-4 glass-card transition-all duration-300 hover:bg-white/50 hover:shadow-md hover:scale-[1.01]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 mb-2.5 shadow-sm">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Sincronização Ativa</h3>
              <p className="text-slate-600 text-xs leading-normal">
                Alertas automáticos de novos patrocinadores, andamento dos lotes impressos e atualizações em tempo real das equipes de apoio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full py-4 bg-white/50 border-t border-white/10 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center">
          <p className="text-xs text-slate-500">
            &copy; 2026 AIprint Corp. Todos os direitos reservados.
          </p>
          <div className="flex justify-center gap-6 mt-2 sm:mt-0 text-[11px] font-medium text-slate-500">
            <span className="hover:text-[#E63946] cursor-pointer">Termos de Uso</span>
            <span className="hover:text-[#E63946] cursor-pointer">Privacidade</span>
            <span className="hover:text-[#E63946] cursor-pointer">Documentação API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
