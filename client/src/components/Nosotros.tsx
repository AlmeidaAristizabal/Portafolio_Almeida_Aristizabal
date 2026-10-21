import { CV_ELEIRA, CV_JUAN, PERSONAS } from '../data/contenido';
import { FOTO_ELEIRA, FOTO_JUAN } from '../data/fotos';
import { useAvisoTemporal } from '../hooks/useAvisoTemporal';

const FOTOS = [FOTO_JUAN, FOTO_ELEIRA];
const FORMA_BLOB = 'M232 18C304 8 382 118 393 218c9 82-62 94-142 90-80-4-190 6-222-34C-6 230 40 162 110 102 160 58 190 24 232 18Z';

export function Nosotros() {
  return (
    <section id="nosotros" aria-labelledby="titulo-nosotros" className="pt-[clamp(4rem,9vw,6.5rem)]">
      <div className="envoltura">
        <div className="aparecer mx-auto mb-[clamp(3.5rem,7vw,5rem)] max-w-[760px] text-center">
          <p className="ceja">// nosotros</p>
          <h2 id="titulo-nosotros" className="titulo-seccion">¿Quiénes somos?</h2>
          <p className="mx-auto mt-5 max-w-[64ch] text-[1.08rem]">
            Somos un equipo de desarrolladores full stack apasionados por transformar ideas complejas en productos
            digitales eficientes, escalables y atractivos. Combinamos la solidez del desarrollo backend con la
            interactividad y el diseño del frontend para ofrecer soluciones tecnológicas de extremo a extremo.
          </p>
        </div>

        {/* El degradado del blob se define una vez y lo usan las dos manchas */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <radialGradient id="relleno-blob" cx="52%" cy="58%" r="62%">
              {/* var() solo funciona dentro de style, no como atributo del SVG */}
              <stop offset="0" style={{ stopColor: 'var(--color-pu-50)' }} />
              <stop offset=".22" style={{ stopColor: 'var(--color-pu-200)' }} />
              <stop offset=".58" style={{ stopColor: 'var(--color-pu-500)' }} />
              <stop offset="1" style={{ stopColor: 'var(--color-pu-500)' }} />
            </radialGradient>
            {/* La de Juan Pablo es verde, como en el Figma */}
            <radialGradient id="relleno-blob-verde" cx="52%" cy="58%" r="62%">
              <stop offset="0" style={{ stopColor: '#d5d3ff' }} />
              <stop offset=".22" style={{ stopColor: '#a4dcab' }} />
              <stop offset=".58" style={{ stopColor: 'var(--color-verde)' }} />
              <stop offset="1" style={{ stopColor: 'var(--color-verde)' }} />
            </radialGradient>
          </defs>
        </svg>

        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-x-0">
          {PERSONAS.map((persona, i) => (
            <article key={persona.nombre} className="persona aparecer flex min-w-0 flex-col items-center gap-3.5 px-4 text-center">
              <div className="relative aspect-[400/320] w-[min(100%,390px)]">
                <svg className="blob" viewBox="0 0 400 320" preserveAspectRatio="none" aria-hidden>
                  <path fill={i === 0 ? 'url(#relleno-blob-verde)' : 'url(#relleno-blob)'} d={FORMA_BLOB} />
                </svg>
                <FotoRecortada indice={i} nombre={persona.nombre} src={FOTOS[i].src} />
              </div>
              <h3 className="mt-2 font-titulo text-[clamp(1.6rem,2.8vw,2rem)] leading-tight tracking-[0.03em] text-in-600 uppercase">
                {persona.nombre}
              </h3>
              <p className="m-0 font-mono text-[0.78rem] text-pu-500">{persona.rol}</p>
              <ul className="etiquetas justify-center" aria-label={`Tecnologías de ${persona.nombre.split(' ')[0]}`}>
                {persona.tecnologias.map((t) => (
                  <li key={t} className="etiqueta">{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-[clamp(2.5rem,5vw,3.5rem)] bg-pu-500">
        {/* Sin envoltura: cada botón ocupa su mitad completa, de borde a borde, y el hover la pinta toda */}
        <div className="grid grid-cols-2">
          <BotonCv nombre="Juan Pablo" enlace={CV_JUAN} />
          <BotonCv nombre="Eleira" enlace={CV_ELEIRA} verde />
        </div>
      </div>
    </section>
  );
}

// Las fotos son recortes que terminan en línea recta (cintura y codos). Pa' que no se note la tijera,
// la foto se recorta con la misma forma de la mancha; arriba dejamos un rectángulo libre pa' que la
// cabeza siga saliéndose del blob. La segunda mancha va en espejo, así que su recorte también.
const ALTO_RECTANGULO_LIBRE = 150;

function FotoRecortada({ indice, nombre, src }: { indice: number; nombre: string; src: string }) {
  const idRecorte = `recorte-persona-${indice}`;
  const espejo = indice % 2 === 1 ? 'translate(400 0) scale(-1 1)' : undefined;
  return (
    <svg className="foto-persona" viewBox="0 0 400 320" role="img" aria-label={nombre}>
      <defs>
        <clipPath id={idRecorte}>
          <path d={FORMA_BLOB} transform={espejo} />
          <rect x="-60" y="-220" width="520" height={220 + ALTO_RECTANGULO_LIBRE} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${idRecorte})`}>
        {/* 114% del alto de la mancha, pegada abajo y centrada, como estaba antes */}
        <image className="foto-persona-img" href={src} x="16" y="-45" width="368" height="365" preserveAspectRatio="xMidYMax meet" />
      </g>
    </svg>
  );
}

function BotonCv({ nombre, enlace, verde = false }: { nombre: string; enlace: string | null; verde?: boolean }) {
  const [avisando, avisar] = useAvisoTemporal(false, 2000);
  const clases = `boton-cv flex min-h-16 items-center justify-center gap-2.5 px-4 py-3 text-center text-[1.02rem] font-bold text-white no-underline transition-colors ${verde ? 'bg-verde hover:bg-[#4fcb5d]' : 'hover:bg-pu-400'}`;
  const contenido = (
    <>
      <svg className="size-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" />
      </svg>
      <span aria-live="polite">
        {avisando ? 'CV disponible pronto' : <><span className="hidden sm:inline">Descargar </span>CV · {nombre}</>}
      </span>
    </>
  );

  if (enlace) {
    return <a className={clases} href={enlace} target="_blank" rel="noopener">{contenido}</a>;
  }
  // Sin PDF todavía: en vez de un enlace a la nada, un botón que avisa con cariño
  return <button type="button" className={`${clases} w-full cursor-pointer`} onClick={() => avisar(true)}>{contenido}</button>;
}
