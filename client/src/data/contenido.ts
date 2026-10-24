import type { Bilingue } from '../i18n/textos';

export const ENLACES_NAV: { id: string; texto: Bilingue }[] = [
  { id: 'nosotros', texto: { es: 'Nosotros', en: 'About' } },
  { id: 'servicios', texto: { es: 'Servicios', en: 'Services' } },
  { id: 'proyectos', texto: { es: 'Proyectos', en: 'Projects' } },
  { id: 'proceso', texto: { es: 'Proceso', en: 'Process' } },
  { id: 'cotizador', texto: { es: 'Cotizar', en: 'Estimate' } },
];

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
    rol: { es: 'full stack · enfoque backend', en: 'full stack · backend focus' },
    tecnologias: ['Java', 'PHP', 'Laravel', 'MySQL', 'Python'],
  },
  {
    nombre: 'Eleira Alejandra Aristizabal',
    rol: { es: 'full stack · enfoque frontend y móvil', en: 'full stack · frontend & mobile focus' },
    tecnologias: ['JavaScript', 'Dart', 'Flutter', 'C#', 'SQL'],
  },
] as const;

export interface Servicio {
  id: 'web' | 'app' | 'api' | 'db';
  titulo: Bilingue;
  subtitulo: Bilingue;
  descripcion: Bilingue;
  incluye: Bilingue<string[]>;
  stack: string[];
  repositorio: string;
}

export const SERVICIOS: Servicio[] = [
  {
    id: 'web',
    titulo: { es: 'Aplicaciones web', en: 'Web applications' },
    subtitulo: { es: 'Tiendas, sistemas y paneles', en: 'Stores, systems and dashboards' },
    descripcion: {
      es: 'Sistemas a medida, tiendas en línea y paneles administrativos que crecen con tu negocio.',
      en: 'Custom systems, online stores and admin dashboards that grow with your business.',
    },
    incluye: {
      es: ['Panel de administración', 'Pagos en línea', 'Diseño adaptable a celular'],
      en: ['Admin dashboard', 'Online payments', 'Mobile-friendly design'],
    },
    stack: ['Laravel', 'PHP', 'JavaScript'],
    repositorio: ENLACE_GITHUB,
  },
  {
    id: 'app',
    titulo: { es: 'Apps móviles', en: 'Mobile apps' },
    subtitulo: { es: 'Android e iOS con un solo código', en: 'Android and iOS from one codebase' },
    descripcion: {
      es: 'Una sola base de código para Android e iOS, con notificaciones y funcionamiento sin conexión.',
      en: 'A single codebase for Android and iOS, with notifications and offline support.',
    },
    incluye: {
      es: ['Publicación en Play Store y App Store', 'Notificaciones push', 'Modo sin conexión'],
      en: ['Publishing on Play Store and App Store', 'Push notifications', 'Offline mode'],
    },
    stack: ['Flutter', 'Dart'],
    repositorio: ENLACE_GITHUB,
  },
  {
    id: 'api',
    titulo: { es: 'Backend y APIs', en: 'Backend & APIs' },
    subtitulo: { es: 'Servicios REST e integraciones', en: 'REST services and integrations' },
    descripcion: {
      es: 'Servicios REST seguros y documentados que conectan tu app con pagos, correo y otros sistemas.',
      en: 'Secure, documented REST services that connect your app with payments, email and other systems.',
    },
    incluye: {
      es: ['Autenticación y permisos', 'Documentación de cada endpoint', 'Integración con pasarelas de pago'],
      en: ['Authentication and permissions', 'Documentation for every endpoint', 'Payment gateway integration'],
    },
    stack: ['Java', 'Python', 'C#'],
    repositorio: ENLACE_GITHUB,
  },
  {
    id: 'db',
    titulo: { es: 'Bases de datos', en: 'Databases' },
    subtitulo: { es: 'Modelado y rendimiento', en: 'Modeling and performance' },
    descripcion: {
      es: 'Modelado de datos, consultas optimizadas, migraciones y respaldos automáticos.',
      en: 'Data modeling, optimized queries, migrations and automatic backups.',
    },
    incluye: {
      es: ['Modelado y normalización', 'Consultas rápidas', 'Respaldos automáticos'],
      en: ['Modeling and normalization', 'Fast queries', 'Automatic backups'],
    },
    stack: ['SQL', 'MySQL'],
    repositorio: ENLACE_GITHUB,
  },
];

