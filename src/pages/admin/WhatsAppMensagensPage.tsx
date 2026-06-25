import { useState, useEffect } from 'react';
import { MessageCircle, Save, Send, CheckCircle, XCircle, Tag } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { integracaoService } from '../../services/storeService';
import type { MensagensAutomaticasWhatsApp } from '../../types';

type MsgKey = keyof MensagensAutomaticasWhatsApp;

const TEMPLATES: {
  key: MsgKey;
  label: string;
  descricao: string;
  variaveis: string[];
  placeholder: string;
}[] = [
  {
    key: 'boasVindas',
    label: 'Boas-vindas ao novo membro',
    descricao: 'Enviada automaticamente após o cadastro de um novo membro ser aprovado.',
    variaveis: ['{nome}', '{equipe}'],
    placeholder: 'Olá {nome}, seja bem-vindo(a) ao grupo {equipe}! Estamos animados para tê-lo(a) conosco.',
  },
  {
    key: 'notificacaoEvento',
    label: 'Lembrete de evento',
    descricao: 'Enviada antes de uma reunião ou evento agendado.',
    variaveis: ['{nome}', '{evento}', '{data}', '{hora}', '{local}'],
    placeholder: 'Olá {nome}, lembrete: {evento} no dia {data} às {hora} em {local}.',
  },
  {
    key: 'confirmacaoPagamento',
    label: 'Confirmação de pagamento',
    descricao: 'Enviada após confirmação de pagamento de cota de patrocínio.',
    variaveis: ['{nome}', '{valor}', '{semana}'],
    placeholder: 'Olá {nome}, confirmamos o recebimento de R$ {valor} referente à semana {semana}. Obrigado!',
  },
  {
    key: 'novaReferencia',
    label: 'Nova referência recebida',
    descricao: 'Enviada quando um membro recebe uma nova referência de negócio.',
    variaveis: ['{nome}', '{remetente}'],
    placeholder: 'Olá {nome}, você recebeu uma nova referência de {remetente}! Acesse o sistema para mais detalhes.',
  },
  {
    key: 'entregaMapa',
    label: 'Mapa pronto para entrega',
    descricao: 'Enviada quando o mapa de referência da equipe está pronto.',
    variaveis: ['{nome}', '{equipe}', '{data}', '{hora}', '{endereco}'],
    placeholder: 'Olá {nome}, o mapa da equipe {equipe} está pronto! Entrega: {data} às {hora} — {endereco}.',
  },
  {
    key: 'aprovacaoAdesao',
    label: 'Aprovação de adesão à equipe',
    descricao: 'Enviada quando a solicitação de adesão de um membro é aceita.',
    variaveis: ['{nome}', '{equipe}'],
    placeholder: 'Olá {nome}, sua solicitação para entrar na equipe {equipe} foi aprovada! Bem-vindo(a).',
  },
  {
    key: 'vezNaFila',
    label: 'Vez na fila de patrocínio',
    descricao: 'Enviada ao usuário quando chega a sua vez na fila da O.S. para se tornar patrocinador.',
    variaveis: ['{nome}', '{osId}', '{valor}', '{prazo}'],
    placeholder: 'Olá {nome}! Chegou a sua vez na fila de patrocínio da O.S. #{osId}. Valor: {valor}. Você tem {prazo} para confirmar e realizar o pagamento no sistema.',
  },
  {
    key: 'solicitacaoEntrada',
    label: 'Solicitação de entrada no grupo',
    descricao: 'Enviada ao coordenador e trio quando alguém solicita entrar na equipe.',
    variaveis: ['{nome}', '{telefone}'],
    placeholder: 'Nova solicitação de entrada no grupo: {nome} — Tel: {telefone}. Acesse o sistema para aceitar ou recusar.',
  },
  {
    key: 'entradaGrupo',
    label: 'Confirmação de entrada no grupo',
    descricao: 'Enviada ao usuário quando sua solicitação de adesão é aceita.',
    variaveis: ['{nome}', '{equipe}'],
    placeholder: 'Olá {nome}! Você foi aceito(a) no grupo {equipe}. Acesse o sistema para começar.',
  },
  {
    key: 'osPreenchida',
    label: 'O.S. com vagas preenchidas',
    descricao: 'Enviada ao coordenador e trio quando todas as vagas de patrocínio de uma O.S. são preenchidas.',
    variaveis: ['{osId}', '{vagas}'],
    placeholder: 'Todas as {vagas} vaga(s) de patrocínio da O.S. #{osId} foram preenchidas!',
  },
  {
    key: 'lembreteMapa3dias',
    label: 'Lembrete de mapa — 3 dias (coordenador)',
    descricao: 'Enviada ao coordenador 3 dias antes do evento se o mapa ainda não foi enviado.',
    variaveis: ['{nome}', '{evento}', '{data}'],
    placeholder: 'Olá {nome}, o evento "{evento}" acontece em {data}. Lembre-se de enviar o mapa de referência no sistema.',
  },
  {
    key: 'lembreteMapa1dia',
    label: 'Lembrete de mapa — 1 dia (trio)',
    descricao: 'Enviada ao trio 1 dia antes do evento se o coordenador ainda não enviou o mapa.',
    variaveis: ['{nome}', '{evento}', '{data}'],
    placeholder: 'Atenção {nome}: o mapa de referência do evento "{evento}" (amanhã, {data}) ainda não foi enviado pelo coordenador.',
  },
  {
    key: 'lembretePatrocinador',
    label: 'Lembrete para patrocinadores — 1 dia antes',
    descricao: 'Enviada a todos os patrocinadores confirmados 1 dia antes do evento.',
    variaveis: ['{nome}', '{evento}', '{data}', '{local}'],
    placeholder: 'Olá {nome}! Lembramos que amanhã ({data}) acontece o evento "{evento}" em {local}. Contamos com sua presença como patrocinador!',
  },
  {
    key: 'mapaRecebido',
    label: 'PDF do mapa recebido',
    descricao: 'Enviada à produção quando o coordenador faz upload do PDF do mapa. Fora do horário comercial (9h–17h), chega apenas às 9h do próximo dia útil.',
    variaveis: ['{equipe}', '{papel}', '{dataEntrega}', '{horaEntrega}', '{endereco}'],
    placeholder: 'Novo mapa recebido! Equipe: {equipe} | Papel: {papel} | Entrega: {dataEntrega} às {horaEntrega} — {endereco}. Acesse o sistema para colocar em produção.',
  },
  {
    key: 'impressaoConcluida',
    label: 'Impressão concluída',
    descricao: 'Enviada à produção quando o mapa de referência termina de imprimir e está pronto para entrega.',
    variaveis: ['{equipe}', '{papel}', '{copias}', '{dataEntrega}', '{horaEntrega}', '{endereco}'],
    placeholder: 'Mapa da equipe {equipe} ({papel}) impresso com sucesso! {copias} cópias prontas para entrega em {dataEntrega} às {horaEntrega} — {endereco}.',
  },
  {
    key: 'falhaImpressao',
    label: 'Falha na impressão',
    descricao: 'Enviada à produção quando um mapa de referência falha ao imprimir após todas as tentativas.',
    variaveis: ['{equipe}', '{papel}', '{erro}'],
    placeholder: 'Atenção produção: falha ao imprimir o mapa da equipe {equipe} ({papel}). Erro: {erro}. Acesse o sistema para reenviar.',
  },
];

