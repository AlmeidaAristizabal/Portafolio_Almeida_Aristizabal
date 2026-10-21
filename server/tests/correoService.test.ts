import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Nodemailer de mentira: nada sale a internet en las pruebas
const sendMail = vi.fn().mockResolvedValue({ messageId: 'abc' });
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail })),
    createTestAccount: vi.fn().mockResolvedValue({
      user: 'prueba@ethereal.email',
      pass: 'clave-de-mentiras',
      smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
    }),
    getTestMessageUrl: vi.fn(() => 'https://ethereal.email/message/abc'),
  },
}));

const mensaje = {
  nombre: 'Juan Pablo Almeida',
  correo: 'juan@example.com',
  motivo: 'Quiero una landing para mi negocio.',
};

describe('servicio de correo', () => {
  const entornoOriginal = { ...process.env };

  beforeEach(() => {
    // Cada prueba arranca con el servicio limpio (sin cartero guardado) y sin variables SMTP
    vi.resetModules();
    sendMail.mockClear();
    for (const clave of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USUARIO', 'SMTP_CLAVE', 'CORREO_DESTINO']) delete process.env[clave];
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...entornoOriginal };
  });

  it('en desarrollo sin .env usa el buzón de prueba de Ethereal', async () => {
    process.env.NODE_ENV = 'development';
    const { enviarCorreoContacto } = await import('../src/services/correoService.js');

    await enviarCorreoContacto(mensaje);

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'prueba@ethereal.email', replyTo: 'juan@example.com' }));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('https://ethereal.email/message/abc'));
  });

  it('en producción sin .env falla en vez de fingir que envió', async () => {
    process.env.NODE_ENV = 'production';
    const { enviarCorreoContacto } = await import('../src/services/correoService.js');

    await expect(enviarCorreoContacto(mensaje)).rejects.toThrow('Faltan las variables SMTP');
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('con el .env lleno usa el SMTP real y manda al CORREO_DESTINO', async () => {
    Object.assign(process.env, { SMTP_HOST: 'smtp.gmail.com', SMTP_USUARIO: 'aj@gmail.com', SMTP_CLAVE: 'x', CORREO_DESTINO: 'equipo@aj.dev' });
    const { enviarCorreoContacto } = await import('../src/services/correoService.js');

    await enviarCorreoContacto(mensaje);

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'equipo@aj.dev', from: '"Portafolio AJ" <aj@gmail.com>' }));
  });
});
