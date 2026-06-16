import { useStore } from '../../contexts/StoreContext';
import { Users, Layers, Printer, DollarSign, TrendingUp, Activity } from 'lucide-react';

export default function DashboardPage() {
  const { usuarios, equipes, requisicoes, solicitacoes } = useStore();

  const totalEquipes = equipes.length;
  const totalGestores = usuarios.filter(u => u.papel === 'coordenador' && u.ativo).length;
  const totalPatrocinadores = solicitacoes.filter(s => s.status === 'aprovada' || s.status === 'concluida').length;
  const totalNaFila = requisicoes.filter(r => r.status !== 'entregue').length;

  const statusCount = (status: string) => requisicoes.filter(r => r.status === status).length;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Painel Administrativo</h1>
        <p className="text-sm text-slate-500 mt-1">Visão geral da plataforma AIprint</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Equipes Cadastradas', valor: totalEquipes, icone: Layers, cor: 'bg-emerald-500/10 text-emerald-600' },
          { label: 'Gestores Ativos', valor: totalGestores, icone: Users, cor: 'bg-indigo-500/10 text-indigo-600' },
          { label: 'Patrocinadores Ativos', valor: totalPatrocinadores, icone: DollarSign, cor: 'bg-amber-500/10 text-amber-600' },
          { label: 'Pedidos na Fila', valor: totalNaFila, icone: Printer, cor: 'bg-red-500/10 text-red-600' },
        ].map((card, i) => {
          const Icone = card.icone;
          return (
            <div key={i} className="rounded-3xl p-6 glass-card shadow-xl hover:scale-[1.02] transition-all">
              <div className={`h-12 w-12 rounded-2xl ${card.cor} flex items-center justify-center mb-4`}>
                <Icone className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{card.label}</p>
              <h4 className="text-4xl font-extrabold text-slate-800 mt-1">{card.valor}</h4>
            </div>
          );
        })}
      </div>

      {/* Gráfico simplificado: status da fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl p-6 glass-card shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-[#E63946]" />
            <h3 className="font-bold text-slate-900">Pedidos por Status</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Recebido', status: 'recebido', cor: 'bg-amber-500' },
              { label: 'Em Produção', status: 'em_producao', cor: 'bg-blue-500' },
              { label: 'Pronto', status: 'pronto', cor: 'bg-indigo-500' },
              { label: 'Entregue', status: 'entregue', cor: 'bg-emerald-500' },
            ].map(item => {
              const count = statusCount(item.status);
              const total = requisicoes.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.cor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl p-6 glass-card shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-[#E63946]" />
            <h3 className="font-bold text-slate-900">Equipes da Plataforma</h3>
          </div>
          <div className="space-y-4">
            {equipes.map(eq => (
              <div key={eq.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/40">
                <div>
                  <p className="font-bold text-sm text-slate-800">{eq.nome}</p>
                  <p className="text-xs text-slate-400">{eq.cidade} • {eq.stats.totalMembros} membros</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-600">
                    {eq.stats.negociosGeradosReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-slate-400">em negócios</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