export type CategoriaProyecto = 'web' | 'landing' | 'app';
export type MaquetaProyecto = 'tienda' | 'barras' | 'landing' | 'dividida' | 'celular' | 'escaner';

export interface Proyecto {
  id: number;
  titulo: Bilingue;
  categoria: CategoriaProyecto;
  maqueta: MaquetaProyecto;
  descripcion: Bilingue;
  para: Bilingue;
  resultado: Bilingue;
  stack: string[];
}

export const CATEGORIAS_PROYECTO: { id: CategoriaProyecto | 'todos'; texto: Bilingue }[] = [
  { id: 'todos', texto: { es: 'Todos', en: 'All' } },
  { id: 'web', texto: { es: 'Páginas web', en: 'Websites' } },
  { id: 'landing', texto: { es: 'Landings', en: 'Landing pages' } },
  { id: 'app', texto: { es: 'Apps', en: 'Apps' } },
];

export const NOMBRE_CATEGORIA: Record<CategoriaProyecto, Bilingue> = {
  web: { es: 'Página web', en: 'Website' },
  landing: { es: 'Landing', en: 'Landing page' },
  app: { es: 'App', en: 'App' },
};

// Proyectos de ejemplo del v9. Cámbienlos por los reales cuando los tengan.
export const PROYECTOS: Proyecto[] = [
  {
    id: 1,
    titulo: { es: 'Tienda online de ropa', en: 'Online clothing store' },
    categoria: 'web',
    maqueta: 'tienda',
    descripcion: {
      es: 'Catálogo con filtros por talla y color, carrito, pagos en línea y panel para gestionar pedidos.',
      en: 'Catalog with size and color filters, cart, online payments and a dashboard to manage orders.',
    },
    para: {
      es: 'Marcas de ropa que hoy venden por redes sociales',
      en: 'Clothing brands that currently sell through social media',
    },
    resultado: {
      es: 'Ventas abiertas las 24 horas y pedidos en un solo lugar',
      en: 'Sales open 24/7 and every order in one place',
    },
    stack: ['PHP', 'Laravel', 'MySQL'],
  },
  {
    id: 2,
    titulo: { es: 'Panel de métricas', en: 'Metrics dashboard' },
    categoria: 'web',
    maqueta: 'barras',
    descripcion: {
      es: 'Reúne ventas y tráfico de varias fuentes en gráficos claros que se actualizan cada día.',
      en: 'Brings sales and traffic from several sources together in clear charts that update every day.',
    },
    para: {
      es: 'Negocios con datos repartidos en hojas y sistemas',
      en: 'Businesses with data scattered across spreadsheets and systems',
    },
    resultado: {
      es: 'Decisiones con números del día, sin armar reportes a mano',
      en: "Decisions based on today's numbers, without building reports by hand",
    },
    stack: ['JavaScript', 'Python', 'SQL'],
  },
  {
    id: 3,
    titulo: { es: 'Lanzamiento de curso', en: 'Course launch' },
    categoria: 'landing',
    maqueta: 'landing',
    descripcion: {
      es: 'Página de una sola sección con temario, testimonios y registro rápido para la preventa.',
      en: 'Single-section page with syllabus, testimonials and quick sign-up for the presale.',
    },
    para: {
      es: 'Creadores que lanzan un curso o evento',
      en: 'Creators launching a course or event',
    },
    resultado: {
      es: 'Más visitas convertidas en inscritos durante la campaña',
      en: 'More visitors turned into sign-ups during the campaign',
    },
    stack: ['JavaScript', 'PHP'],
  },
  {
    id: 4,
    titulo: { es: 'Proyecto inmobiliario', en: 'Real estate project' },
    categoria: 'landing',
    maqueta: 'dividida',
    descripcion: {
      es: 'Galería, planos y formulario que envía cada contacto directo al asesor de ventas.',
      en: 'Gallery, floor plans and a form that sends every lead straight to the sales agent.',
    },
    para: {
      es: 'Constructoras con proyectos en preventa',
      en: 'Builders with projects in presale',
    },
    resultado: {
      es: 'Contactos organizados y atendidos el mismo día',
      en: 'Leads organized and followed up the same day',
    },
    stack: ['Laravel', 'MySQL', 'JavaScript'],
  },
  {
    id: 5,
    titulo: { es: 'Agenda de citas', en: 'Appointment booking' },
    categoria: 'app',
    maqueta: 'celular',
    descripcion: {
      es: 'App para reservar y recordar citas, con un panel web donde el negocio gestiona horarios.',
      en: 'App to book appointments and get reminders, with a web dashboard where the business manages its schedule.',
    },
    para: {
      es: 'Consultorios, barberías y spas',
      en: 'Clinics, barbershops and spas',
    },
    resultado: {
      es: 'Menos citas perdidas gracias a recordatorios automáticos',
      en: 'Fewer missed appointments thanks to automatic reminders',
    },
    stack: ['Flutter', 'Dart', 'Python'],
  },
  {
    id: 6,
    titulo: { es: 'Inventario móvil', en: 'Mobile inventory' },
    categoria: 'app',
    maqueta: 'escaner',
    descripcion: {
      es: 'Conteo de productos escaneando el código de barras con el celular, sincronizado entre sedes.',
      en: 'Count products by scanning barcodes with your phone, synced across locations.',
    },
    para: {
      es: 'Tiendas y bodegas con varias sedes',
      en: 'Stores and warehouses with several locations',
    },
    resultado: {
      es: 'Inventario al día sin hojas de cálculo',
      en: 'Up-to-date inventory without spreadsheets',
    },
    stack: ['Flutter', 'Java', 'MySQL'],
  },
];

