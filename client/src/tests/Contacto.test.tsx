import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Contacto } from '../components/Contacto';
import { enviarContacto } from '../services/contactoService';

vi.mock('../services/contactoService', () => ({ enviarContacto: vi.fn() }));

async function llenarFormulario() {
  const usuario = userEvent.setup();
  await usuario.click(screen.getByLabelText('Landing'));
  await usuario.type(screen.getByLabelText('Nombre'), 'Juan Pablo Almeida');
  await usuario.type(screen.getByLabelText('Correo'), 'juan@example.com');
  await usuario.type(screen.getByLabelText('Motivo'), 'Quiero una landing para mi negocio.');
  return usuario;
}

describe('formulario de contacto', () => {
  beforeEach(() => {
    vi.mocked(enviarContacto).mockReset();
    // jsdom no pinta canvas; callamos su queja pa' que no ensucie la salida
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('no envía nada si faltan datos y muestra los errores', async () => {
    render(<Contacto cotizacion={null} />);
    await userEvent.click(screen.getByRole('button', { name: /Enviar/ }));

    expect(await screen.findByText('Escribe tu nombre.')).toBeInTheDocument();
    expect(screen.getByText('Cuéntanos un poco más sobre tu proyecto.')).toBeInTheDocument();
    expect(enviarContacto).not.toHaveBeenCalled();
  });

  it('envía sin celular (es opcional) y muestra el mensaje de éxito', async () => {
    vi.mocked(enviarContacto).mockResolvedValue({ ok: true, mensaje: '¡Listo! Te respondemos pronto.' });
    render(<Contacto cotizacion={null} />);

    const usuario = await llenarFormulario();
    await usuario.click(screen.getByRole('button', { name: /Enviar/ }));

    expect(await screen.findByText(/Te respondemos pronto/)).toBeInTheDocument();
    expect(enviarContacto).toHaveBeenCalledWith(
      expect.objectContaining({ proyecto: 'landing', correo: 'juan@example.com', celular: '' }),
      'es',
    );
  });

  it('rechaza un celular con muy pocos dígitos', async () => {
    render(<Contacto cotizacion={null} />);
    const usuario = await llenarFormulario();
    await usuario.type(screen.getByLabelText(/Celular/), '123');
    await usuario.click(screen.getByRole('button', { name: /Enviar/ }));

    expect(await screen.findByText(/Escribe solo el número/)).toBeInTheDocument();
    expect(enviarContacto).not.toHaveBeenCalled();
  });

  it('pinta debajo del campo el error que devuelve el servidor', async () => {
    vi.mocked(enviarContacto).mockResolvedValue({ ok: false, errores: { correo: 'Ese correo no existe' } });
    render(<Contacto cotizacion={null} />);

    const usuario = await llenarFormulario();
    await usuario.click(screen.getByRole('button', { name: /Enviar/ }));

    expect(await screen.findByText('Ese correo no existe')).toBeInTheDocument();
  });

  it('los errores de campos que no se ven (general, sitioWeb) caen en el mensaje general', async () => {
    vi.mocked(enviarContacto).mockResolvedValue({
      ok: false,
      errores: { general: 'Algo raro pasó', sitioWeb: 'Campo trampa', correo: 'Ese correo no existe' },
    });
    render(<Contacto cotizacion={null} />);

    const usuario = await llenarFormulario();
    await usuario.click(screen.getByRole('button', { name: /Enviar/ }));

    expect(await screen.findByText('Ese correo no existe')).toBeInTheDocument();
    expect(screen.getByText('Revisa los campos marcados.')).toBeInTheDocument();
    expect(screen.queryByText('Campo trampa')).not.toBeInTheDocument();
  });

  it('cuenta los caracteres del motivo', async () => {
    render(<Contacto cotizacion={null} />);
    await userEvent.type(screen.getByLabelText('Motivo'), 'Hola');

    expect(screen.getByText('4 / 600')).toBeInTheDocument();
  });

  it('cuando llega una configuración del cotizador, escoge el tipo y llena el motivo', async () => {
    render(<Contacto cotizacion={{ tipoContacto: 'app-movil', mensaje: 'Hola, quiero cotizar: App móvil.' }} />);

    expect(screen.getByLabelText('App móvil')).toBeChecked();
    expect(screen.getByLabelText('Motivo')).toHaveValue('Hola, quiero cotizar: App móvil.');
  });

  it('si la persona ya escribió su motivo, el cotizador no se lo borra', async () => {
    const { rerender } = render(<Contacto cotizacion={null} />);
    await userEvent.type(screen.getByLabelText('Motivo'), 'Mi pastelería necesita una tienda en línea.');

    rerender(<Contacto cotizacion={{ tipoContacto: 'app-movil', mensaje: 'Hola, quiero cotizar: App móvil.' }} />);

    expect(screen.getByLabelText('App móvil')).toBeChecked();
    expect(screen.getByLabelText('Motivo')).toHaveValue('Mi pastelería necesita una tienda en línea.');
  });

  it('si el motivo lo puso el cotizador, sí lo actualiza con la nueva cotización', async () => {
    const { rerender } = render(<Contacto cotizacion={{ tipoContacto: 'landing', mensaje: 'Hola, quiero cotizar: Landing.' }} />);
    rerender(<Contacto cotizacion={{ tipoContacto: 'app-movil', mensaje: 'Hola, quiero cotizar: App móvil.' }} />);

    expect(screen.getByLabelText('Motivo')).toHaveValue('Hola, quiero cotizar: App móvil.');
  });

  it('anuncia los errores del servidor como alerta', async () => {
    vi.mocked(enviarContacto).mockResolvedValue({ ok: false, mensaje: 'El servidor respondió raro (502).' });
    render(<Contacto cotizacion={null} />);

    const usuario = await llenarFormulario();
    await usuario.click(screen.getByRole('button', { name: /Enviar/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El servidor respondió raro (502).');
  });

  describe('en inglés', () => {
    beforeEach(() => {
      document.documentElement.lang = 'en';
    });
    afterEach(() => {
      document.documentElement.lang = '';
    });

    it('los errores de validación salen en inglés', async () => {
      render(<Contacto cotizacion={null} />);
      await userEvent.click(screen.getByRole('button', { name: /Send/ }));

      expect(await screen.findByText('Please enter your name.')).toBeInTheDocument();
      expect(screen.getByText('Tell us a bit more about your project.')).toBeInTheDocument();
    });

    it('reconoce el mensaje del cotizador en inglés y lo cambia por la nueva cotización', async () => {
      const { rerender } = render(<Contacto cotizacion={{ tipoContacto: 'landing', mensaje: "Hi, I'd like a quote for: Landing page." }} />);
      rerender(<Contacto cotizacion={{ tipoContacto: 'app-movil', mensaje: "Hi, I'd like a quote for: Mobile app." }} />);

      expect(screen.getByLabelText('Message')).toHaveValue("Hi, I'd like a quote for: Mobile app.");
    });

    it('le pasa el idioma al servicio pa’ que los avisos también lleguen en inglés', async () => {
      vi.mocked(enviarContacto).mockResolvedValue({ ok: true, mensaje: "Done! We'll get back to you soon." });
      render(<Contacto cotizacion={null} />);
      const usuario = userEvent.setup();
      await usuario.type(screen.getByLabelText('Name'), 'Juan Pablo Almeida');
      await usuario.type(screen.getByLabelText('Email'), 'juan@example.com');
      await usuario.type(screen.getByLabelText('Message'), 'I need a landing page for my business.');
      await usuario.click(screen.getByRole('button', { name: /Send/ }));

      expect(await screen.findByText(/get back to you soon/)).toBeInTheDocument();
      expect(enviarContacto).toHaveBeenCalledWith(expect.objectContaining({ correo: 'juan@example.com' }), 'en');
    });
  });
});
