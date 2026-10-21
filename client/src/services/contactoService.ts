import type { DatosContacto } from '../schemas/contacto';

export type RespuestaContacto =
  | { ok: true; mensaje: string }
  | { ok: false; mensaje?: string; errores?: Partial<Record<keyof DatosContacto, string>> };

const URL_API = import.meta.env.VITE_URL_API ?? '';
const LIMITE_MS = 10_000;
const MENSAJE_EXITO = '¡Listo! Te respondemos pronto.';

export async function enviarContacto(datos: DatosContacto): Promise<RespuestaContacto> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}/api/contacto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
      // Si el servidor se duerme más de 10 s, no lo esperamos hasta el juicio final
      signal: AbortSignal.timeout(LIMITE_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return { ok: false, mensaje: 'El servidor se demoró mucho en responder. Intenta de nuevo.' };
    }
    // Se cayó el internet o el servidor está dormido
    return { ok: false, mensaje: 'No hay conexión con el servidor. Intenta de nuevo.' };
  }

  // Un 502 del proxy llega en HTML: no nos tragamos cualquier cosa que diga ser JSON
  const cuerpo: unknown = await respuesta.json().catch(() => null);
  // Y si dice "ok: true" con un 500, tampoco le creemos
  if (!esRespuesta(cuerpo) || (cuerpo.ok && !respuesta.ok)) {
    return { ok: false, mensaje: `El servidor respondió raro (${respuesta.status}). Intenta más tarde.` };
  }
  if (cuerpo.ok) return { ok: true, mensaje: cuerpo.mensaje || MENSAJE_EXITO };
  return cuerpo;
}

function esRespuesta(valor: unknown): valor is RespuestaContacto {
  if (typeof valor !== 'object' || valor === null) return false;
  const { ok, mensaje, errores } = valor as Record<string, unknown>;
  if (typeof ok !== 'boolean') return false;
  if (mensaje !== undefined && typeof mensaje !== 'string') return false;
  return errores === undefined || (typeof errores === 'object' && errores !== null);
}
