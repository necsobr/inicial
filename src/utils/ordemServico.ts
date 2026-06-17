import type { DiaSemana, Evento, OrdemServico } from '../types';

const INDICE_DIA_SEMANA: Record<DiaSemana, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
};

export function proximaDataDiaSemana(diaSemana: DiaSemana, apartirDe: Date = new Date()): string {
  const alvo = INDICE_DIA_SEMANA[diaSemana];
  const data = new Date(apartirDe);
  const diferenca = (alvo - data.getDay() + 7) % 7;
  data.setDate(data.getDate() + diferenca);
  return data.toISOString().slice(0, 10);
}

export function calcularPrecoCota(numeroReunioes: number, numeroVagasPatrocinador: number, custoBaseReuniao: number): number {
  if (numeroVagasPatrocinador <= 0) return 0;
  return Math.round((custoBaseReuniao * numeroReunioes / numeroVagasPatrocinador) * 100) / 100;
}

export function gerarEventosDaOS(os: OrdemServico): Evento[] {
  if (os.recorrencia === 'unica') {
    return [{
      id: `ev-${os.id}-1`,
      titulo: `Reunião — ${os.tipoPapel}`,
      data: os.dataUnica ?? os.dataInicio,
      tipo: 'reuniao',
      equipeId: os.equipeId,
      ordemServicoId: os.id,
    }];
  }

  const dataBase = new Date(`${os.dataInicio}T00:00:00`);
  const eventos: Evento[] = [];
  for (let i = 0; i < os.numeroReunioes; i++) {
    const data = new Date(dataBase);
    data.setDate(data.getDate() + i * 7);
    eventos.push({
      id: `ev-${os.id}-${i + 1}`,
      titulo: `Reunião Semanal — ${os.tipoPapel}`,
      data: data.toISOString().slice(0, 10),
      tipo: 'reuniao',
      equipeId: os.equipeId,
      ordemServicoId: os.id,
    });
  }
  return eventos;
}