const MSG_VAZIA: MensagensAutomaticasWhatsApp = {
  boasVindas: '', notificacaoEvento: '', confirmacaoPagamento: '',
  novaReferencia: '', entregaMapa: '', aprovacaoAdesao: '',
  vezNaFila: '', solicitacaoEntrada: '', entradaGrupo: '', osPreenchida: '',
  lembreteMapa3dias: '', lembreteMapa1dia: '', lembretePatrocinador: '',
  mapaRecebido: '', impressaoConcluida: '', falhaImpressao: '',
};

export default function WhatsAppMensagensPage() {
  const { integracoes, atualizarIntegracao } = useStore();
  const whatsapp = integracoes.find(i => i.tipo === 'whatsapp');

  const [msgs, setMsgs] = useState<MensagensAutomaticasWhatsApp>(MSG_VAZIA);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (whatsapp?.mensagensAutomaticas) {
      setMsgs({ ...MSG_VAZIA, ...whatsapp.mensagensAutomaticas });
    }
  }, [whatsapp]);

  const salvar = async () => {
    if (!whatsapp) return;
    setSalvando(true);
    try {
      await atualizarIntegracao(whatsapp.id, { mensagensAutomaticas: msgs });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch {} finally {
      setSalvando(false);
    }
  };

  const enviarTeste = async () => {
    if (!whatsapp || !testPhone.trim() || !testMessage.trim()) return;
    setEnviando(true);
    setResultadoEnvio(null);
    try {
      const res = await integracaoService.enviarMensagemTeste(whatsapp.id, testPhone, testMessage);
      setResultadoEnvio({ ok: res.success, msg: res.message });
    } catch {
      setResultadoEnvio({ ok: false, msg: 'Erro ao enviar mensagem.' });
    } finally {
      setEnviando(false);
    }
  };

  if (!whatsapp) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Mensagens WhatsApp</h1>
          <p className="text-sm text-slate-500 mt-1">Nenhuma integração WhatsApp configurada.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700 font-medium">
          Configure uma integração do tipo WhatsApp em <strong>Configurações</strong> antes de editar mensagens.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Mensagens WhatsApp</h1>
        <p className="text-sm text-slate-500 mt-1">
          Personalize os textos enviados automaticamente pelo sistema via <strong>{whatsapp.nome}</strong>.
        </p>
      </div>

      {/* Templates */}
      <div className="space-y-4">
        {TEMPLATES.map(t => (
          <div key={t.key} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-slate-800 text-sm">{t.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.descricao}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {t.variaveis.map(v => (
                  <span key={v} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 font-mono">
                    <Tag className="h-2.5 w-2.5" />{v}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 py-4">
              <textarea
                rows={3}
                placeholder={t.placeholder}
                value={msgs[t.key] ?? ''}
                onChange={e => setMsgs(p => ({ ...p, [t.key]: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition resize-none"
              />
              {!msgs[t.key] && (
                <button
                  onClick={() => setMsgs(p => ({ ...p, [t.key]: t.placeholder }))}
                  className="mt-2 text-[11px] text-slate-400 hover:text-[#E63946] font-medium transition"
                >
                  Usar texto sugerido
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Salvar */}
      <div className="flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={salvando}
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#E63946] hover:bg-[#d62839] px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {salvando ? 'Salvando...' : 'Salvar Mensagens'}
        </button>
        {salvo && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <CheckCircle className="h-4 w-4" /> Salvo com sucesso!
          </span>
        )}
      </div>

      {/* Divisor */}
      <div className="border-t border-slate-200" />

      {/* Envio de teste */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-green-600" />
          <h2 className="font-extrabold text-slate-900">Enviar Mensagem de Teste</h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Número (com DDD)</label>
              <input
                type="tel"
                placeholder="11999999999"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-mono text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mensagem</label>
            <textarea
              rows={4}
              placeholder="Digite aqui a mensagem que deseja enviar como teste..."
              value={testMessage}
              onChange={e => setTestMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 outline-none focus:border-[#E63946] focus:bg-white transition resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={enviarTeste}
              disabled={enviando || !testPhone.trim() || !testMessage.trim()}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {enviando ? (
                <span className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {enviando ? 'Enviando...' : 'Enviar Teste'}
            </button>
            {resultadoEnvio && (
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${resultadoEnvio.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                {resultadoEnvio.ok ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {resultadoEnvio.msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
