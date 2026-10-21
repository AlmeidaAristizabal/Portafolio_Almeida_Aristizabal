export const ENLACES_NAV = [
  { id: 'nosotros', texto: 'Nosotros' },
  { id: 'servicios', texto: 'Servicios' },
  { id: 'proyectos', texto: 'Proyectos' },
  { id: 'proceso', texto: 'Proceso' },
  { id: 'cotizador', texto: 'Cotizar' },
] as const;

// ⚠️ Datos de contacto y enlaces de relleno (así vienen en el v9): cámbienlos por los reales
export const CORREO_CONTACTO = 'hola@tudominio.dev';
export const ENLACE_GITHUB = 'https://github.com/';
export const ENLACE_LINKEDIN = 'https://www.linkedin.com/';
// Cuando tengan los PDF, pongan la ruta aquí (ej. '/cv/cv-juan-pablo.pdf') y el botón empieza a descargar
export const CV_JUAN: string | null = null;
export const CV_ELEIRA: string | null = null;

export const TECNOLOGIAS_CINTA = [
  'JavaScript', 'SQL', 'MySQL', 'Java', 'C#', 'PHP', 'Laravel', 'Git', 'Bash', 'Dart', 'Flutter', 'Python',
];

// Las burbujas de la órbita: ángulo en la pista y orden (k) en que regresan después de la explosión
export const ORBITA_EXTERNA = [
  { nombre: 'C#', angulo: -135, k: 0 },
  { nombre: 'Dart', angulo: -45, k: 2 },
  { nombre: 'Python', angulo: 45, k: 4 },
  { nombre: 'PHP', angulo: 135, k: 6 },
];
export const ORBITA_INTERNA = [
  { nombre: 'Java', angulo: -90, k: 1 },
  { nombre: 'MySQL', angulo: 0, k: 3 },
  { nombre: 'Git', angulo: 90, k: 5 },
  { nombre: 'JS', angulo: 180, k: 7 },
];

export const PERSONAS = [
  {
    nombre: 'Juan Pablo Almeida',
    rol: 'full stack · enfoque backend',
    tecnologias: ['Java', 'PHP', 'Laravel', 'MySQL', 'Python'],
  },
  {
    nombre: 'Eleira Alejandra Aristizabal',
    rol: 'full stack · enfoque frontend y móvil',
    tecnologias: ['JavaScript', 'Dart', 'Flutter', 'C#', 'SQL'],
  },
] as const;

export interface Servicio {
  id: 'web' | 'app' | 'api' | 'db';
  titulo: string;
  subtitulo: string;
  descripcion: string;
  incluye: string[];
  stack: string[];
  repositorio: string;
}

export const SERVICIOS: Servicio[] = [
  {
    id: 'web',
    titulo: 'Aplicaciones web',
    subtitulo: 'Tiendas, sistemas y paneles',
    descripcion: 'Sistemas a medida, tiendas en línea y paneles administrativos que crecen con tu negocio.',
    incluye: ['Panel de administración', 'Pagos en línea', 'Diseño adaptable a celular'],
    stack: ['Laravel', 'PHP', 'JavaScript'],
    repositorio: ENLACE_GITHUB,
  },
  {
    id: 'app',
    titulo: 'Apps móviles',
    subtitulo: 'Android e iOS con un solo código',
    descripcion: 'Una sola base de código para Android e iOS, con notificaciones y funcionamiento sin conexión.',
    incluye: ['Publicación en Play Store y App Store', 'Notificaciones push', 'Modo sin conexión'],
    stack: ['Flutter', 'Dart'],
    repositorio: ENLACE_GITHUB,
  },
  {
    id: 'api',
    titulo: 'Backend y APIs',
    subtitulo: 'Servicios REST e integraciones',
    descripcion: 'Servicios REST seguros y documentados que conectan tu app con pagos, correo y otros sistemas.',
    incluye: ['Autenticación y permisos', 'Documentación de cada endpoint', 'Integración con pasarelas de pago'],
    stack: ['Java', 'Python', 'C#'],
    repositorio: ENLACE_GITHUB,
  },
  {
    id: 'db',
    titulo: 'Bases de datos',
    subtitulo: 'Modelado y rendimiento',
    descripcion: 'Modelado de datos, consultas optimizadas, migraciones y respaldos automáticos.',
    incluye: ['Modelado y normalización', 'Consultas rápidas', 'Respaldos automáticos'],
    stack: ['SQL', 'MySQL'],
    repositorio: ENLACE_GITHUB,
  },
];

