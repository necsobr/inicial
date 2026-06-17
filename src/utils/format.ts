export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(data: string): string {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(dataHora: string): string {
  if (!dataHora) return '';
  const [data, hora] = dataHora.split(' ');
  return `${formatarData(data)} às ${hora}`;
}

export function labelStatusImpressao(status: string): string {
  const mapa: Record<string, string> = {
    recebido: 'Recebido',
    em_producao: 'Em Produção',
    pronto: 'Pronto',
    entregue: 'Entregue',
  };
  return mapa[status] ?? status;
}

export function labelStatusPatrocinio(status: string): string {
  const mapa: Record<string, string> = {
    aguardando_aprovacao: 'Aguardando Aprovação',
    aprovada: 'Aprovada',
    recusada: 'Recusada',
    concluida: 'Concluída',
  };
  return mapa[status] ?? status;
}

export function labelPapel(papel: string): string {
  const mapa: Record<string, string> = {
    admin: 'Administrador',
    coordenador: 'Coordenador de Comunicação',
    trio: 'Trio',
    membro: 'Membro',
    producao: 'Produção',
  };
  return mapa[papel] ?? papel;
}

export function labelDiaSemana(dia: string | undefined): string {
  if (!dia) return '';
  const mapa: Record<string, string> = {
    domingo: 'Domingo',
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
  };
  return mapa[dia] ?? dia;
}

export function labelStatusOS(status: string): string {
  const mapa: Record<string, string> = {
    ativa: 'Ativa',
    encerrada: 'Encerrada',
    cancelada: 'Cancelada',
  };
  return mapa[status] ?? status;
}
