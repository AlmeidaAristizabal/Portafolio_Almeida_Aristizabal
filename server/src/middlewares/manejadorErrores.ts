import type { NextFunction, Request, Response } from 'express';

export function rutaNoEncontrada(_req: Request, res: Response) {
  res.status(404).json({ ok: false, mensaje: 'Esa ruta no existe' });
}

// Express reconoce este middleware como manejador de errores por tener 4 parámetros
export function manejadorErrores(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[error]', error);
  res.status(500).json({ ok: false, mensaje: 'No pudimos enviar tu mensaje. Intenta más tarde.' });
}
