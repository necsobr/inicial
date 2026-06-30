import { useState, useRef } from 'react';
import { Printer, CheckCircle, Play, Search, Package, Download, Edit2, X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { mapaReferenciaService } from '../../services/storeService';
import { getToken } from '../../services/api';
import { formatarData } from '../../utils/format';
import Modal from '../../components/Modal';
import type { StatusMapaReferencia } from '../../types';

const sequencia: StatusMapaReferencia[] = ['recebido', 'em_producao', 'pronto', 'entregue'];

const LABEL: Record<StatusMapaReferencia, string> = {
  recebido:    'Recebido',
  em_producao: 'Em Produção',
  pronto:      'Pronto',
  entregue:    'Entregue',
};

const BADGE: Record<StatusMapaReferencia, string> = {
  recebido:    'bg-amber-100 text-amber-700 border-amber-200',
  em_producao: 'bg-blue-100 text-blue-700 border-blue-200',
  pronto:      'bg-indigo-100 text-indigo-700 border-indigo-200',
  entregue:    'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function ProductionDashboard() {
  const { mapaReferencia, setMapaReferencia, equipes, eventos, ordensServico } = useStore();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroEquipe, setFiltroEquipe] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mapaParaImprimir, setMapaParaImprimir] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [carregandoPdf, setCarregandoPdf] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filtrados = mapaReferencia.filter(m => {
    const eq = equipes.find(e => e.id === m.equipeId);
    const buscaOk = !busca ||
      (eq?.nome ?? '').toLowerCase().includes(busca.toLowerCase()) ||
      m.nomeArquivo.toLowerCase().includes(busca.toLowerCase());
    const stOk = !filtroStatus || m.status === filtroStatus;
    const eqOk = !filtroEquipe || m.equipeId === filtroEquipe;
    return buscaOk && stOk && eqOk;
  });

  const avancarStatus = async (id: string) => {
    const mapa = mapaReferencia.find(m => m.id === id);
    if (!mapa) return;
    const idx = sequencia.indexOf(mapa.status);
    if (idx === sequencia.length - 1) return;
    const novoStatus = sequencia[idx + 1];
    try {
      const atualizado = await mapaReferenciaService.atualizarStatus(id, novoStatus);
      setMapaReferencia(mapaReferencia.map(m => m.id === id ? atualizado : m));
    } catch {}
  };

  const editarStatus = async (id: string, novoStatus: StatusMapaReferencia) => {
    try {
      const atualizado = await mapaReferenciaService.atualizarStatus(id, novoStatus);
      setMapaReferencia(mapaReferencia.map(m => m.id === id ? atualizado : m));
    } catch {}
    setEditandoId(null);
  };

  const naFila = mapaReferencia.filter(m => m.status !== 'entregue').length;

  const mapaAtual = mapaReferencia.find(m => m.id === mapaParaImprimir);
  const osAtual = mapaAtual ? ordensServico.find(o => o.id === mapaAtual.ordemServicoId) : null;
  const eqAtual = mapaAtual ? equipes.find(e => e.id === mapaAtual.equipeId) : null;
  const evAtual = mapaAtual ? eventos.find(e => e.id === mapaAtual.eventoId) : null;
  const copiasPorImpressao = osAtual
    ? Math.floor((osAtual.numeroCopias ?? 1) / Math.max(osAtual.numeroReunioes, 1))
    : 1;

  return (
    <div className="min-h-full bg-[#F8F9FA]">
      <div className="relative bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-8">
        <div className="blob -top-20 right-0 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Painel de Produção</h1>
            <p className="text-sm text-slate-400 mt-1">Fila de mapas de referência para impressão</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
            <Printer className="h-4 w-4" />
            {naFila} mapa{naFila !== 1 ? 's' : ''} na fila
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 p-4 rounded-2xl glass-card">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar equipe ou arquivo..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-[#E63946]"
            />
          </div>
          <select
            value={filtroEquipe}
            onChange={e => setFiltroEquipe(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-[#E63946]"
          >
            <option value="">Todas as equipes</option>
            {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
          </select>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-[#E63946]"
          >
            <option value="">Todos os status</option>
            {sequencia.map(s => <option key={s} value={s}>{LABEL[s]}</option>)}
          </select>
          <div className="flex items-center text-sm text-slate-400 font-medium px-2">
            {filtrados.length} de {mapaReferencia.length} mapas
          </div>
        </div>

        {/* Tabela */}
        {filtrados.length === 0 ? (
          <div className="text-center py-20 rounded-2xl glass-card text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum mapa encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl glass-card shadow-xl">
            <table className="min-w-full divide-y divide-slate-200/40">
              <thead className="bg-[#E63946]/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Equipe / Arquivo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Entregar até</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Endereço</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20">
                {filtrados.map(m => {
                  const eq = equipes.find(e => e.id === m.equipeId);
                  const ev = eventos.find(e => e.id === m.eventoId);
                  const idx = sequencia.indexOf(m.status);
                  const proxStatus = idx < sequencia.length - 1 ? sequencia[idx + 1] : null;
                  const entregue = m.status === 'entregue';
                  return (
                    <tr key={m.id} className={`hover:bg-white/10 transition-colors ${entregue ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{eq?.nome ?? `Equipe ${m.equipeId}`}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{m.nomeArquivo}</p>
                          {m.fileUrl && (
                            <a href={m.fileUrl} target="_blank" rel="noreferrer" title="Baixar PDF" className="text-[#E63946] hover:text-[#d62839]">
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {ev ? <>{ev.titulo}<br /><span className="text-xs text-slate-400">{formatarData(ev.data)}</span></> : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatarData(m.dataEntrega)}<br />
                        <span className="text-xs text-slate-400">{m.horaEntrega}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[180px]">
                        <p className="truncate">{m.enderecoEntrega || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${BADGE[m.status]}`}>
                          {LABEL[m.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editandoId === m.id ? (
                          <div className="flex items-center gap-1.5 justify-center">
                            <select
                              autoFocus
                              defaultValue={m.status}
                              onChange={e => { void editarStatus(m.id, e.target.value as StatusMapaReferencia); }}
                              className="text-xs rounded-lg border border-slate-200 bg-white py-1.5 px-2 outline-none focus:border-[#E63946]"
                            >
                              {sequencia.map(s => (
                                <option key={s} value={s}>{LABEL[s]}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => setEditandoId(null)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 justify-center">
                            {proxStatus && (
                              <button
                                onClick={() => { void avancarStatus(m.id); }}
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                                  proxStatus === 'entregue'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-500 hover:text-white'
                                    : 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20 hover:bg-[#E63946] hover:text-white'
                                }`}
                              >
                                {proxStatus === 'entregue' ? <CheckCircle className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                {LABEL[proxStatus]}
                              </button>
                            )}
                            {entregue && (
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Concluído
                              </span>
                            )}
                            <button
                              onClick={() => setEditandoId(m.id)}
                              title="Editar etapa"
                              className="p-1.5 text-slate-400 hover:text-[#E63946] hover:bg-[#E63946]/10 rounded-lg transition border border-transparent hover:border-[#E63946]/20"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {m.fileUrl && (
                              <button
                                onClick={async () => {
                                  setMapaParaImprimir(m.id);
                                  setCarregandoPdf(true);
                                  try {
                                    const res = await fetch(`/api/reference-maps/${m.id}/file`, {
                                    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
                                  });
                                    const blob = await res.blob();
                                    setPdfBlobUrl(URL.createObjectURL(blob));
                                  } catch { /* mantém o modal aberto sem prévia */ }
                                  finally { setCarregandoPdf(false); }
                                }}
                                title="Imprimir"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition border border-transparent hover:border-indigo-200"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban por status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sequencia.map(st => {
            const items = mapaReferencia.filter(m => m.status === st);
            return (
              <div key={st} className={`rounded-2xl p-4 border ${BADGE[st].split(' ').slice(-1)[0]} bg-white/50`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{LABEL[st]}</p>
                <p className="text-3xl font-extrabold text-slate-800">{items.length}</p>
                {items.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {items.slice(0, 2).map(m => {
                      const eq = equipes.find(e => e.id === m.equipeId);
                      return <p key={m.id} className="text-xs text-slate-500 truncate">{eq?.nome ?? `Equipe ${m.equipeId}`}</p>;
                    })}
                    {items.length > 2 && <p className="text-xs text-slate-400">+{items.length - 2} mais</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        aberto={!!mapaParaImprimir}
        onFechar={() => {
          if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
          setPdfBlobUrl(null);
          setMapaParaImprimir(null);
        }}
        titulo="Imprimir Mapa de Referência"
      >
        {mapaAtual && (
          <div className="space-y-4">
            {/* Instruções de impressão */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-center">
                <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Cópias</p>
                <p className="text-3xl font-extrabold text-indigo-700">{copiasPorImpressao}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Papel</p>
                <p className="text-3xl font-extrabold text-slate-700">{osAtual?.tipoPapel ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Impressora</p>
                <p className="text-sm font-extrabold text-slate-700 leading-tight mt-1">
                  {osAtual?.tipoPapel === 'A3' ? 'Epson L1455' : 'Epson L4260'}
                </p>
              </div>
            </div>

            {/* Prévia do PDF */}
            <div className="w-full rounded-xl border border-slate-200 overflow-hidden" style={{ height: '420px' }}>
              {carregandoPdf ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm gap-2">
                  <span className="h-4 w-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                  Carregando PDF...
                </div>
              ) : pdfBlobUrl ? (
                <iframe
                  ref={iframeRef}
                  src={pdfBlobUrl}
                  className="w-full h-full border-none"
                  title="preview-pdf"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Não foi possível carregar a prévia.
                </div>
              )}
            </div>

            {/* Info do mapa */}
            <div className="text-xs text-slate-500 space-y-0.5">
              <p><span className="font-semibold text-slate-700">Equipe:</span> {eqAtual?.nome ?? '—'}</p>
              <p><span className="font-semibold text-slate-700">Evento:</span> {evAtual?.titulo ?? '—'} {evAtual ? `— ${formatarData(evAtual.data)}` : ''}</p>
              <p><span className="font-semibold text-slate-700">Arquivo:</span> {mapaAtual.nomeArquivo}</p>
              <p><span className="font-semibold text-slate-700">Entrega:</span> {formatarData(mapaAtual.dataEntrega)} às {mapaAtual.horaEntrega} — {mapaAtual.enderecoEntrega}</p>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => {
                  if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
                  setPdfBlobUrl(null);
                  setMapaParaImprimir(null);
                }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!pdfBlobUrl) return;
                  const popup = window.open(pdfBlobUrl, '_blank', 'popup,width=900,height=700');
                  if (popup) setTimeout(() => popup.print(), 1000);
                }}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
