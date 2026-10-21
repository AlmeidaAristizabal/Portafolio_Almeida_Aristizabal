import { rateLimit } from 'express-rate-limit';

// 5 mensajes cada 15 minutos por IP: suficiente pa' un humano, poquito pa' un bot.
// Es una fábrica pa' que cada app (y cada prueba) tenga su propio contador.
export function crearLimitadorContacto() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { ok: false, mensaje: 'Muchos mensajes seguidos. Intenta de nuevo en un rato.' },
  });
}
