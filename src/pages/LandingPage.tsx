import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Users, Printer, BarChart3, ShieldCheck, Clock, FileText,
  MapPin, Trophy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const recursos = [
  { icone: Users, titulo: 'Gestão de Equipes', texto: 'Cadastre e gerencie membros, gestores e equipes de networking com perfis hierárquicos.' },
  { icone: Printer, titulo: 'Fila de Impressão', texto: 'Solicite e acompanhe mapas de referência da produção até a entrega física.' },
  { icone: BarChart3, titulo: 'Estatísticas em Tempo Real', texto: 'Visualize referências, negócios gerados, reuniões 1-a-1 e muito mais.' },
  { icone: ShieldCheck, titulo: 'Controle de Patrocinadores', texto: 'Gerencie solicitações e aprovações de patrocínio com fluxo de pagamento simulado.' },
  { icone: Clock, titulo: 'Calendário de Eventos', texto: 'Acompanhe reuniões, palestrantes e eventos especiais da equipe.' },
  { icone: FileText, titulo: 'Multi-perfis de Acesso', texto: 'ADM, Coordenador, Patrocinador e Produção, cada um com seu painel dedicado.' },
];

const perfis = [
  { icone: ShieldCheck, cor: 'bg-red-500/10 text-red-600', titulo: 'Administradores', texto: 'Controle total do sistema, usuários, equipes e integrações.' },
  { icone: Trophy, cor: 'bg-emerald-500/10 text-emerald-600', titulo: 'Coordenadores', texto: 'Declaram Ordens de Serviço, gerenciam membros e solicitam impressões.' },
  { icone: MapPin, cor: 'bg-indigo-500/10 text-indigo-600', titulo: 'Membros', texto: 'Acompanham o calendário do grupo e a fila para patrocinar mapas.' },
  { icone: Printer, cor: 'bg-amber-500/10 text-amber-600', titulo: 'Produção', texto: 'Visualize e avance a fila de requisições de impressão.' },
];

export default function LandingPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const destino = () => {
    if (!usuario) return '/login';
    if (usuario.papel === 'admin') return '/admin';
    if (usuario.papel === 'coordenador') return '/coordenador';
    if (usuario.papel === 'trio') return '/trio';
    if (usuario.papel === 'membro') return '/membro';
    return '/producao';
  };

  return (
    <div className="relative overflow-hidden flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="blob -top-40 -left-40 opacity-80 pointer-events-none" />
      <div className="blob top-1/3 right-0 opacity-50 pointer-events-none" />
      <div className="blob -bottom-40 left-10 opacity-60 pointer-events-none" />

      {/* Hero */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 text-xs font-bold tracking-wider uppercase mb-6 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E63946]" />
          Gestão inteligente de mapas de referência BNI
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-tight">
          Seus mapas de referência com{' '}
          <span className="bg-gradient-to-r from-[#E63946] to-indigo-600 bg-clip-text text-transparent">
            gestão integrada
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-slate-600 mx-auto leading-relaxed">
          A plataforma <strong>AIprint</strong> centraliza o cadastro de equipes, membros, eventos,
          patrocinadores e a fila de produção dos seus mapas de referência.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(destino())}
            className="flex items-center justify-center gap-2 font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-8 py-3.5 rounded-xl shadow-lg shadow-[#E63946]/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            {usuario ? 'Ir para o Painel' : 'Acessar Plataforma'}
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href="#recursos"
            className="flex items-center justify-center font-bold text-slate-700 bg-white/60 hover:bg-white/80 border border-white/40 backdrop-blur px-8 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            Conhecer Funcionalidades
          </a>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="py-16 px-4 border-t border-white/20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Uma solução, frentes integradas</h2>
            <p className="mt-3 text-slate-500 max-w-md mx-auto">
              Da concepção do mapa pelo gestor até a entrega física e faturamento.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map((r, i) => {
              const Icone = r.icone;
              return (
                <div key={i} className="relative rounded-2xl p-6 glass-card transition-all duration-300 hover:bg-white/60 hover:shadow-lg hover:scale-[1.02]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 mb-4">
                    <Icone className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{r.titulo}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{r.texto}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="py-16 px-4 border-t border-white/20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Para quem é</h2>
            <p className="mt-3 text-slate-500 max-w-md mx-auto">
              Quatro perfis de usuário, cada um com seu painel dedicado.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perfis.map((p, i) => {
              const Icone = p.icone;
              return (
                <div key={i} className="rounded-2xl p-6 glass-card text-center transition-all duration-300 hover:bg-white/60 hover:shadow-lg">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${p.cor} mb-4`}>
                    <Icone className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{p.titulo}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{p.texto}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/20 bg-white/30 backdrop-blur mt-auto">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E63946] text-white">
              <Printer className="h-3.5 w-3.5" />
            </div>
            <span className="font-black text-slate-800">AIprint</span>
          </div>
          <p className="text-sm text-slate-500">&copy; 2026 AIprint. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <span className="hover:text-[#E63946] cursor-pointer transition">Termos de Uso</span>
            <span className="hover:text-[#E63946] cursor-pointer transition">Privacidade</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
