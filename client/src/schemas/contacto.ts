import { z } from 'zod';
import type { Bilingue } from '../i18n/textos';

export const MAX_MOTIVO = 600;

// Mismas reglas que server/src/models/MensajeContacto.ts: si cambian una, cambien la otra.
// Ojo: TipoContacto (data/cotizador.ts) sale de aquí, así que el enum de proyecto manda.
// Los mensajes son claves: el texto en cada idioma está en i18n/textos.ts (errores)
export const esquemaContacto = z.object({
  // Escoger el tipo de proyecto ayuda, pero no es obligatorio (así está en el v9)
  // (nullish porque un grupo de radios sin marcar llega como null)
  proyecto: z.enum(['pagina-web', 'landing', 'app-movil', 'otro']).nullish(),
  nombre: z.string().trim().min(3, 'nombre').max(80),
  correo: z.email('correo').max(120),
  // Opcional: si lo escriben, que tenga entre 7 y 15 dígitos
  celular: z
    .string()
    .trim()
    .max(25)
    .refine((v) => v === '' || /^\d{7,15}$/.test(v.replace(/\D/g, '')), 'celular')
    .optional(),
  motivo: z
    .string()
    .trim()
    .min(15, 'motivo-corto')
    .max(MAX_MOTIVO, 'motivo-largo'),
  sitioWeb: z.string().max(0).optional(),
});

export type DatosContacto = z.infer<typeof esquemaContacto>;

export const OPCIONES_PROYECTO: { id: NonNullable<DatosContacto['proyecto']>; texto: Bilingue }[] = [
  { id: 'pagina-web', texto: { es: 'Página web', en: 'Website' } },
  { id: 'landing', texto: { es: 'Landing', en: 'Landing page' } },
  { id: 'app-movil', texto: { es: 'App móvil', en: 'Mobile app' } },
  { id: 'otro', texto: { es: 'Otro', en: 'Other' } },
];
