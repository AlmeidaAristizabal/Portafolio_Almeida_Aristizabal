import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { CORREO_CONTACTO, ENLACE_GITHUB, ENLACE_LINKEDIN } from '../data/contenido';
import { FOTO_ELEIRA, FOTO_JUAN } from '../data/fotos';
import { volarAvioneta } from '../efectos/avionetaEnviado';
import { useAvisoTemporal } from '../hooks/useAvisoTemporal';
import { useMovimientoReducido } from '../hooks/useMovimientoReducido';
import { esquemaContacto, MAX_MOTIVO, OPCIONES_PROYECTO, type DatosContacto } from '../schemas/contacto';
import { enviarContacto } from '../services/contactoService';
import { PREFIJO_COTIZACION } from '../utils/cotizador';
import type { CotizacionElegida } from './Cotizador';

type Estado = { tipo: 'quieto' } | { tipo: 'exito' | 'error'; mensaje: string };

const CAMPOS_VISIBLES = ['proyecto', 'nombre', 'correo', 'celular', 'motivo'] as const;
const esCampoVisible = (campo: string): campo is (typeof CAMPOS_VISIBLES)[number] =>
  (CAMPOS_VISIBLES as readonly string[]).includes(campo);

export function Contacto({ cotizacion }: { cotizacion: CotizacionElegida | null }) {
  const movimientoReducido = useMovimientoReducido();
  const [estado, setEstado] = useState<Estado>({ tipo: 'quieto' });
  const [volando, setVolando] = useState(false);
  const seccion = useRef<HTMLElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const botonEnviar = useRef<HTMLButtonElement>(null);
  const fotoJuan = useRef<HTMLImageElement>(null);
  const fotoEleira = useRef<HTMLImageElement>(null);
  const tarjeta = useRef<HTMLDivElement>(null);
  const cancelarVuelo = useRef<(() => void) | null>(null);
  // En un ref pa' que cambiar la preferencia de movimiento no vuelva a disparar el efecto del cotizador
  const reducidoRef = useRef(movimientoReducido);
  useEffect(() => {
    reducidoRef.current = movimientoReducido;
  }, [movimientoReducido]);

  const {
    register, handleSubmit, reset, setValue, getValues, setError, setFocus, control,
    formState: { errors, isSubmitting },
  } = useForm<DatosContacto>({
    resolver: zodResolver(esquemaContacto),
    mode: 'onTouched',
    defaultValues: { nombre: '', correo: '', celular: '', motivo: '' },
  });
  const largoMotivo = useWatch({ control, name: 'motivo' })?.length ?? 0;

  // Si la avioneta va en el aire y la persona se va de la página, la aterrizamos
  useEffect(() => () => cancelarVuelo.current?.(), []);

  // Cuando llega una configuración del cotizador: escoge el tipo, llena el motivo y baja hasta aquí
  useEffect(() => {
    if (!cotizacion) return;
    setValue('proyecto', cotizacion.tipoContacto);
    // Solo pisamos el motivo si está vacío o lo escribió el mismo cotizador: lo que escribió la persona es sagrado
    const actual = getValues('motivo').trim();
    if (!actual || actual.startsWith(PREFIJO_COTIZACION)) {
      setValue('motivo', cotizacion.mensaje, { shouldValidate: true });
    }
    const reducido = reducidoRef.current;
    seccion.current?.scrollIntoView?.({ behavior: reducido ? 'auto' : 'smooth' });
    const reloj = setTimeout(() => setFocus('nombre'), reducido ? 0 : 800);
    return () => clearTimeout(reloj);
  }, [cotizacion, setValue, getValues, setFocus]);

  const alEnviar = async (datos: DatosContacto) => {
    setEstado({ tipo: 'quieto' });
    const respuesta = await enviarContacto(datos);

    if (!respuesta.ok) {
      // Si el servidor dice qué campo falló, lo pintamos debajo de ese campo.
      // Los que no se ven en el formulario (general, sitioWeb) se quedan con el mensaje de abajo
      for (const [campo, mensaje] of Object.entries(respuesta.errores ?? {})) {
        if (esCampoVisible(campo)) setError(campo, { message: mensaje });
      }
      setEstado({ tipo: 'error', mensaje: respuesta.mensaje ?? 'Revisa los campos marcados.' });
      return;
    }

    // El servidor ya confirmó: lo anunciamos de una, la avioneta es puro show
    setEstado({ tipo: 'exito', mensaje: respuesta.mensaje });
    // La avioneta solo sale si el mensaje SÍ llegó: no vamos a anunciar "¡ENVIADO!" de mentiras
    if (movimientoReducido || !botonEnviar.current || !seccion.current || !formulario.current) return reset();
    setVolando(true);
    cancelarVuelo.current = volarAvioneta(
      {
        boton: botonEnviar.current, seccion: seccion.current, formulario: formulario.current,
        fotoJuan: fotoJuan.current, fotoEleira: fotoEleira.current, tarjeta: tarjeta.current,
      },
      () => { setVolando(false); cancelarVuelo.current = null; reset(); },
    );
  };

  const ocupado = isSubmitting || volando;

  return (
    <section
      ref={seccion}
      id="contacto"
      aria-labelledby="titulo-contacto"
      className="seccion-contacto oscuro relative flex min-h-[calc(100svh-68px)] items-stretch [scroll-margin-top:94px]"
    >
      <h2
        id="titulo-contacto"
        className="absolute top-0 left-[calc(max(0px,(100%-1180px)/2)+clamp(16px,4vw,40px))] z-[4] m-0 -translate-y-1/2 rounded-full border-[1.5px] border-in-100 bg-in-600 px-7 py-2 text-[clamp(1.15rem,2.2vw,1.4rem)] leading-snug font-bold text-white shadow-[0_12px_26px_-14px_var(--win-shadow)]"
      >
        Contáctanos
      </h2>

      <div className="envoltura relative z-[1] grid flex-1 grid-cols-1 gap-0 min-[861px]:grid-cols-[minmax(0,1fr)_minmax(0,400px)] min-[861px]:gap-[clamp(2rem,5vw,4rem)] min-[1024px]:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        <div className="flex min-w-0 flex-col justify-center gap-7 pt-[clamp(4.5rem,10vh,6.5rem)] pb-10 min-[861px]:pb-[clamp(3rem,7vh,5rem)]">
          <div>
            <p className="m-0 font-titulo text-[clamp(2.6rem,5vw,4rem)] leading-none font-semibold tracking-[0.01em] text-balance text-white uppercase">
              ¿Tienes un proyecto en mente?
            </p>
            <p className="mt-3 mb-0 max-w-[50ch] text-in-100">
              Cuéntanos qué quieres construir. Te respondemos con preguntas concretas y una propuesta de alcance.
            </p>
          </div>

          <form ref={formulario} onSubmit={(e) => void handleSubmit(alEnviar)(e)} noValidate className="flex flex-col gap-4 min-[861px]:max-w-[600px]">
            <Fila etiqueta={<span id="etiqueta-tipo">Proyecto</span>}>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="etiqueta-tipo">
                {OPCIONES_PROYECTO.map((o) => (
                  <label key={o.id} className="chip-tipo relative">
                    <input type="radio" value={o.id} {...register('proyecto')} className="absolute inset-0 m-0 cursor-pointer opacity-0" />
                    <span className="inline-flex items-center rounded-full border border-(--field-bd) px-4 py-2 text-[0.93rem] font-semibold text-in-50">
                      {o.texto}
                    </span>
                  </label>
                ))}
              </div>
            </Fila>

            <Fila etiqueta={<label htmlFor="nombre">Nombre</label>} error={errors.nombre?.message} idError="error-nombre">
              <input id="nombre" className="campo" type="text" autoComplete="name" placeholder="Tu nombre completo"
                aria-invalid={!!errors.nombre} aria-describedby="error-nombre" {...register('nombre')} />
            </Fila>
            <Fila etiqueta={<label htmlFor="correo">Correo</label>} error={errors.correo?.message} idError="error-correo">
              <input id="correo" className="campo" type="email" autoComplete="email" inputMode="email" placeholder="nombre@dominio.com"
                aria-invalid={!!errors.correo} aria-describedby="error-correo" {...register('correo')} />
            </Fila>
            <Fila
              etiqueta={<label htmlFor="celular">Celular <span className="block text-[0.76rem] font-normal text-in-200">opcional</span></label>}
              error={errors.celular?.message}
              idError="error-celular"
            >
              <input id="celular" className="campo" type="tel" autoComplete="tel" inputMode="tel" placeholder="300 123 4567"
                aria-invalid={!!errors.celular} aria-describedby="error-celular" {...register('celular')} />
            </Fila>
            <Fila
              etiqueta={<label htmlFor="motivo">Motivo</label>}
              error={errors.motivo?.message}
              idError="error-motivo"
              extra={<p id="contador-motivo" className="mt-1.5 mb-0 ml-auto font-mono text-[0.72rem] text-in-200 tabular-nums">{largoMotivo} / {MAX_MOTIVO}</p>}
            >
              <textarea id="motivo" className="campo" rows={4} maxLength={MAX_MOTIVO}
                placeholder="Ej.: Deseo cotizar una página web para una pastelería que vende varias categorías de productos."
                aria-invalid={!!errors.motivo} aria-describedby="error-motivo contador-motivo" {...register('motivo')} />
            </Fila>

            {/* Campo trampa: invisible pa' humanos, irresistible pa' bots */}
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register('sitioWeb')} />

            {/* Siempre en el DOM: si la región viva nace con el texto adentro, el lector de pantalla ni se entera */}
            <p
              role={estado.tipo === 'error' ? 'alert' : 'status'}
              className={estado.tipo === 'quieto' ? 'sr-only' : 'estado-form m-0 rounded-[10px] border border-(--line) bg-(--dark-surface-2) px-4 py-3 text-[0.95rem] text-in-50'}
            >
              {estado.tipo !== 'quieto' ? estado.mensaje : ''}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:pl-[7.75rem]">
              <button
                ref={botonEnviar}
                type="submit"
                disabled={ocupado}
                className={`boton-enviar inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-[1.5px] border-white bg-in-600 px-10 py-2.5 text-[1.3rem] leading-snug font-bold text-white sm:w-auto ${volando ? 'volando' : ''}`}
              >
                {isSubmitting ? 'Enviando…' : 'Enviar'}
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 19 19 5" /><path d="M9 5h10v10" />
                </svg>
              </button>
              <p className="m-0 text-[0.86rem] text-in-200">Solo usamos tus datos para responderte.</p>
            </div>
          </form>
        </div>

        <div className="aparecer relative flex min-w-0 flex-col pt-0 min-[861px]:pt-[clamp(4.5rem,10vh,6.5rem)]">
          <TarjetaCorreo ref={tarjeta} />
          <div className="personas-contacto pointer-events-none relative mt-6 h-[260px] flex-none sm:h-80 min-[861px]:mt-0 min-[861px]:h-auto min-[861px]:min-h-[340px] min-[861px]:flex-1" aria-hidden>
            <img ref={fotoEleira} src={FOTO_ELEIRA.src} alt="" width={FOTO_ELEIRA.ancho} height={FOTO_ELEIRA.alto} loading="lazy"
              className="foto-c-eleira absolute right-[6%] bottom-0 z-[1] h-auto max-h-full w-[40%] max-w-none object-contain object-right-bottom min-[861px]:right-0 min-[861px]:w-[53%]" />
            <img ref={fotoJuan} src={FOTO_JUAN.src} alt="" width={FOTO_JUAN.ancho} height={FOTO_JUAN.alto} loading="lazy"
              className="foto-c-juan absolute bottom-0 left-[6%] z-[2] h-auto max-h-full w-[52%] max-w-none object-contain object-left-bottom min-[861px]:left-0 min-[861px]:w-[70%]" />
          </div>
        </div>
      </div>
    </section>
  );
}

