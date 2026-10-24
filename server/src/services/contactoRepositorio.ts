import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
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

// Se lee en cada llamada pa' que las pruebas puedan apuntar a una carpeta temporal
const rutaArchivo = () => path.resolve(process.env.RUTA_CONTACTOS ?? 'datos/contactos.json');

// Las escrituras van en fila india: si llegan dos mensajes al tiempo, ninguno pisa al otro
let fila: Promise<unknown> = Promise.resolve();

export async function leerContactos(): Promise<ContactoGuardado[]> {
  try {
    return JSON.parse(await readFile(rutaArchivo(), 'utf8')) as ContactoGuardado[];
  } catch (error) {
    // Que no exista es normal (primer mensaje). Si está dañado, mejor reventar que sobrescribirlo
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
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
