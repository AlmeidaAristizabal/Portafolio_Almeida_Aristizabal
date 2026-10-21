import { z } from 'zod';

// Lo que el cliente puede escoger en los chips de "Proyecto"
export const TIPOS_PROYECTO = ['pagina-web', 'landing', 'app-movil', 'otro'] as const;
export const MAX_MOTIVO = 600;

// El "modelo" de este proyecto no vive en una base de datos: vive aquí,
// como un esquema que dice qué es un mensaje de contacto válido.
export const esquemaMensajeContacto = z.object({
  // Opcional (nullish porque un grupo de radios sin marcar llega como null)
  proyecto: z.enum(TIPOS_PROYECTO, { message: 'Ese tipo de proyecto no existe' }).nullish(),
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
  // Trampa pa' bots: un humano nunca ve ni llena este campo
  sitioWeb: z.string().max(0).optional(),
});

export type MensajeContacto = z.infer<typeof esquemaMensajeContacto>;

export const NOMBRES_PROYECTO: Record<(typeof TIPOS_PROYECTO)[number], string> = {
  'pagina-web': 'Página web',
  landing: 'Landing',
  'app-movil': 'App móvil',
  otro: 'Otro',
};