// Las etapas como commits de git, del más viejo al más nuevo
export const ETAPAS_PROCESO: { hash: string; titulo: Bilingue; descripcion: Bilingue }[] = [
  {
    hash: '3c9e1a2',
    titulo: { es: 'Análisis', en: 'Analysis' },
    descripcion: {
      es: 'Hablamos de tu negocio y definimos objetivos, alcance, tiempos y presupuesto por escrito.',
      en: 'We talk about your business and put goals, scope, timeline and budget in writing.',
    },
  },
  {
    hash: '7f2b8d4',
    titulo: { es: 'Planeación', en: 'Planning' },
    descripcion: {
      es: 'Prototipo navegable de las pantallas y modelo de datos, aprobados antes de escribir código.',
      en: 'A clickable prototype of the screens and the data model, approved before writing any code.',
    },
  },
  {
    hash: 'a41e6f0',
    titulo: { es: 'Desarrollo', en: 'Development' },
    descripcion: {
      es: 'Entregas por etapas en un entorno de pruebas, para que veas avances reales y des feedback temprano.',
      en: 'Staged deliveries in a test environment, so you see real progress and give feedback early.',
    },
  },
  {
    hash: 'e98d3c7',
    titulo: { es: 'Deployment', en: 'Deployment' },
    descripcion: {
      es: 'Publicamos, configuramos dominio y servidor, y acompañamos los primeros ajustes en producción.',
      en: 'We go live, set up the domain and server, and stay with you through the first tweaks in production.',
    },
  },
];
