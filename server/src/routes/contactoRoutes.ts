import { Router } from 'express';
import { recibirContacto } from '../controllers/contactoController.js';
import { crearLimitadorContacto } from '../middlewares/limitador.js';

export function crearContactoRoutes() {
  const rutas = Router();
  rutas.post('/', crearLimitadorContacto(), recibirContacto);
  return rutas;
}
