import { COP_POR_USD, HORAS_POR_SEMANA, TARIFA_USD_HORA, type TipoCotizador } from '../data/cotizador';
import { TEXTOS, type Idioma } from '../i18n/textos';
import { MAX_MOTIVO } from '../schemas/contacto';

export type Moneda = 'USD' | 'COP';

// En español los miles van con punto (2.500) y en inglés con coma (2,500)
export const LOCALE: Record<Idioma, string> = { es: 'es-CO', en: 'en-US' };

export function horasDe(tipo: TipoCotizador): number {
  return tipo.incluye.reduce((total, [, horas]) => total + horas, 0);
}

// Redondea pa' que no salgan precios tipo "US$ 2.537": los grandes a 50, los "desde" a 5
export function formatearDinero(usd: number, moneda: Moneda, pequeno = false, idioma: Idioma = 'es'): string {
  if (moneda === 'USD') {
    const paso = pequeno ? 5 : 50;
    return `US$ ${(Math.round(usd / paso) * paso).toLocaleString(LOCALE[idioma])}`;
  }
  const paso = pequeno ? 10_000 : 50_000;
  return `$ ${(Math.round((usd * COP_POR_USD) / paso) * paso).toLocaleString(LOCALE[idioma])}`;
}

export function calcularCotizacion(tipo: TipoCotizador, idioma: Idioma = 'es') {
  const horas = horasDe(tipo);
  const semanasMin = Math.max(1, Math.round(horas / HORAS_POR_SEMANA));
  const semanasMax = semanasMin + Math.max(1, Math.round(semanasMin * 0.3));
  return {
    horas,
    minimoUsd: horas * TARIFA_USD_HORA[0],
    maximoUsd: horas * TARIFA_USD_HORA[1],
    semanas: TEXTOS[idioma].cotizador.semanas(semanasMin, semanasMax),
  };
}

export function desdeUsd(tipo: TipoCotizador): number {
  return horasDe(tipo) * TARIFA_USD_HORA[0];
}

// Un motivo que arranca así lo escribió el cotizador (en cualquier idioma), no la persona
export function esMensajeDelCotizador(motivo: string): boolean {
  return Object.values(TEXTOS).some((t) => motivo.startsWith(t.cotizador.prefijo));
}

// El texto que se pega en "Motivo" cuando le dan "Enviar esta configuración"
export function mensajeCotizacion(tipo: TipoCotizador, moneda: Moneda, idioma: Idioma = 'es'): string {
  const { prefijo, estimado } = TEXTOS[idioma].cotizador;
  const { minimoUsd, maximoUsd, semanas } = calcularCotizacion(tipo, idioma);
  const dinero = (usd: number) => formatearDinero(usd, moneda, false, idioma);
  return (
    `${prefijo} ${tipo.nombre[idioma]}. ${estimado} ` +
    `${dinero(minimoUsd)} – ${dinero(maximoUsd)}${moneda === 'COP' ? ' COP' : ''}, ${semanas}.`
  ).slice(0, MAX_MOTIVO);
}
