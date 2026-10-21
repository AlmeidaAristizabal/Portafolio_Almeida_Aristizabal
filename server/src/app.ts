import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/manejadorErrores.js';
import { crearContactoRoutes } from './routes/contactoRoutes.js';

export function crearApp() {
  const app = express();

  // Detrás de un proxy (Render, Railway...) todas las peticiones llegan con la IP del proxy:
  // sin esto el limitador castiga a todo el mundo junto. Solo confiamos en los saltos que digan
  const saltosProxy = Number(process.env.SALTOS_PROXY ?? 0);
  if (saltosProxy > 0) app.set('trust proxy', saltosProxy);

  app.use(helmet());
  app.use(cors({ origin: process.env.ORIGEN_PERMITIDO ?? 'http://localhost:5173' }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/salud', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api/contacto', crearContactoRoutes());

  app.use(rutaNoEncontrada);
  app.use(manejadorErrores);

  return app;
}
