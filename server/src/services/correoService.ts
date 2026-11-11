import nodemailer, { type Transporter } from 'nodemailer';
import { NOMBRES_PROYECTO, type MensajeContacto } from '../models/MensajeContacto.js';

// real: SMTP del .env · ethereal: buzón de prueba en internet · consola: el correo se imprime y ya
type ModoCorreo = 'real' | 'ethereal' | 'consola';

interface Cartero {
  transportador: Transporter;
  remitente: string;
  destino: string;
  modo: ModoCorreo;
}

let cartero: Promise<Cartero> | null = null;

// El front se rinde a los 10 s: Ethereal tiene que contestar antes o lo dejamos plantado
export const LIMITE_ETHEREAL_MS = 5_000;

function conLimite<T>(promesa: Promise<T>, ms: number): Promise<T> {
  let reloj: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, rechazar) => {
    reloj = setTimeout(() => rechazar(new Error(`No contestó en ${ms} ms`)), ms);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(reloj));
}

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
      modo: 'real',
    };
  }

  // En producción sin SMTP no hay trampa: que falle y se note
  if (NODE_ENV === 'production') {
    throw new Error('Faltan las variables SMTP en el .env');
  }

  // En desarrollo sin .env usamos Ethereal: un buzón de mentiritas donde los correos llegan de verdad
  try {
    const cuenta = await conLimite(nodemailer.createTestAccount(), LIMITE_ETHEREAL_MS);
    console.log(`[correo] Sin SMTP en el .env: usando el buzón de prueba de Ethereal (${cuenta.user})`);
    return {
      transportador: nodemailer.createTransport({
        host: cuenta.smtp.host,
        port: cuenta.smtp.port,
        secure: cuenta.smtp.secure,
        auth: { user: cuenta.user, pass: cuenta.pass },
        // Si el SMTP de Ethereal también se hace el muerto, que no nos deje colgados 2 minutos
        connectionTimeout: LIMITE_ETHEREAL_MS,
      }),
      remitente: cuenta.user,
      destino: cuenta.user,
      modo: 'ethereal',
    };
  } catch (error) {
    // Ethereal caído o bloqueado: el correo se imprime en la consola y el formulario sigue vivo
    console.warn(`[correo] Ethereal no contesta (${(error as Error).message}): los mensajes se van a imprimir aquí en la consola`);
    return {
      transportador: nodemailer.createTransport({ jsonTransport: true }),
      remitente: 'portafolio@localhost',
      destino: 'portafolio@localhost',
      modo: 'consola',
    };
  }
}

function obtenerCartero(): Promise<Cartero> {
  // Si falla (ej. sin internet pa' crear la cuenta de prueba), no lo guardamos y se reintenta la próxima vez
  cartero ??= crearCartero().then(
    (nuevo) => {
      // La consola es un salvavidas, no un trabajo fijo: al siguiente correo se le vuelve a tocar la puerta a Ethereal
      if (nuevo.modo === 'consola') cartero = null;
      return nuevo;
    },
    (error: unknown) => {
      cartero = null;
      throw error;
    },
  );
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

  const asunto = `Nuevo contacto (${proyecto}) — ${mensaje.nombre}`;
  const texto = filas.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`).join('\n');

  const { transportador, remitente, destino, modo } = await obtenerCartero();
  const info = await transportador.sendMail({
    from: `"Portafolio AJ" <${remitente}>`,
    to: destino,
    replyTo: mensaje.correo,
    subject: asunto,
    text: texto,
    html: filas
      .map(([etiqueta, valor]) => `<p><strong>${etiqueta}:</strong> ${escaparHtml(valor)}</p>`)
      .join(''),
  });

  if (modo === 'ethereal') {
    console.log(`[correo] Mensaje de prueba enviado. Míralo aquí: ${nodemailer.getTestMessageUrl(info)}`);
  } else if (modo === 'consola') {
    console.log(`[correo] ${asunto}\n${texto}`);
  }
}
