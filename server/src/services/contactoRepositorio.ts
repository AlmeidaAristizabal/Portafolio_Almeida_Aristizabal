import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MensajeContacto } from '../models/MensajeContacto.js';

export interface ContactoGuardado {
  id: string;
  fecha: string;
  proyecto: MensajeContacto['proyecto'] | null;
  nombre: string;
  correo: string;
  celular: string;
  motivo: string;
}

// La carpeta server/, vengamos de src/services o de dist/services. Así da igual desde dónde arranquen el server
const RAIZ_SERVER = fileURLToPath(new URL('../../', import.meta.url));

// Se lee en cada llamada pa' que las pruebas puedan apuntar a una carpeta temporal
export const rutaArchivo = () => path.resolve(RAIZ_SERVER, process.env.RUTA_CONTACTOS ?? 'datos/contactos.json');

// Las escrituras van en fila india: si llegan dos mensajes al tiempo, ninguno pisa al otro
let fila: Promise<unknown> = Promise.resolve();

export async function leerContactos(): Promise<ContactoGuardado[]> {
  let contenido: unknown;
  try {
    contenido = JSON.parse(await readFile(rutaArchivo(), 'utf8'));
  } catch (error) {
    // Que no exista es normal (primer mensaje). Si está dañado, mejor reventar que sobrescribirlo
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  // JSON válido pero no es una lista ({} o null): igual de dañado, y con un error que se entienda
  if (!Array.isArray(contenido)) {
    throw new Error(`${rutaArchivo()} debería tener una lista de contactos y tiene otra cosa`);
  }
  return contenido as ContactoGuardado[];
}

export function guardarContacto(mensaje: MensajeContacto): Promise<ContactoGuardado> {
  const contacto: ContactoGuardado = {
    id: randomUUID(),
    fecha: new Date().toISOString(),
    proyecto: mensaje.proyecto ?? null,
    nombre: mensaje.nombre,
    correo: mensaje.correo,
    celular: mensaje.celular ?? '',
    motivo: mensaje.motivo,
  };

  const turno = fila.then(async () => {
    const ruta = rutaArchivo();
    const contactos = await leerContactos();
    contactos.push(contacto);
    await mkdir(path.dirname(ruta), { recursive: true });
    // Primero a un temporal y luego se renombra: si el server se cae a mitad, el JSON viejo queda intacto
    const temporal = `${ruta}.${process.pid}.tmp`;
    await writeFile(temporal, JSON.stringify(contactos, null, 2));
    await rename(temporal, ruta);
    return contacto;
  });
  // Si una escritura falla, la siguiente igual tiene su turno
  fila = turno.catch(() => {});
  return turno;
}
