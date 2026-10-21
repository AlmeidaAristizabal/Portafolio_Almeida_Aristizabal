import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
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
