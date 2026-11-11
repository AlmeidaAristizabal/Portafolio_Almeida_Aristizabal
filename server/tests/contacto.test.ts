import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearApp } from '../src/app.js';
import { guardarContacto } from '../src/services/contactoRepositorio.js';
import { enviarCorreoContacto } from '../src/services/correoService.js';

// Nadie quiere recibir 40 correos cada vez que corre las pruebas
vi.mock('../src/services/correoService.js', () => ({
  enviarCorreoContacto: vi.fn().mockResolvedValue(undefined),
}));
// Ni llenar el contactos.json de verdad con mensajes de mentira
vi.mock('../src/services/contactoRepositorio.js', () => ({
  guardarContacto: vi.fn().mockResolvedValue(undefined),
}));

const mensajeValido = {
  proyecto: 'pagina-web',
  nombre: 'Eleira Alejandra Aristizabal Muñoz',
  correo: 'alejandra@example.com',
  celular: '3246586763',
  motivo: 'Deseo cotizar una página web para una pastelería.',
};

describe('POST /api/contacto', () => {
  let app: ReturnType<typeof crearApp>;

  beforeEach(() => {
    app = crearApp();
    vi.mocked(enviarCorreoContacto).mockClear();
    vi.mocked(guardarContacto).mockClear();
  });

  it('guarda el mensaje antes de mandar el correo', async () => {
    const respuesta = await request(app).post('/api/contacto').send(mensajeValido);

    expect(respuesta.status).toBe(201);
    expect(guardarContacto).toHaveBeenCalledWith(expect.objectContaining({ correo: mensajeValido.correo }));
    const ordenGuardar = vi.mocked(guardarContacto).mock.invocationCallOrder[0];
    const ordenCorreo = vi.mocked(enviarCorreoContacto).mock.invocationCallOrder[0];
    expect(ordenGuardar).toBeLessThan(ordenCorreo);
  });

  it('si no se puede guardar, responde 500 y no manda el correo', async () => {
    vi.mocked(guardarContacto).mockRejectedValueOnce(new Error('Disco lleno'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const respuesta = await request(app).post('/api/contacto').send(mensajeValido);

    expect(respuesta.status).toBe(500);
    expect(enviarCorreoContacto).not.toHaveBeenCalled();
  });

  it('acepta un mensaje válido y manda el correo', async () => {
    const respuesta = await request(app).post('/api/contacto').send(mensajeValido);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.ok).toBe(true);
    expect(enviarCorreoContacto).toHaveBeenCalledWith(expect.objectContaining({ nombre: mensajeValido.nombre }));
  });

  it('rechaza un correo mal escrito y dice cuál campo falló', async () => {
    const respuesta = await request(app)
      .post('/api/contacto')
      .send({ ...mensajeValido, correo: 'esto-no-es-correo' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores).toHaveProperty('correo');
    expect(enviarCorreoContacto).not.toHaveBeenCalled();
  });

  it('rechaza un tipo de proyecto que no existe', async () => {
    const respuesta = await request(app)
      .post('/api/contacto')
      .send({ ...mensajeValido, proyecto: 'nave-espacial' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores).toHaveProperty('proyecto');
  });

  it('acepta el mensaje sin celular ni tipo de proyecto (son opcionales)', async () => {
    const { celular: _celular, proyecto: _proyecto, ...sinOpcionales } = mensajeValido;
    const respuesta = await request(app).post('/api/contacto').send({ ...sinOpcionales, proyecto: null, celular: '' });

    expect(respuesta.status).toBe(201);
  });

  it('si escriben celular, tiene que tener entre 7 y 15 dígitos', async () => {
    const respuesta = await request(app)
      .post('/api/contacto')
      .send({ ...mensajeValido, celular: '123' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores).toHaveProperty('celular');
  });

  it('rechaza motivos de más de 600 caracteres', async () => {
    const respuesta = await request(app)
      .post('/api/contacto')
      .send({ ...mensajeValido, motivo: 'a'.repeat(601) });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores).toHaveProperty('motivo');
  });

  it('al bot que llena el campo trampa le dice que sí, pero no manda nada', async () => {
    const respuesta = await request(app)
      .post('/api/contacto')
      .send({ ...mensajeValido, sitioWeb: 'http://spam.com' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.ok).toBe(true);
    expect(respuesta.body).not.toHaveProperty('errores');
    expect(enviarCorreoContacto).not.toHaveBeenCalled();
  });

  it('si el correo falla pero ya se guardó, responde éxito pa\' que no lo manden dos veces', async () => {
    vi.mocked(enviarCorreoContacto).mockRejectedValueOnce(new Error('SMTP caído'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const respuesta = await request(app).post('/api/contacto').send(mensajeValido);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.ok).toBe(true);
    expect(guardarContacto).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('el correo no salió'), expect.any(Error));
  });
});
