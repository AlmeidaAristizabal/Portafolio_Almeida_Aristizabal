import { useEffect, useRef, useState } from 'react';
import { COP_POR_USD, FECHA_TASA, TIPO_POR_DEFECTO, TIPOS_COTIZADOR, type TipoContacto } from '../data/cotizador';
import { useAvisoTemporal } from '../hooks/useAvisoTemporal';
import { useIdioma } from '../hooks/useIdioma';
import { useMovimientoReducido } from '../hooks/useMovimientoReducido';
import { calcularCotizacion, desdeUsd, formatearDinero, LOCALE, mensajeCotizacion, type Moneda } from '../utils/cotizador';

export interface CotizacionElegida {
  tipoContacto: TipoContacto;
  mensaje: string;
}

const buscarTipo = (id: string) => TIPOS_COTIZADOR.find((t) => t.id === id) ?? TIPOS_COTIZADOR[0];

export function Cotizador({ onEnviar }: { onEnviar: (cotizacion: CotizacionElegida) => void }) {
  const movimientoReducido = useMovimientoReducido();
  const { idioma, t } = useIdioma();
  const [tipoId, setTipoId] = useState(TIPO_POR_DEFECTO);
  const [moneda, setMoneda] = useState<Moneda>('USD');
  const [enviado, avisarEnviado] = useAvisoTemporal(false, 3000);

  const tipo = buscarTipo(tipoId);
  const { minimoUsd, maximoUsd, semanas } = calcularCotizacion(tipo, idioma);
  const dinero = (usd: number, pequeno = false) => formatearDinero(usd, moneda, pequeno, idioma);
  const precio = useConteo(minimoUsd, maximoUsd, !movimientoReducido);

  const enviar = () => {
    onEnviar({ tipoContacto: tipo.tipoContacto, mensaje: mensajeCotizacion(tipo, moneda, idioma) });
    avisarEnviado(true);
  };

  return (
    <section id="cotizador" aria-labelledby="titulo-cotizador">
      <div className="envoltura">
        <div className="border-t border-(--hair) py-[clamp(4rem,9vw,6.5rem)]">
          <div className="aparecer mb-[clamp(2rem,5vw,3rem)] grid grid-cols-1 items-end gap-x-[clamp(2rem,5vw,4rem)] gap-y-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div>
              <p className="ceja">{t.cotizador.ceja}</p>
              <h2 id="titulo-cotizador" className="titulo-seccion">{t.cotizador.titulo.antes}<span className="text-verde">{t.cotizador.titulo.verde}</span></h2>
            </div>
            <p className="intro-seccion m-0">
              {t.cotizador.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-[clamp(1.25rem,3vw,2.25rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
            <div className="grid min-w-0 gap-5 rounded-[18px] border border-(--line) bg-(--superficie) p-[clamp(1.15rem,2.5vw,1.6rem)] shadow-[0_14px_30px_-24px_var(--card-shadow)]">
              <div className="flex items-center gap-3.5">
                <span className="grid size-7.5 flex-none place-items-center rounded-full border border-(--line) font-mono text-[0.76rem] text-(--eyebrow)" aria-hidden>1</span>
                <h3 id="titulo-paso-1" className="m-0 font-titulo text-[1.7rem] leading-tight font-semibold tracking-[0.02em] text-(--heading) uppercase">
                  {t.cotizador.paso1}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 min-[521px]:grid-cols-2 min-[761px]:grid-cols-3" role="radiogroup" aria-labelledby="titulo-paso-1">
                {TIPOS_COTIZADOR.map((opcion) => {
                  const marcada = opcion.id === tipoId;
                  return (
                    <label
                      key={opcion.id}
                      className={`opcion-cotizador relative grid min-w-0 cursor-pointer content-start gap-1 rounded-[14px] border-[1.5px] border-(--line) bg-(--superficie) py-4 pr-11 pl-4 ${marcada ? 'marcada' : ''}`}
                    >
                      <input
                        type="radio"
                        name="tipo-cotizador"
                        value={opcion.id}
                        checked={marcada}
                        onChange={() => setTipoId(opcion.id)}
                        className="absolute inset-0 m-0 size-full cursor-pointer opacity-0"
                      />
                      <b className="text-base leading-snug font-bold text-(--heading)">{opcion.nombre[idioma]}</b>
                      <small className="text-[0.88rem] leading-snug text-(--fg-muted)">{opcion.descripcion[idioma]}</small>
                      <em className="mt-1 font-mono text-[0.72rem] text-(--eyebrow) not-italic">{t.cotizador.desde(dinero(desdeUsd(opcion), true))}</em>
                    </label>
                  );
                })}
              </div>
            </div>

            <aside
              className="resumen-cotizador oscuro grid gap-4 rounded-[20px] p-[clamp(1.35rem,3vw,1.75rem)] lg:sticky lg:top-24"
              aria-labelledby="etiqueta-resumen"
            >
              <div className="flex items-center justify-between gap-4">
                <p id="etiqueta-resumen" className="m-0 font-mono text-[0.74rem] tracking-[0.06em] text-pu-100 uppercase">
                  {t.cotizador.inversion} · {moneda}
                </p>
                <div className="selector-moneda inline-flex rounded-full border border-(--dark-line) bg-(--dark-surface-2) p-0.75" role="group" aria-label={t.cotizador.moneda}>
                  {(['USD', 'COP'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={moneda === m}
                      onClick={() => setMoneda(m)}
                      className="cursor-pointer rounded-full border-0 bg-transparent px-3.5 py-1.5 font-mono text-[0.78rem] font-semibold text-in-100 hover:text-white"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <p className="m-0 font-titulo text-[clamp(2.4rem,3.8vw,3.1rem)] leading-[1.05] font-bold tracking-[0.01em] text-white tabular-nums" aria-hidden>
                <span className="block">{dinero(precio.minimo)} –</span>
                <span className="block">{dinero(precio.maximo)}</span>
              </p>
              <p className="m-0 text-pu-100">
                {t.cotizador.entrega} <strong className="text-white">{semanas}</strong>
              </p>
              <ul className="m-0 grid list-none p-0">
                <li className="flex items-baseline justify-between gap-4 border-t border-(--dark-hair) py-2 text-[0.92rem] text-in-100">
                  <span>{t.cotizador.proyecto}</span>
                  <span className="font-mono text-[0.8rem] whitespace-nowrap text-white">{tipo.nombre[idioma]}</span>
                </li>
              </ul>
              <div className="grid gap-2.5">
                <button type="button" className="boton boton-verde w-full" onClick={enviar}>
                  {enviado ? t.cotizador.enviado : t.cotizador.enviar}
                </button>
                <button type="button" className="boton boton-fantasma w-full" onClick={() => { setTipoId(TIPO_POR_DEFECTO); setMoneda('USD'); }}>
                  {t.cotizador.reiniciar}
                </button>
              </div>
              <p className="m-0 text-[0.82rem] leading-normal text-in-100">
                {t.cotizador.aviso}
              </p>
              {moneda === 'COP' && (
                <p className="m-0 font-mono text-[0.72rem] text-in-200">
                  {t.cotizador.trm(COP_POR_USD.toLocaleString(LOCALE[idioma]), FECHA_TASA[idioma])}
                </p>
              )}
              {/* Pa' lectores de pantalla: el precio que cuenta animado no se lee bien, este sí */}
              <p className="sr-only" aria-live="polite">
                {t.cotizador.lector(dinero(minimoUsd), dinero(maximoUsd), moneda === 'COP', semanas)}
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

// Anima los números del precio desde el valor anterior hasta el nuevo (420 ms, frenando al final)
function useConteo(minimo: number, maximo: number, animar: boolean) {
  const [mostrado, setMostrado] = useState({ minimo, maximo });
  const actual = useRef(mostrado);

  useEffect(() => {
    if (!animar) {
      actual.current = { minimo, maximo };
      setMostrado(actual.current);
      return;
    }
    const desde = actual.current, t0 = performance.now(), DURACION = 420;
    let raf = 0;
    const paso = (ahora: number) => {
      const k = Math.min(1, (ahora - t0) / DURACION), e = 1 - Math.pow(1 - k, 3);
      actual.current = { minimo: desde.minimo + (minimo - desde.minimo) * e, maximo: desde.maximo + (maximo - desde.maximo) * e };
      setMostrado(actual.current);
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [minimo, maximo, animar]);

  return mostrado;
}
