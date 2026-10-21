import { z } from 'zod';

export const MAX_MOTIVO = 600;

// Mismas reglas que server/src/models/MensajeContacto.ts: si cambian una, cambien la otra
export const esquemaContacto = z.object({
  // Escoger el tipo de proyecto ayuda, pero no es obligatorio (así está en el v9)
  // (nullish porque un grupo de radios sin marcar llega como null)
  proyecto: z.enum(['pagina-web', 'landing', 'app-movil', 'otro']).nullish(),
  nombre: z.string().trim().min(3, 'Escribe tu nombre.').max(80),
  correo: z.email('Revisa el correo. Ejemplo: nombre@dominio.com').max(120),
  // Opcional: si lo escriben, que tenga entre 7 y 15 dígitos
  celular: z
    .string()
    .trim()
    .max(25)
    .refine((v) => v === '' || /^\d{7,15}$/.test(v.replace(/\D/g, '')), 'Escribe solo el número, con indicativo si es de otro país.')
    .optional(),
  motivo: z
    .string()
    .trim()
    .min(15, 'Cuéntanos un poco más sobre tu proyecto.')
    .max(MAX_MOTIVO, `Máximo ${MAX_MOTIVO} caracteres.`),
  sitioWeb: z.string().max(0).optional(),
});

export type DatosContacto = z.infer<typeof esquemaContacto>;

export const OPCIONES_PROYECTO: { id: NonNullable<DatosContacto['proyecto']>; texto: string }[] = [
  { id: 'pagina-web', texto: 'Página web' },
  { id: 'landing', texto: 'Landing' },
  { id: 'app-movil', texto: 'App móvil' },
  { id: 'otro', texto: 'Otro' },
];
