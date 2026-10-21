import 'dotenv/config';
import { crearApp } from './app.js';

const puerto = Number(process.env.PUERTO ?? 3001);

crearApp().listen(puerto, () => {
  console.log(`API de AJ escuchando en http://localhost:${puerto}`);
});
