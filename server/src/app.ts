import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/manejadorErrores.js';
import { crearContactoRoutes } from './routes/contactoRoutes.js';

export function crearApp() {
  const app = express();

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
