import { useEffect, useRef, useState } from 'react';
import { SERVICIOS, type Servicio } from '../data/contenido';
import { useIdioma } from '../hooks/useIdioma';
import { useMovimientoReducido } from '../hooks/useMovimientoReducido';

const ICONOS: Record<Servicio['id'], React.ReactNode> = {
  web: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="m10 12.5-2 2 2 2" /><path d="m14 12.5 2 2-2 2" /></>,
  app: <><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></>,
  api: <><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" /></>,
  db: <><ellipse cx="12" cy="5.5" rx="8" ry="3" /><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
};

// Atajo pa' escribir style={{'--i': n}} sin pelear con TypeScript
const paso = (i: number, extra?: Record<string, string | number>) => ({ '--i': i, ...extra }) as React.CSSProperties;

export function Servicios() {
  const movimientoReducido = useMovimientoReducido();
  const { idioma, t } = useIdioma();
  const [activo, setActivo] = useState<Servicio['id']>('web');
  const [automatico, setAutomatico] = useState(true);
  const [encima, setEncima] = useState(false);
  const [conFoco, setConFoco] = useState(false);
  const [visible, setVisible] = useState(true);
  const contenedor = useRef<HTMLDivElement>(null);

  // Si la sección no se ve, el autoplay espera: nadie quiere perderse el show
  useEffect(() => {
    if (!contenedor.current || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((en) => setVisible(en[0].isIntersecting), { threshold: 0.25 });
    obs.observe(contenedor.current);
    return () => obs.disconnect();
  }, []);

  const corriendo = automatico && !movimientoReducido;
  const pausado = encima || conFoco || !visible;
  const servicio = SERVICIOS.find((s) => s.id === activo) ?? SERVICIOS[0];

  const siguiente = (e: React.AnimationEvent) => {
    if (e.animationName !== 'llenar' || !corriendo) return;
    const i = SERVICIOS.findIndex((s) => s.id === activo);
    setActivo(SERVICIOS[(i + 1) % SERVICIOS.length].id);
  };

  return (
    <section id="servicios" aria-labelledby="titulo-servicios" className="seccion-servicios oscuro py-[clamp(4rem,9vw,6.5rem)]">
      <div className="envoltura relative">
        <div
          ref={contenedor}
          className={`servicios aparecer grid grid-cols-1 gap-8 [grid-template-areas:'cabeza'_'escena'_'lista'] min-[960px]:grid-cols-[minmax(0,400px)_minmax(0,1fr)] min-[960px]:grid-rows-[auto_1fr] min-[960px]:items-start min-[960px]:gap-x-[clamp(2rem,5vw,4rem)] min-[960px]:[grid-template-areas:'cabeza_escena'_'lista_escena'] ${corriendo ? 'automatico' : ''} ${corriendo && pausado ? 'pausado' : ''}`}
          onMouseEnter={() => setEncima(true)}
          onMouseLeave={() => setEncima(false)}
          onFocus={() => setConFoco(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setConFoco(false); }}
          onAnimationEnd={siguiente}
        >
          <div className="[grid-area:cabeza]">
            <p className="ceja">{t.servicios.ceja}</p>
            <h2 id="titulo-servicios" className="titulo-seccion">
              {t.servicios.titulo.antes}<span className="text-verde">{t.servicios.titulo.verde}</span>
            </h2>
            <p className="intro-seccion mt-3">{t.servicios.intro}</p>
          </div>

          <div className="flex flex-col gap-2 [grid-area:lista]">
            {SERVICIOS.map((s) => {
              const esActivo = s.id === activo;
              return (
                <div key={s.id} className={`servicio ${esActivo ? 'activo' : ''}`}>
                  <button
                    type="button"
                    aria-expanded={esActivo}
                    aria-controls={`mas-${s.id}`}
                    onClick={() => { setAutomatico(false); setActivo(s.id); }}
                    className="servicio-tab grid w-full cursor-pointer grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-[14px] border-0 bg-transparent p-3 text-left sm:grid-cols-[46px_minmax(0,1fr)] sm:gap-4 sm:px-4 sm:py-4"
                  >
                    <span className="servicio-icono grid size-10 place-items-center rounded-[10px] sm:size-[46px] sm:rounded-xl" aria-hidden>
                      <svg className="size-[21px] sm:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        {ICONOS[s.id]}
                      </svg>
                    </span>
                    <span>
                      <span className="block font-titulo text-[1.55rem] leading-tight tracking-[0.02em] uppercase">{s.titulo[idioma]}</span>
                      <span className="block text-[0.92rem] text-(--fg-muted)">{s.subtitulo[idioma]}</span>
                    </span>
                  </button>
                  <div className="servicio-mas" id={`mas-${s.id}`}>
                    <div className="min-h-0 overflow-hidden">
                      <div className="grid gap-3 pr-4 pb-5 pl-[calc(1.6rem+40px)] sm:pl-[calc(2rem+46px)]">
                        <p className="m-0 text-[0.98rem] text-(--fg-muted)">{s.descripcion[idioma]}</p>
                        <ul className="chequeos">
                          {s.incluye[idioma].map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <span className="servicio-progreso" aria-hidden />
                </div>
              );
            })}
          </div>

          <div className="min-w-0 [grid-area:escena] min-[960px]:sticky min-[960px]:top-24">
            {/* key = servicio: al cambiar se vuelve a montar y las animaciones de entrada arrancan de cero */}
            <div key={servicio.id} className="grid gap-4">
              <div className="ventana" aria-hidden>
                <div className="ventana-barra">
                  <i /><i /><i />
                  <BarraVentana id={servicio.id} />
                </div>
                <div className="ventana-cuerpo">
                  <Maqueta id={servicio.id} />
                </div>
              </div>
              <div className="entra flex flex-wrap items-center justify-between gap-x-5 gap-y-3.5" style={paso(6)}>
                <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                  <span className="font-mono text-[0.76rem] text-in-200">stack</span>
                  <ul className="etiquetas">
                    {servicio.stack.map((t) => <li key={t} className="etiqueta">{t}</li>)}
                  </ul>
                </div>
                <a
                  className="boton boton-primario boton-repo w-full sm:w-auto"
                  href={servicio.repositorio}
                  target="_blank"
                  rel="noopener"
                  aria-label={t.servicios.verRepositorioDe(servicio.titulo[idioma])}
                >
                  <svg className="size-[18px] flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="6" cy="5" r="2.2" /><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="8" r="2.2" />
                    <path d="M6 7.2v9.6" /><path d="M18 10.2c0 4.2-6 3.6-11 6.8" />
                  </svg>
                  {t.servicios.verRepositorio} <span className="ext" aria-hidden>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BarraVentana({ id }: { id: Servicio['id'] }) {
  const m = useIdioma().t.servicios.maqueta;
  if (id === 'web') return <span className="ventana-url">{m.url}</span>;
  const titulos = { app: m.tituloApp, api: 'terminal · api', db: m.tituloDb };
  return <span className="ventana-titulo">{titulos[id]}</span>;
}

function Maqueta({ id }: { id: Servicio['id'] }) {
  const m = useIdioma().t.servicios.maqueta;
  if (id === 'app') {
    return (
      <div className="pa">
        <ul className="so-chips hidden sm:grid">
          <li className="entra" style={paso(5)}>Android</li>
          <li className="entra" style={paso(6)}>iOS</li>
        </ul>
        <div className="cel">
          <span className="cel-titulo entra" style={paso(0)} />
          {['9:00', '10:30', '15:00'].map((hora, i) => (
            <div key={hora} className="cel-tarjeta entra" style={paso(i + 1)}><i /><b /><em>{hora}</em></div>
          ))}
          <div className="cel-nav"><span /><span /><span /></div>
        </div>
        <div className="aviso entra max-sm:top-[4%] max-sm:left-1/2 max-sm:w-[min(230px,80%)] max-sm:-translate-x-1/2" style={paso(10)}>
          <strong>{m.recordatorio}</strong>{m.cita}
        </div>
      </div>
    );
  }

  if (id === 'api') {
    return (
      <div className="terminal">
        <p><span className="t-prompt">$ </span><span className="tecleado" style={{ '--n': m.curl.length } as React.CSSProperties}>{m.curl}</span></p>
        <p className="entra" style={paso(0)}><span className="t-ok">HTTP/1.1 201 Created</span><span className="t-dim">  · 84 ms</span></p>
        <p className="entra" style={paso(1)}>{'{'}</p>
        <p className="entra" style={paso(2)}>  <span className="t-k">"id"</span>: <span className="t-n">1284</span>,</p>
        <p className="entra" style={paso(3)}>  <span className="t-k">"{m.cliente}"</span>: <span className="t-s">"{m.nombreCliente}"</span>,</p>
        <p className="entra" style={paso(4)}>  <span className="t-k">"{m.estado}"</span>: <span className="t-s">"{m.pagado}"</span>,</p>
        <p className="entra" style={paso(5)}>  <span className="t-k">"total"</span>: <span className="t-n">189900</span>,</p>
        <p className="entra" style={paso(6)}>  <span className="t-k">"{m.moneda}"</span>: <span className="t-s">"COP"</span></p>
        <p className="entra" style={paso(7)}>{'}'}<span className="cursor" /></p>
      </div>
    );
  }

  if (id === 'db') {
    return (
      <div className="terminal" style={{ '--base': '2.15s' } as React.CSSProperties}>
        <p><span className="t-prompt">mysql&gt; </span><span className="tecleado" style={{ '--n': m.select.length, '--dur': '.8s' } as React.CSSProperties}>{m.select}</span></p>
        <p><span className="t-prompt">    -&gt; </span><span className="tecleado" style={{ '--n': m.from.length, '--dur': '1s', '--d': '1.1s' } as React.CSSProperties}>{m.from}</span></p>
        <div className="t-tabla">
          <div className="t-fila t-cabecera entra" style={paso(0)}><span>{m.producto}</span><span>stock</span></div>
          {/* El stock es el mismo en los dos idiomas; solo cambia el nombre del postre */}
          {m.productos.map((producto, i) => (
            <div key={producto} className="t-fila entra" style={paso(i + 1)}><span>{producto}</span><span className="bajo">{[4, 2, 3][i]}</span></div>
          ))}
        </div>
        <p className="t-dim entra" style={paso(4)}>{m.filas}<span className="cursor" /></p>
      </div>
    );
  }

  return (
    <div className="pw">
      <div className="pw-nav entra" style={paso(0)}><span className="pw-logo" /><span className="pw-enlaces max-sm:[&>span]:w-[22px]"><span /><span /><span /></span></div>
      <div className="pw-hero">
        <div className="pw-texto">
          <span className="t1 entra" style={paso(1)} />
          <span className="t2 entra" style={paso(2)} />
          <span className="t3 entra" style={paso(3)} />
          <span className="boton-m entra" style={paso(4)} />
        </div>
        <span className="pw-img entra" style={paso(2)} />
      </div>
      <div className="pw-grilla">
        {[5, 6, 7, 8].map((i) => <span key={i} className="entra" style={paso(i)} />)}
      </div>
    </div>
  );
}
