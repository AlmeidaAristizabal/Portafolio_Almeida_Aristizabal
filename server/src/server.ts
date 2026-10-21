import 'dotenv/config';
import { crearApp } from './app.js';

// En producción sin SMTP mejor morir en el deploy que en la cara del primer cliente
const faltan = ['SMTP_HOST', 'SMTP_USUARIO', 'SMTP_CLAVE'].filter((variable) => !process.env[variable]);
if (process.env.NODE_ENV === 'production' && faltan.length > 0) {
  console.error(`[arranque] Faltan variables en el .env: ${faltan.join(', ')}`);
  process.exit(1);
}

const puerto = Number(process.env.PUERTO ?? 3001);

crearApp().listen(puerto, () => {
  console.log(`API de AJ escuchando en http://localhost:${puerto}`);
});
