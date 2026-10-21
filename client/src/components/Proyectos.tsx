import { useState } from 'react';
import {
  CATEGORIAS_PROYECTO, NOMBRE_CATEGORIA, PROYECTOS, type CategoriaProyecto, type MaquetaProyecto, type Proyecto,
} from '../data/contenido';

type Modo = 'codigo' | 'negocio';

export function Proyectos() {
  const [filtro, setFiltro] = useState<CategoriaProyecto | 'todos'>('todos');
  const [modo, setModo] = useState<Modo>('codigo');

  const visibles = filtro === 'todos' ? PROYECTOS : PROYECTOS.filter((p) => p.categoria === filtro);

  return (
    <section id="proyectos" aria-labelledby="titulo-proyectos" className="py-[clamp(4rem,9vw,6.5rem)]">
      <div className="envoltura">
        <div className="aparecer mb-5 grid grid-cols-1 items-start gap-6 min-[960px]:grid-cols-[minmax(0,1fr)_minmax(0,300px)] min-[960px]:items-end min-[960px]:gap-x-[clamp(2rem,5vw,4rem)]">
          <div>
            <p className="ceja">// proyectos</p>
            <h2 id="titulo-proyectos" className="titulo-seccion">Algunos de nuestros proyectos</h2>
            <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Filtrar proyectos por tipo">
              {CATEGORIAS_PROYECTO.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={filtro === c.id}
                  onClick={() => setFiltro(c.id)}
                  className="pildora flex-[1_1_40%] cursor-pointer rounded-xl border-0 bg-pu-500 px-6 py-2.5 text-[0.98rem] font-semibold text-white hover:bg-pu-400 sm:min-w-30 sm:flex-none"
                >
                  {c.texto}
                </button>
              ))}
            </div>
          </div>
          <div className="grid min-w-0 gap-2.5">
            <p className="m-0 text-[0.95rem] text-gr-400">
              Filtra por tipo de proyecto.{' '}
              {modo === 'codigo' ? (
                <>En <strong className="font-semibold text-in-600">modo código</strong> ves el stack técnico de cada caso.</>
              ) : (
                <>En <strong className="font-semibold text-in-600">modo negocio</strong> ves para quién es cada caso y qué resultado entrega.</>
              )}
            </p>
            <button
              type="button"
              onClick={() => setModo((m) => (m === 'codigo' ? 'negocio' : 'codigo'))}
              className="cursor-pointer justify-self-start border-0 bg-transparent py-1 text-base font-bold text-pu-500 underline-offset-4 hover:text-pu-400 hover:underline"
            >
              {modo === 'codigo' ? 'Cambiar a modo negocio →' : 'Cambiar a modo código →'}
            </button>
          </div>
        </div>

        <p className="mb-7 font-mono text-[0.8rem] text-gr-400" aria-live="polite">
          Mostrando {visibles.length} de {PROYECTOS.length} proyectos
        </p>

        <div className="grid grid-cols-1 gap-[clamp(1.25rem,2.5vw,2rem)] sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((p) => (
            <TarjetaProyecto key={p.id} proyecto={p} modo={modo} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TarjetaProyecto({ proyecto, modo }: { proyecto: Proyecto; modo: Modo }) {
  return (
    <article className="proyecto oscuro aparecer flex min-w-0 flex-col rounded-[18px] p-2.5" data-cat={proyecto.categoria}>
      <div className="vidrio" aria-hidden>
        <MaquetaTarjeta tipo={proyecto.maqueta} />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-3.5 pt-5 pb-3.5">
        <div className="flex items-center justify-between gap-2.5 font-mono text-[0.74rem] text-pu-100">
          <span>{NOMBRE_CATEGORIA[proyecto.categoria]}</span>
          <span className="insignia">ejemplo</span>
        </div>
        <h3 className="m-0 font-titulo text-[1.9rem] leading-[1.05] font-bold tracking-[0.01em] text-white uppercase">{proyecto.titulo}</h3>
        <p className="m-0 text-[var(--fg-muted)]">{proyecto.descripcion}</p>
        {modo === 'codigo' ? (
          <ul className="etiquetas mt-auto pt-1.5">
            {proyecto.stack.map((t) => <li key={t} className="etiqueta">{t}</li>)}
          </ul>
        ) : (
          <dl className="mt-auto mb-0 grid gap-2 pt-1.5">
            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-2">
              <dt className="font-mono text-[0.72rem] text-pu-200">para</dt>
              <dd className="m-0 text-[0.95rem] text-white">{proyecto.para}</dd>
            </div>
            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-2">
              <dt className="font-mono text-[0.72rem] text-pu-200">resultado</dt>
              <dd className="m-0 text-[0.95rem] text-white">{proyecto.resultado}</dd>
            </div>
          </dl>
        )}
      </div>
    </article>
  );
}

function MaquetaTarjeta({ tipo }: { tipo: MaquetaProyecto }) {
  switch (tipo) {
    case 'tienda':
      return <div className="maqueta maqueta-tienda">{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</div>;
    case 'barras':
      return (
        <div className="maqueta maqueta-barras">
          {[38, 55, 46, 70, 92, 64].map((alto) => <span key={alto} style={{ height: `${alto}%` }} />)}
        </div>
      );
    case 'landing':
      return <div className="maqueta maqueta-landing"><span className="l1" /><span className="l2" /><span className="l3" /><span className="cta" /></div>;
    case 'dividida':
      return <div className="maqueta maqueta-dividida"><span className="img" /><span className="form"><span /><span /><span /></span></div>;
    case 'celular':
      return <div className="maqueta maqueta-celular"><span /><span /><span /><span /></div>;
    case 'escaner':
      return <div className="maqueta maqueta-celular"><span /><span className="escaner" /><span /></div>;
  }
}
