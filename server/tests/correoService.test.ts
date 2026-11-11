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

  it('si Ethereal no contesta, no se queda colgado: imprime el correo en la consola', async () => {
    process.env.NODE_ENV = 'development';
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const nodemailer = (await import('nodemailer')).default;
    // Ethereal haciéndose el muerto: una promesa que nunca resuelve
    vi.mocked(nodemailer.createTestAccount).mockReturnValueOnce(new Promise(() => {}));
    const { enviarCorreoContacto, LIMITE_ETHEREAL_MS } = await import('../src/services/correoService.js');

    const envio = enviarCorreoContacto(mensaje);
    await vi.advanceTimersByTimeAsync(LIMITE_ETHEREAL_MS);
    await envio;
    vi.useRealTimers();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({ jsonTransport: true });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ replyTo: 'juan@example.com' }));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Quiero una landing para mi negocio.'));
  });

  it('después de caer en la consola, el siguiente correo vuelve a intentar con Ethereal', async () => {
    process.env.NODE_ENV = 'development';
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const nodemailer = (await import('nodemailer')).default;
    // La primera vez Ethereal se cuelga (un bajón de internet); la segunda ya contesta
    vi.mocked(nodemailer.createTestAccount).mockReturnValueOnce(new Promise(() => {}));
    const { enviarCorreoContacto, LIMITE_ETHEREAL_MS } = await import('../src/services/correoService.js');

    const primero = enviarCorreoContacto(mensaje);
    await vi.advanceTimersByTimeAsync(LIMITE_ETHEREAL_MS);
    await primero;
    vi.useRealTimers();
    sendMail.mockClear();

    await enviarCorreoContacto(mensaje);

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'prueba@ethereal.email' }));
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
