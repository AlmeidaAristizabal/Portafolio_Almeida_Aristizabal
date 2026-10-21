// ⚠️ Valores de referencia del v9: ajústenlos a su tarifa real
export const TARIFA_USD_HORA: [number, number] = [35, 45];
export const COP_POR_USD = 3210;
export const FECHA_TASA = '6 oct. 2026';
export const HORAS_POR_SEMANA = 30;

export type TipoContacto = 'pagina-web' | 'landing' | 'app-movil' | 'otro';

export interface TipoCotizador {
  id: string;
  nombre: string;
  descripcion: string;
  tipoContacto: TipoContacto;
  // Horas de referencia por tarea: solo se usan pa' calcular el rango, no se muestran
  incluye: [tarea: string, horas: number][];
}

export const TIPOS_COTIZADOR: TipoCotizador[] = [
  {
    id: 'landing',
    nombre: 'Landing page',
    descripcion: 'Una página, un objetivo claro.',
    tipoContacto: 'landing',
    incluye: [['Diseño y maquetación de la página', 18], ['Formulario de contacto', 6], ['SEO básico y publicación', 6]],
  },
  {
    id: 'corporativo',
    nombre: 'Sitio corporativo',
    descripcion: 'Varias páginas para presentar tu empresa.',
    tipoContacto: 'pagina-web',
    incluye: [['Diseño y maquetación (5 páginas)', 42], ['Panel administrable (CMS)', 20], ['SEO básico y publicación', 10]],
  },
  {
    id: 'tienda',
    nombre: 'Tienda online',
    descripcion: 'Catálogo, carrito, pagos y envíos.',
    tipoContacto: 'pagina-web',
    incluye: [['Catálogo y carrito', 60], ['Pagos en línea', 24], ['Panel de pedidos', 24], ['Pruebas y publicación', 12]],
  },
  {
    id: 'appweb',
    nombre: 'App web a medida',
    descripcion: 'Paneles, portales y herramientas internas.',
    tipoContacto: 'pagina-web',
    incluye: [['Diseño de pantallas', 40], ['Desarrollo de módulos', 90], ['Inicio de sesión y permisos', 20], ['Pruebas y publicación', 20]],
  },
  {
    id: 'movil',
    nombre: 'App móvil',
    descripcion: 'Android e iOS con un solo código.',
    tipoContacto: 'app-movil',
    incluye: [['Diseño de pantallas', 40], ['Desarrollo Android e iOS', 100], ['Inicio de sesión', 20], ['Publicación en tiendas', 20]],
  },
  {
    id: 'api',
    nombre: 'Backend o API',
    descripcion: 'Servicios e integraciones para otra app.',
    tipoContacto: 'otro',
    incluye: [['Diseño de la base de datos', 20], ['Endpoints y lógica de negocio', 50], ['Autenticación', 14], ['Documentación y pruebas', 16]],
  },
];

export const TIPO_POR_DEFECTO = 'corporativo';