export type CategoriaProyecto = 'web' | 'landing' | 'app';
export type MaquetaProyecto = 'tienda' | 'barras' | 'landing' | 'dividida' | 'celular' | 'escaner';

export interface Proyecto {
  id: number;
  titulo: string;
  categoria: CategoriaProyecto;
  maqueta: MaquetaProyecto;
  descripcion: string;
  para: string;
  resultado: string;
  stack: string[];
}

export const CATEGORIAS_PROYECTO: { id: CategoriaProyecto | 'todos'; texto: string }[] = [
  { id: 'todos', texto: 'Todos' },
  { id: 'web', texto: 'Páginas web' },
  { id: 'landing', texto: 'Landings' },
  { id: 'app', texto: 'Apps' },
];

export const NOMBRE_CATEGORIA: Record<CategoriaProyecto, string> = {
  web: 'Página web',
  landing: 'Landing',
  app: 'App',
};

// Proyectos de ejemplo del v9. Cámbienlos por los reales cuando los tengan.
export const PROYECTOS: Proyecto[] = [
  {
    id: 1,
    titulo: 'Tienda online de ropa',
    categoria: 'web',
    maqueta: 'tienda',
    descripcion: 'Catálogo con filtros por talla y color, carrito, pagos en línea y panel para gestionar pedidos.',
    para: 'Marcas de ropa que hoy venden por redes sociales',
    resultado: 'Ventas abiertas las 24 horas y pedidos en un solo lugar',
    stack: ['PHP', 'Laravel', 'MySQL'],
  },
  {
    id: 2,
    titulo: 'Panel de métricas',
    categoria: 'web',
    maqueta: 'barras',
    descripcion: 'Reúne ventas y tráfico de varias fuentes en gráficos claros que se actualizan cada día.',
    para: 'Negocios con datos repartidos en hojas y sistemas',
    resultado: 'Decisiones con números del día, sin armar reportes a mano',
    stack: ['JavaScript', 'Python', 'SQL'],
  },
  {
    id: 3,
    titulo: 'Lanzamiento de curso',
    categoria: 'landing',
    maqueta: 'landing',
    descripcion: 'Página de una sola sección con temario, testimonios y registro rápido para la preventa.',
    para: 'Creadores que lanzan un curso o evento',
    resultado: 'Más visitas convertidas en inscritos durante la campaña',
    stack: ['JavaScript', 'PHP'],
  },
  {
    id: 4,
    titulo: 'Proyecto inmobiliario',
    categoria: 'landing',
    maqueta: 'dividida',
    descripcion: 'Galería, planos y formulario que envía cada contacto directo al asesor de ventas.',
    para: 'Constructoras con proyectos en preventa',
    resultado: 'Contactos organizados y atendidos el mismo día',
    stack: ['Laravel', 'MySQL', 'JavaScript'],
  },
  {
    id: 5,
    titulo: 'Agenda de citas',
    categoria: 'app',
    maqueta: 'celular',
    descripcion: 'App para reservar y recordar citas, con un panel web donde el negocio gestiona horarios.',
    para: 'Consultorios, barberías y spas',
    resultado: 'Menos citas perdidas gracias a recordatorios automáticos',
    stack: ['Flutter', 'Dart', 'Python'],
  },
  {
    id: 6,
    titulo: 'Inventario móvil',
    categoria: 'app',
    maqueta: 'escaner',
    descripcion: 'Conteo de productos escaneando el código de barras con el celular, sincronizado entre sedes.',
    para: 'Tiendas y bodegas con varias sedes',
    resultado: 'Inventario al día sin hojas de cálculo',
    stack: ['Flutter', 'Java', 'MySQL'],
  },
];

// Las etapas como commits de git, del más viejo al más nuevo
export const ETAPAS_PROCESO = [
  { hash: '3c9e1a2', titulo: 'Análisis', descripcion: 'Hablamos de tu negocio y definimos objetivos, alcance, tiempos y presupuesto por escrito.' },
  { hash: '7f2b8d4', titulo: 'Planeación', descripcion: 'Prototipo navegable de las pantallas y modelo de datos, aprobados antes de escribir código.' },
  { hash: 'a41e6f0', titulo: 'Desarrollo', descripcion: 'Entregas por etapas en un entorno de pruebas, para que veas avances reales y des feedback temprano.' },
  { hash: 'e98d3c7', titulo: 'Deployment', descripcion: 'Publicamos, configuramos dominio y servidor, y acompañamos los primeros ajustes en producción.' },
];
