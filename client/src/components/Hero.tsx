import { useEffect, useRef, useState } from 'react';
import { ORBITA_EXTERNA, ORBITA_INTERNA, TECNOLOGIAS_CINTA } from '../data/contenido';
import { iniciarExplosionHero } from '../efectos/explosionHero';
import { useMovimientoReducido } from '../hooks/useMovimientoReducido';

const ROLES = ['Full Stack Developers', 'Web · Móvil · APIs'];

interface Props {
  temaAzul: boolean;
  onCambiarTema: () => void;
}

export function Hero({ temaAzul, onCambiarTema }: Props) {
  const movimientoReducido = useMovimientoReducido();
  const [rol, setRol] = useState(ROLES[0]);

  const refs = {
    hero: useRef<HTMLElement>(null),
    orbita: useRef<HTMLElement>(null),
    nucleo: useRef<HTMLElement>(null),
    capa: useRef<HTMLDivElement>(null),
    lienzo: useRef<HTMLCanvasElement>(null),
    destello: useRef<HTMLDivElement>(null),
    estado: useRef<HTMLParagraphElement>(null),
    estadoTxt: useRef<HTMLSpanElement>(null),
    rol: useRef<HTMLParagraphElement>(null),
    texto: useRef<HTMLDivElement>(null),
    cinta: useRef<HTMLDivElement>(null),
  };

  // El callback cambia en cada render del papá; lo guardamos en un ref pa' no reiniciar la explosión
  const cambiarTemaRef = useRef(onCambiarTema);
  useEffect(() => {
    cambiarTemaRef.current = onCambiarTema;
  }, [onCambiarTema]);

  useEffect(() => {
    if (movimientoReducido) return;
    const { hero, orbita, nucleo, capa, lienzo, destello, estado, estadoTxt, rol, texto, cinta } = refs;
    if (!hero.current || !orbita.current || !nucleo.current || !capa.current || !lienzo.current || !destello.current ||
      !estado.current || !estadoTxt.current || !rol.current || !texto.current) return;
    return iniciarExplosionHero(
      {
        hero: hero.current, orbita: orbita.current, nucleo: nucleo.current, capa: capa.current, lienzo: lienzo.current,
        destello: destello.current, estado: estado.current, estadoTxt: estadoTxt.current, rol: rol.current,
        texto: texto.current, cinta: cinta.current,
      },
      () => cambiarTemaRef.current(),
    );
    // Los refs son estables: solo nos importa si cambia la preferencia de movimiento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movimientoReducido]);

  // El texto del rol cambia a mitad del glitch, no antes
  useEffect(() => {
    const reloj = setTimeout(() => setRol(ROLES[temaAzul ? 1 : 0]), 200);
    return () => clearTimeout(reloj);
  }, [temaAzul]);

  return (
    <section ref={refs.hero} className={`hero oscuro ${temaAzul ? 'tema-azul' : ''}`} aria-labelledby="titulo-hero">
      <div className="envoltura grid grid-cols-1 items-center gap-[clamp(2rem,5vw,4rem)] py-[clamp(2.75rem,6vw,4.5rem)] min-[960px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div ref={refs.texto} className="min-w-0">
          <h1 id="titulo-hero" className="m-0 font-normal">
            <span className="block font-titulo text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.1] tracking-[0.07em] text-white uppercase">
              Hola, somos
            </span>
            <span className="nombres mt-2 block font-titulo text-[clamp(2.9rem,5.6vw,4.6rem)] leading-[1] tracking-[0.01em] uppercase">
              <span className="block">Juan Pablo Almeida</span>
              <span className="block">Eleira Aristizabal</span>
            </span>
          </h1>
          <p ref={refs.rol} className="rol mt-6 text-[clamp(.9rem,1.5vw,1.1rem)] font-semibold tracking-[0.28em] text-white uppercase sm:tracking-[0.42em]">
            {rol}
          </p>
          <p className="mt-4 max-w-[46ch] text-[1.1rem] text-pu-100">
            Construimos aplicaciones web y móviles de punta a punta: base de datos, API e interfaz, con código claro y
            entregas por etapas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="boton boton-verde flex-auto border-white sm:flex-none" href="#contacto">Contáctanos</a>
            <a className="boton boton-fantasma flex-auto sm:flex-none" href="#proyectos">Ver proyectos</a>
          </div>
        </div>

        <div className="grid min-w-0 justify-items-center gap-3.5">
          <figure ref={refs.orbita} className="orbita m-0 min-[960px]:w-[min(100%,470px)]" aria-label="Tecnologías con las que trabajamos">
            <div className="anillo anillo-externo" aria-hidden />
            <div className="anillo anillo-interno" aria-hidden />
            {movimientoReducido ? (
              <div ref={refs.nucleo as React.Ref<HTMLDivElement>} className="nucleo" aria-hidden>
                <span className="logo-aj" aria-hidden />
              </div>
            ) : (
              // Un <button> de verdad: Enter, Espacio y el foco vienen de fábrica
              <button
                ref={refs.nucleo as React.Ref<HTMLButtonElement>}
                type="button"
                className="nucleo"
                aria-label="Ejecutar la animación del banner"
                title="Haz clic para compilar"
              >
                <span className="logo-aj" aria-hidden />
              </button>
            )}
            <ul className="pista pista-externa">
              {ORBITA_EXTERNA.map((b) => (
                <li key={b.nombre} className="nodo" style={{ '--a': `${b.angulo}deg`, '--k': b.k } as React.CSSProperties}>
                  <span className="burbuja" title={b.nombre}>{b.nombre}</span>
                </li>
              ))}
            </ul>
            <ul className="pista pista-interna">
              {ORBITA_INTERNA.map((b) => (
                <li key={b.nombre} className="nodo" style={{ '--a': `${b.angulo}deg`, '--k': b.k } as React.CSSProperties}>
                  <span className="burbuja" title={b.nombre === 'JS' ? 'JavaScript' : b.nombre}>{b.nombre}</span>
                </li>
              ))}
            </ul>
          </figure>
          <p ref={refs.estado} className="estado-orbita" aria-hidden>
            <span className="punto" />
            <span ref={refs.estadoTxt} className="txt">En línea</span>
          </p>
        </div>
      </div>

      <div ref={refs.capa} className="capa-fx" aria-hidden>
        <canvas ref={refs.lienzo} className="lienzo-fx" />
        <div ref={refs.destello} className="destello-fx" />
      </div>

      <div ref={refs.cinta} className="cinta" aria-label="Stack tecnológico">
        <div className="cinta-pista">
          {/* Dos copias seguidas: cuando la primera se acaba, la segunda ya está en su puesto */}
          {[false, true].map((copia) => (
            <ul key={String(copia)} className="cinta-lista" aria-hidden={copia || undefined}>
              {TECNOLOGIAS_CINTA.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
