import { COP_POR_USD, HORAS_POR_SEMANA, TARIFA_USD_HORA, type TipoCotizador } from '../data/cotizador';
import { MAX_MOTIVO } from '../schemas/contacto';

export type Moneda = 'USD' | 'COP';

export function horasDe(tipo: TipoCotizador): number {
  return tipo.incluye.reduce((total, [, horas]) => total + horas, 0);
}

// Redondea pa' que no salgan precios tipo "US$ 2.537": los grandes a 50, los "desde" a 5
export function formatearDinero(usd: number, moneda: Moneda, pequeno = false): string {
  if (moneda === 'USD') {
    const paso = pequeno ? 5 : 50;
    return `US$ ${(Math.round(usd / paso) * paso).toLocaleString('es-CO')}`;
  }
  const paso = pequeno ? 10_000 : 50_000;
  return `$ ${(Math.round((usd * COP_POR_USD) / paso) * paso).toLocaleString('es-CO')}`;
}

export function calcularCotizacion(tipo: TipoCotizador) {
  const horas = horasDe(tipo);
  const semanasMin = Math.max(1, Math.round(horas / HORAS_POR_SEMANA));
  const semanasMax = semanasMin + Math.max(1, Math.round(semanasMin * 0.3));
  return {
    horas,
    minimoUsd: horas * TARIFA_USD_HORA[0],
    maximoUsd: horas * TARIFA_USD_HORA[1],
    semanas: `${semanasMin}–${semanasMax} semanas`,
  };
}

export function desdeUsd(tipo: TipoCotizador): number {
  return horasDe(tipo) * TARIFA_USD_HORA[0];
}

// Con este arranque reconocemos un motivo escrito por el cotizador (y no por la persona)
export const PREFIJO_COTIZACION = 'Hola, quiero cotizar:';

// El texto que se pega en "Motivo" cuando le dan "Enviar esta configuración"
export function mensajeCotizacion(tipo: TipoCotizador, moneda: Moneda): string {
  const { minimoUsd, maximoUsd, semanas } = calcularCotizacion(tipo);
  return (
    `${PREFIJO_COTIZACION} ${tipo.nombre}. Estimado del cotizador: ` +
    `${formatearDinero(minimoUsd, moneda)} – ${formatearDinero(maximoUsd, moneda)}${moneda === 'COP' ? ' COP' : ''}, ${semanas}.`
  ).slice(0, MAX_MOTIVO);
}