interface PropsFila {
  etiqueta: React.ReactNode;
  error?: string;
  idError?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

function Fila({ etiqueta, error, idError, extra, children }: PropsFila) {
  return (
    <div className="grid grid-cols-1 items-start gap-1 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-5">
      <div className="leading-snug font-bold text-white sm:pt-2">{etiqueta}</div>
      <div>
        {children}
        {(idError || extra) && (
          <div className="flex justify-between gap-4">
            {idError && <p id={idError} className="mt-1.5 mb-0 text-[0.86rem] text-pu-100 empty:hidden">{error}</p>}
            {extra}
          </div>
        )}
      </div>
    </div>
  );
}

function TarjetaCorreo({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  const [texto, avisar] = useAvisoTemporal('Copiar', 2000);
  const correo = useRef<HTMLSpanElement>(null);

  // Si el portapapeles no deja, al menos dejamos el correo seleccionado pa' que lo copien a mano
  const seleccionar = () => {
    if (!correo.current) return;
    const rango = document.createRange();
    rango.selectNodeContents(correo.current);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(rango);
  };
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(CORREO_CONTACTO);
      avisar('Copiado');
    } catch {
      seleccionar();
      avisar('Selecciónalo');
    }
  };

  return (
    <div
      ref={ref}
      className="relative z-[3] grid w-auto gap-3.5 self-stretch rounded-2xl border border-(--dark-line) bg-(--dark-surface) px-5 py-5 backdrop-blur-[10px] min-[861px]:w-[min(100%,380px)] min-[861px]:self-end"
    >
      <p className="m-0 font-mono text-[0.76rem] text-in-100">¿Prefieres escribirnos directo?</p>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <span ref={correo} className="min-w-0 font-mono text-[1.02rem] break-all text-white select-all">{CORREO_CONTACTO}</span>
        <button type="button" className="boton boton-fantasma boton-sm" onClick={copiar}>{texto}</button>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <a className="boton boton-fantasma boton-sm" href={ENLACE_GITHUB} target="_blank" rel="noopener">GitHub ↗</a>
        <a className="boton boton-fantasma boton-sm" href={ENLACE_LINKEDIN} target="_blank" rel="noopener">LinkedIn ↗</a>
      </div>
    </div>
  );
}
