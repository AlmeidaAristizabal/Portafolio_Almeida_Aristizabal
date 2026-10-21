import nodemailer, { type Transporter } from 'nodemailer';
import { NOMBRES_PROYECTO, type MensajeContacto } from '../models/MensajeContacto.js';

interface Cartero {
  transportador: Transporter;
  remitente: string;
  destino: string;
  esPrueba: boolean;
}

let cartero: Promise<Cartero> | null = null;

// Se crea la primera vez que se usa, así las pruebas no necesitan un SMTP de verdad
async function crearCartero(): Promise<Cartero> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USUARIO, SMTP_CLAVE, CORREO_DESTINO, NODE_ENV } = process.env;

  if (SMTP_HOST && SMTP_USUARIO && SMTP_CLAVE) {
    const puerto = Number(SMTP_PORT ?? 465);
    return {
      transportador: nodemailer.createTransport({
        host: SMTP_HOST,
        port: puerto,
        secure: puerto === 465,
        auth: { user: SMTP_USUARIO, pass: SMTP_CLAVE },
      }),
      remitente: SMTP_USUARIO,
      destino: CORREO_DESTINO ?? SMTP_USUARIO,
      esPrueba: false,
    };
  }

  // En producción sin SMTP no hay trampa: que falle y se note
  if (NODE_ENV === 'production') {
    throw new Error('Faltan las variables SMTP en el .env');
  }

  // En desarrollo sin .env usamos Ethereal: un buzón de mentiritas donde los correos llegan de verdad
  const cuenta = await nodemailer.createTestAccount();
  console.log(`[correo] Sin SMTP en el .env: usando el buzón de prueba de Ethereal (${cuenta.user})`);
  return {
    transportador: nodemailer.createTransport({
      host: cuenta.smtp.host,
      port: cuenta.smtp.port,
      secure: cuenta.smtp.secure,
      auth: { user: cuenta.user, pass: cuenta.pass },
    }),
    remitente: cuenta.user,
    destino: cuenta.user,
    esPrueba: true,
  };
}

function obtenerCartero(): Promise<Cartero> {
  // Si falla (ej. sin internet pa' crear la cuenta de prueba), no lo guardamos y se reintenta la próxima vez
  cartero ??= crearCartero().catch((error: unknown) => {
    cartero = null;
    throw error;
  });
  return cartero;
}

// Nada de meter HTML del usuario crudo en el correo
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function enviarCorreoContacto(mensaje: MensajeContacto): Promise<void> {
  const proyecto = mensaje.proyecto ? NOMBRES_PROYECTO[mensaje.proyecto] : 'Sin especificar';
  const filas: [string, string][] = [
    ['Proyecto', proyecto],
    ['Nombre', mensaje.nombre],
    ['Correo', mensaje.correo],
    ['Celular', mensaje.celular || 'No lo dejó'],
    ['Motivo', mensaje.motivo],
  ];

  const { transportador, remitente, destino, esPrueba } = await obtenerCartero();
  const info = await transportador.sendMail({
    from: `"Portafolio AJ" <${remitente}>`,
    to: destino,
    replyTo: mensaje.correo,
    subject: `Nuevo contacto (${proyecto}) — ${mensaje.nombre}`,
    text: filas.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`).join('\n'),
    html: filas
      .map(([etiqueta, valor]) => `<p><strong>${etiqueta}:</strong> ${escaparHtml(valor)}</p>`)
      .join(''),
  });

  if (esPrueba) {
    console.log(`[correo] Mensaje de prueba enviado. Míralo aquí: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
