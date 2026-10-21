import { afterEach, describe, expect, it, vi } from 'vitest';
import { enviarContacto } from '../services/contactoService';

const datos = { proyecto: 'landing', nombre: 'Juan Pablo Almeida', correo: 'juan@example.com', celular: '', motivo: 'Quiero una landing.' } as const;

// Un fetch de mentiritas que contesta lo que le digamos
function responder(cuerpo: string, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(cuerpo, { status })));
}

describe('servicio de contacto', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('devuelve lo que dice el servidor cuando todo sale bien', async () => {
    responder(JSON.stringify({ ok: true, mensaje: 'Recibido' }));
    expect(await enviarContacto(datos)).toEqual({ ok: true, mensaje: 'Recibido' });
  });

  it('si el servidor dice ok pero no manda mensaje, pone uno por defecto', async () => {
    responder(JSON.stringify({ ok: true }));
    const respuesta = await enviarContacto(datos);
    expect(respuesta.ok).toBe(true);
    expect(respuesta.mensaje).toBeTruthy();
  });

  it('pasa los errores por campo que manda el servidor', async () => {
    responder(JSON.stringify({ ok: false, errores: { correo: 'Ese correo no existe' } }), 400);
    expect(await enviarContacto(datos)).toEqual({ ok: false, errores: { correo: 'Ese correo no existe' } });
  });

  it('no confunde un 502 en HTML con "no hay conexión"', async () => {
    responder('<html>Bad Gateway</html>', 502);
    const respuesta = await enviarContacto(datos);
    expect(respuesta.ok).toBe(false);
    expect(respuesta.mensaje).toMatch(/respondió raro \(502\)/);
  });

  it('no se traga un 500 que trae otro JSON', async () => {
    responder(JSON.stringify({ error: 'se rompió' }), 500);
    const respuesta = await enviarContacto(datos);
    expect(respuesta.ok).toBe(false);
    expect(respuesta.mensaje).toMatch(/\(500\)/);
  });

  it('avisa cuando no hay conexión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect((await enviarContacto(datos)).mensaje).toMatch(/No hay conexión/);
  });

  it('avisa cuando el servidor se demora más de la cuenta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('tiempo', 'TimeoutError')));
    expect((await enviarContacto(datos)).mensaje).toMatch(/se demoró mucho/);
  });

  it('le pone tiempo límite a la petición', async () => {
    responder(JSON.stringify({ ok: true, mensaje: 'Recibido' }));
    await enviarContacto(datos);
    expect(vi.mocked(fetch).mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });
});
