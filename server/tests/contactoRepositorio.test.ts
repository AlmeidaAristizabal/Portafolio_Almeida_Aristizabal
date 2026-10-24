import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { guardarContacto, leerContactos } from '../src/services/contactoRepositorio.js';

const mensaje = {
  proyecto: 'landing' as const,
  nombre: 'Juan Pablo Almeida',
  correo: 'juan@example.com',
  motivo: 'Quiero una landing para mi negocio.',
  sitioWeb: '',
};

describe('repositorio de contactos', () => {
  const rutaOriginal = process.env.RUTA_CONTACTOS;
  let carpeta: string;
  let ruta: string;

  beforeEach(async () => {
    // Cada prueba con su carpeta temporal: el contactos.json de verdad ni se entera
    carpeta = await mkdtemp(path.join(tmpdir(), 'contactos-'));
    ruta = path.join(carpeta, 'datos', 'contactos.json');
    process.env.RUTA_CONTACTOS = ruta;
  });

  afterEach(async () => {
    process.env.RUTA_CONTACTOS = rutaOriginal;
    if (rutaOriginal === undefined) delete process.env.RUTA_CONTACTOS;
    await rm(carpeta, { recursive: true, force: true });
  });

  it('crea la carpeta y el archivo con el primer mensaje, sin la trampa de bots', async () => {
    const guardado = await guardarContacto(mensaje);

    const enDisco = JSON.parse(await readFile(ruta, 'utf8'));
    expect(enDisco).toEqual([guardado]);
    expect(guardado).toMatchObject({ nombre: 'Juan Pablo Almeida', celular: '', proyecto: 'landing' });
    expect(guardado.id).toBeTruthy();
    expect(guardado).not.toHaveProperty('sitioWeb');
  });

  it('no pierde ninguno si llegan varios al mismo tiempo', async () => {
    await Promise.all(Array.from({ length: 10 }, (_, i) => guardarContacto({ ...mensaje, nombre: `Persona ${i}` })));

    const contactos = await leerContactos();
    expect(contactos).toHaveLength(10);
    expect(new Set(contactos.map((c) => c.id)).size).toBe(10);
  });

  it('si el archivo está dañado, falla en vez de borrar lo que había', async () => {
    await guardarContacto(mensaje);
    await writeFile(ruta, '[{"esto no es JSON');

    await expect(guardarContacto(mensaje)).rejects.toThrow();
    expect(await readFile(ruta, 'utf8')).toBe('[{"esto no es JSON');
    // Y la fila no se queda trancada por el error
    await writeFile(ruta, '[]');
    await expect(guardarContacto(mensaje)).resolves.toMatchObject({ nombre: 'Juan Pablo Almeida' });
  });
});
