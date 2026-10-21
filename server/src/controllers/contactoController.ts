import type { NextFunction, Request, Response } from 'express';
import { esquemaMensajeContacto } from '../models/MensajeContacto.js';
import { enviarCorreoContacto } from '../services/correoService.js';

const RESPUESTA_EXITO = { ok: true, mensaje: '¡Listo! Te respondemos pronto.' };

export async function recibirContacto(req: Request, res: Response, next: NextFunction) {
  // El bot cayó en la trampa: le decimos que sí... y su mensaje se va pa' la papelera
  if (typeof req.body?.sitioWeb === 'string' && req.body.sitioWeb !== '') {
    return res.status(201).json(RESPUESTA_EXITO);
  }

  const resultado = esquemaMensajeContacto.safeParse(req.body);

  if (!resultado.success) {
    // Devolvemos los errores por campo pa' que el formulario los pinte debajo de cada caja
    const errores: Record<string, string> = {};
    for (const problema of resultado.error.issues) {
      const campo = String(problema.path[0] ?? 'general');
      errores[campo] ??= problema.message;
    }
    return res.status(400).json({ ok: false, errores });
  }

  try {
    await enviarCorreoContacto(resultado.data);
    return res.status(201).json(RESPUESTA_EXITO);
  } catch (error) {
    return next(error);
  }
}
