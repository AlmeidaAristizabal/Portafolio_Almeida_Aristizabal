import { ETAPAS_PROCESO } from '../data/contenido';
import { CamionAJ } from './CamionAJ';

export function Proceso() {
  return (
    <section id="proceso" aria-labelledby="titulo-proceso">
      <div className="envoltura">
        <div className="border-t border-(--light-hair) py-[clamp(4rem,9vw,6.5rem)]">
          <div className="aparecer mb-[clamp(2rem,5vw,3.25rem)] max-w-[720px]">
            <p className="ceja">// proceso</p>
            <h2 id="titulo-proceso" className="titulo-seccion">De la idea a la <span className="text-verde">producción</span></h2>
            <p className="intro-seccion">Cuatro etapas, cada una con un entregable que puedes revisar antes de pasar a la siguiente.</p>
          </div>

          <div className="flex flex-wrap items-center gap-[clamp(2.5rem,5vw,5rem)]">
            {/* Cada etapa es un commit; el último es el que está en producción (HEAD → main) */}
            <ol className="m-0 min-w-0 flex-[1_1_440px] list-none p-0">
              {ETAPAS_PROCESO.map((etapa, i) => {
                const esUltima = i === ETAPAS_PROCESO.length - 1;
                return (
                  <li key={etapa.hash} className="commit aparecer">
                    <span className="commit-punto" aria-hidden />
                    <div className="min-w-0">
                      <div className={`flex flex-wrap gap-x-4 gap-y-1.5 ${esUltima ? 'items-center' : 'items-baseline'}`}>
                        <span className="font-mono text-[0.92rem] text-pu-500">{etapa.hash}</span>
                        <h3 className="m-0 font-titulo text-[clamp(1.9rem,2.8vw,2.5rem)] leading-[1.1] font-bold tracking-[0.01em] text-in-600 uppercase">
                          {etapa.titulo}
                        </h3>
                        {esUltima && <span className="referencia">HEAD → main</span>}
                      </div>
                      <p className="mt-2.5 mb-0 max-w-[34rem] text-[clamp(1rem,1.35vw,1.15rem)] leading-[1.65] text-gr-400">{etapa.descripcion}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <figure className="camion-fig m-0 min-w-0 flex-[1_1_460px]">
              <CamionAJ />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
