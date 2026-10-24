import { describe, expect, it } from 'vitest';
import { TIPOS_COTIZADOR } from '../data/cotizador';
import { calcularCotizacion, desdeUsd, esMensajeDelCotizador, formatearDinero, horasDe, mensajeCotizacion } from '../utils/cotizador';

const tipo = (id: string) => TIPOS_COTIZADOR.find((t) => t.id === id)!;

describe('cotizador', () => {
  it('suma las horas de todo lo que incluye el proyecto', () => {
    // Sitio corporativo: 42 + 20 + 10
    expect(horasDe(tipo('corporativo'))).toBe(72);
  });

  it('calcula el rango y las semanas igual que el v9', () => {
    const { minimoUsd, maximoUsd, semanas } = calcularCotizacion(tipo('corporativo'));
    expect(formatearDinero(minimoUsd, 'USD')).toBe('US$ 2.500');
    expect(formatearDinero(maximoUsd, 'USD')).toBe('US$ 3.250');
    expect(semanas).toBe('2–3 semanas');
  });

  it('convierte a pesos con la TRM y redondea a 50.000', () => {
    // 2.520 USD × 3.210 = 8.089.200 → 8.100.000
    expect(formatearDinero(2520, 'COP')).toBe('$ 8.100.000');
  });

  it('los precios "desde" redondean más fino', () => {
    // Landing: 30 h × 35 = 1.050
    expect(formatearDinero(desdeUsd(tipo('landing')), 'USD', true)).toBe('US$ 1.050');
  });

  it('arma el mensaje pa’l formulario sin pasarse de 600 letras', () => {
    const mensaje = mensajeCotizacion(tipo('movil'), 'USD');
    expect(mensaje).toMatch(/^Hola, quiero cotizar: App móvil\. Estimado del cotizador: US\$ [\d.]+ – US\$ [\d.]+, \d+–\d+ semanas\.$/);
    expect(mensaje.length).toBeLessThanOrEqual(600);
  });

  it('en inglés los miles van con coma y las semanas son weeks', () => {
    expect(formatearDinero(2520, 'COP', false, 'en')).toBe('$ 8,100,000');
    expect(calcularCotizacion(tipo('corporativo'), 'en').semanas).toBe('2–3 weeks');
  });

  it('arma el mensaje en inglés y lo reconoce como suyo, igual que el de español', () => {
    const mensaje = mensajeCotizacion(tipo('movil'), 'USD', 'en');
    expect(mensaje).toMatch(/^Hi, I'd like a quote for: Mobile app\. Estimator range: US\$ [\d,]+ – US\$ [\d,]+, \d+–\d+ weeks\.$/);
    expect(esMensajeDelCotizador(mensaje)).toBe(true);
    expect(esMensajeDelCotizador(mensajeCotizacion(tipo('movil'), 'USD'))).toBe(true);
    expect(esMensajeDelCotizador('Hola, necesito una app')).toBe(false);
  });
});
