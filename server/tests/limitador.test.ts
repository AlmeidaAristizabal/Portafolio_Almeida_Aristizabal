import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { crearApp } from '../src/app.js';

vi.mock('../src/services/correoService.js', () => ({
  enviarCorreoContacto: vi.fn().mockResolvedValue(undefined),
}));

// Va en archivo aparte porque el contador del limitador se queda con la memoria entre pruebas
describe('límite de mensajes', () => {
  it('bloquea el sexto mensaje seguido desde la misma IP', async () => {
    const app = crearApp();
    const mensaje = {
      proyecto: 'landing',
      nombre: 'Juan Pablo Almeida',
      correo: 'juan@example.com',
      celular: '3001234567',
      motivo: 'Quiero una landing para mi emprendimiento.',
    };

    for (let i = 0; i < 5; i++) {
      const ok = await request(app).post('/api/contacto').send(mensaje);
      expect(ok.status).toBe(201);
    }

    const bloqueado = await request(app).post('/api/contacto').send(mensaje);
    expect(bloqueado.status).toBe(429);
  });
});

describe('límite de mensajes detrás de un proxy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('cuenta por la IP real del cliente, no por la del proxy', async () => {
    vi.stubEnv('SALTOS_PROXY', '1');
    const app = crearApp();
    const mensaje = {
      nombre: 'Juan Pablo Almeida',
      correo: 'juan@example.com',
      motivo: 'Quiero una landing para mi emprendimiento.',
    };

    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/contacto').set('X-Forwarded-For', '203.0.113.1').send(mensaje);
    }
    const bloqueado = await request(app).post('/api/contacto').set('X-Forwarded-For', '203.0.113.1').send(mensaje);
    expect(bloqueado.status).toBe(429);

    // Otra persona detrás del mismo proxy no paga los platos rotos
    const vecino = await request(app).post('/api/contacto').set('X-Forwarded-For', '203.0.113.2').send(mensaje);
    expect(vecino.status).toBe(201);
  });
});
