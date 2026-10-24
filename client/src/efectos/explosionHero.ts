// Banner del hero (portado del HTML v9): el núcleo se carga → explota con rayos → los lenguajes
// salen volando hacia los bordes → el tema cambia de morado a azul → los rayos los jalan de vuelta.

export interface ElementosHero {
  hero: HTMLElement;
  orbita: HTMLElement;
  nucleo: HTMLElement;
  capa: HTMLElement;
  lienzo: HTMLCanvasElement;
  destello: HTMLElement;
  estado: HTMLElement;
  estadoTxt: HTMLElement;
  rol: HTMLElement;
  texto: HTMLElement;
  cinta: HTMLElement | null;
}

// Los letreritos de estado: se piden cada vez pa' que salgan en el idioma que esté puesto en ese momento
export interface EstadosHero {
  enLinea: string;
  carga: string[];
  deploy: string;
  recompilando: string;
  exito: string;
}

interface Punto { x: number; y: number }
interface Caja extends Punto { w: number; h: number }
interface Rayo { desde: () => Punto; hasta: () => Punto; color: string; vida: number; ancho: number; nacio: number }
interface Volador { el: HTMLDivElement; x0: number; y0: number; extra: boolean; tx: number; ty: number; r: number; s: number }

const EXTRA = ['Laravel', 'Flutter', 'SQL', 'Bash'];
// Después de estas, solo explota si le dan clic: la gente vino a contratar, no a ver Rápidos y Furiosos
const MAX_AUTOMATICAS = 2;

export function iniciarExplosionHero(el: ElementosHero, onCambiarTema: () => void, estados: () => EstadosHero): () => void {
  const { hero, orbita, nucleo, capa, lienzo, destello, estado, estadoTxt, rol, texto, cinta } = el;
  const ctx = lienzo.getContext('2d');
  if (!ctx || !Element.prototype.animate) return () => {};

  const css = getComputedStyle(document.documentElement);
  const COL = { blanco: '#FFFFFF', a: css.getPropertyValue('--color-pu-200').trim(), b: css.getPropertyValue('--color-bl-200').trim() };

  let fase: 'quieto' | 'carga' | 'explosion' | 'jalando' = 'quieto';
  let temaAzul = false;
  let heroVisible = true;
  let W = 0, H = 0;
  let C: Punto = { x: 0, y: 0 };
  let voladores: Volador[] = [];
  let rayos: Rayo[] = [];
  let pintando = false;
  let vivo = true;
  let siguiente: number | undefined;
  let automaticas = 0;
  const relojes = new Set<number>();

  // setTimeout con memoria: al desmontar se cancelan todos de una
  function luego(fn: () => void, ms: number) {
    const id = window.setTimeout(() => { relojes.delete(id); if (vivo) fn(); }, ms);
    relojes.add(id);
  }

  function ponerEstado(t: string) {
    estado.classList.add('cambiando');
    luego(() => { estadoTxt.textContent = t; estado.classList.remove('cambiando'); }, 170);
  }
  function rel(r: DOMRect): Caja {
    const h = hero.getBoundingClientRect();
    return { x: r.left - h.left + r.width / 2, y: r.top - h.top + r.height / 2, w: r.width, h: r.height };
  }
  function medirLienzo() {
    W = hero.clientWidth; H = hero.clientHeight;
    // En pantallas chiquitas pintamos a 1x: el celular de gama media también merece vivir
    const dpr = W < 768 ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const tf = (x: number, y: number, s: number, r: number) => `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`;

  // ---------- Rayos en canvas ----------
  // Parte la línea en pedacitos y los mueve al azar: así sale el zigzag del rayo
  function zigzag(p1: Punto, p2: Punto, aspereza: number): Punto[] {
    let pts = [p1, p2];
    let desv = Math.hypot(p2.x - p1.x, p2.y - p1.y) * aspereza;
    for (let g = 0; g < 6; g++) {
      const np = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, off = (Math.random() - 0.5) * desv;
        np.push({ x: (a.x + b.x) / 2 - (dy / len) * off, y: (a.y + b.y) / 2 + (dx / len) * off }, b);
      }
      pts = np; desv *= 0.55;
    }
    return pts;
  }
  function trazar(pts: Punto[], color: string, ancho: number, alfa: number) {
    const c = ctx!;
    c.globalAlpha = Math.max(0, alfa);
    c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    // Halo con un trazo ancho y transparente: se ve parecido a shadowBlur y cuesta muchísimo menos
    c.strokeStyle = color; c.lineWidth = ancho * 4; c.globalAlpha = Math.max(0, alfa * 0.25); c.stroke();
    c.lineWidth = ancho; c.globalAlpha = Math.max(0, alfa); c.stroke();
    c.strokeStyle = '#FFFFFF'; c.lineWidth = Math.max(0.6, ancho * 0.4); c.stroke();
  }
  function dibujarRayo(p1: Punto, p2: Punto, color: string, ancho: number, alfa: number) {
    const pts = zigzag(p1, p2, 0.2);
    trazar(pts, color, ancho, alfa);
    // Dos ramitas que salen del rayo principal
    for (let k = 0; k < 2; k++) {
      const s = pts[4 + Math.floor(Math.random() * Math.max(1, pts.length - 8))];
      if (!s) continue;
      const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x) + (Math.random() - 0.5) * 1.6;
      const l = Math.hypot(p2.x - p1.x, p2.y - p1.y) * (0.15 + Math.random() * 0.2);
      trazar(zigzag(s, { x: s.x + Math.cos(ang) * l, y: s.y + Math.sin(ang) * l }, 0.25), color, ancho * 0.55, alfa * 0.8);
    }
  }
  function agregarRayo(desde: () => Punto, hasta: () => Punto, color: string, vida: number, ancho: number) {
    rayos.push({ desde, hasta, color, vida, ancho, nacio: performance.now() });
    if (!pintando) { pintando = true; requestAnimationFrame(cuadro); }
  }
  function cuadro(ahora: number) {
    const c = ctx!;
    c.clearRect(0, 0, W, H);
    if (!vivo) return;
    c.globalCompositeOperation = 'lighter';
    rayos = rayos.filter((b) => ahora - b.nacio < b.vida);
    for (const b of rayos) {
      const k = (ahora - b.nacio) / b.vida;
      const a = (k < 0.2 ? 1 : 1 - (k - 0.2) / 0.8) * (0.55 + Math.random() * 0.45);
      dibujarRayo(b.desde(), b.hasta(), b.color, b.ancho, a);
    }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    if (rayos.length) requestAnimationFrame(cuadro);
    else { pintando = false; c.clearRect(0, 0, W, H); }
  }
  const fijo = (p: Punto) => () => p;
  const seguir = (e: Element) => () => rel(e.getBoundingClientRect());

  // ---------- Piezas DOM de la explosión ----------
  function anilloExpansivo(x: number, y: number, tam: number, escala: number, dur: number) {
    const d = document.createElement('div');
    d.className = 'anillo-fx';
    d.style.cssText = `left:${x - tam / 2}px;top:${y - tam / 2}px;width:${tam}px;height:${tam}px`;
    capa.appendChild(d);
    d.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: `scale(${escala})`, opacity: 0 }], {
      duration: dur, easing: 'cubic-bezier(.2,.7,.3,1)',
    }).onfinish = () => d.remove();
  }
  function remolino(x: number, y: number, tam: number) {
    const s = tam * 1.5, d = document.createElement('div');
    d.className = 'remolino-fx';
    d.style.cssText = `left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px`;
    capa.appendChild(d);
    d.animate([
      { transform: 'scale(1.8) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1.15) rotate(120deg)', opacity: 1, offset: 0.35 },
      { transform: 'scale(.4) rotate(300deg)', opacity: 0 },
    ], { duration: 720, easing: 'ease-in' }).onfinish = () => d.remove();
  }
  function crearVolador(etiqueta: string, x: number, y: number, tam: number, letra: string, extra: boolean): Volador {
    const d = document.createElement('div');
    d.className = 'volador';
    d.textContent = etiqueta;
    d.style.cssText = `left:${x - tam / 2}px;top:${y - tam / 2}px;width:${tam}px;height:${tam}px;font-size:${letra}`;
    capa.appendChild(d);
    return { el: d, x0: x, y0: y, extra, tx: 0, ty: 0, r: 0, s: 1 };
  }

  // Los lenguajes salen hacia los bordes de la pantalla, sin tapar el texto ni la órbita
  function escogerDestinos(n: number, tam: number): Punto[] {
    const tr = rel(texto.getBoundingClientRect()), R = orbita.getBoundingClientRect().width / 2;
    const m = tam * 0.7, abajo = H - (cinta ? cinta.offsetHeight : 0) - m, out: Punto[] = [];
    const bordes: [number, () => Punto][] = [
      [0.38, () => ({ x: m + Math.random() * (W - 2 * m), y: m + Math.random() * tam * 1.2 })],
      [0.3, () => ({ x: m + Math.random() * (W - 2 * m), y: abajo - Math.random() * tam * 1.2 })],
      [0.22, () => ({ x: W - m - Math.random() * tam * 1.4, y: m + Math.random() * Math.max(1, abajo - m) })],
      [0.1, () => ({ x: m + Math.random() * tam * 0.6, y: m + Math.random() * Math.max(1, abajo - m) })],
    ];
    const candidato = () => {
      const r = Math.random();
      let acc = 0;
      for (const [peso, fn] of bordes) { acc += peso; if (r <= acc) return fn(); }
      return bordes[0][1]();
    };
    const libre = (p: Punto, separacion: number) => {
      const enTexto = Math.abs(p.x - tr.x) < tr.w / 2 + tam * 0.45 && Math.abs(p.y - tr.y) < tr.h / 2 + tam * 0.45;
      if (enTexto || Math.hypot(p.x - C.x, p.y - C.y) < R * 0.62) return false;
      return !out.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < tam * separacion);
    };
    for (let i = 0; i < n; i++) {
      let mejor: Punto | null = null;
      for (let t = 0; t < 400 && !mejor; t++) { const p = candidato(); if (libre(p, t < 250 ? 1.35 : 1.05)) mejor = p; }
      out.push(mejor ?? candidato());
    }
    return out;
  }

  // ---------- Fases ----------
  function cargar(dur: number) {
    fase = 'carga';
    orbita.style.setProperty('--carga', `${dur}ms`);
    orbita.classList.add('cargando');
    const mensajes = estados().carga, paso = dur / mensajes.length;
    mensajes.forEach((msg, i) => luego(() => ponerEstado(msg), i * paso));
    luego(explotar, dur);
  }
  function explotar() {
    fase = 'explosion';
    medirLienzo();
    const c = rel(nucleo.getBoundingClientRect());
    C = { x: c.x, y: c.y };
    const burbujas = Array.from(orbita.querySelectorAll<HTMLElement>('.burbuja'));
    const tam = burbujas[0].getBoundingClientRect().width, letra = getComputedStyle(burbujas[0]).fontSize;
    voladores = burbujas.map((b) => { const p = rel(b.getBoundingClientRect()); return crearVolador(b.textContent ?? '', p.x, p.y, tam, letra, false); });
    EXTRA.forEach((t) => voladores.push(crearVolador(t, C.x, C.y, tam, letra, true)));
    orbita.classList.remove('cargando');
    orbita.classList.add('explotando');
    hero.style.setProperty('--fx', `${C.x}px`);
    hero.style.setProperty('--fy', `${C.y}px`);
    destello.animate([{ opacity: 0 }, { opacity: 0.9, offset: 0.12 }, { opacity: 0 }], { duration: 650, easing: 'ease-out' });
    anilloExpansivo(C.x, C.y, 80, 9, 800);
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 + Math.random() * 0.5, len = Math.max(W, H) * (0.45 + Math.random() * 0.4);
      agregarRayo(fijo(C), fijo({ x: C.x + Math.cos(ang) * len, y: C.y + Math.sin(ang) * len }), COL.blanco, 520 + Math.random() * 300, 2);
    }
    const destinos = escogerDestinos(voladores.length, tam);
    voladores.forEach((f, i) => {
      const t = destinos[i];
      f.tx = t.x - f.x0; f.ty = t.y - f.y0; f.r = (Math.random() - 0.5) * 80; f.s = 0.85 + Math.random() * 0.3;
      f.el.animate([
        { transform: tf(0, 0, f.extra ? 0.2 : 1, 0), opacity: f.extra ? 0 : 1 },
        { transform: tf(f.tx, f.ty, f.s, f.r), opacity: 1 },
      ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.12,.8,.25,1)', fill: 'forwards' });
    });
    luego(cambiarTema, 220);
    ponerEstado(estados().deploy);
    luego(jalarDeVuelta, 1700);
  }
  function cambiarTema() {
    temaAzul = !temaAzul;
    onCambiarTema();
    // Reinicia la animación del glitch aunque ya la tenga puesta
    rol.classList.remove('glitch');
    void rol.offsetWidth;
    rol.classList.add('glitch');
  }
  function jalarDeVuelta() {
    fase = 'jalando';
    ponerEstado(estados().recompilando);
    const color = temaAzul ? COL.b : COL.a, espacio = 240;
    const orden = voladores.slice().sort(() => Math.random() - 0.5);
    orden.forEach((f, i) => {
      luego(() => {
        agregarRayo(fijo(C), seguir(f.el), color, 720, 2.4);
        const p = rel(f.el.getBoundingClientRect());
        remolino(p.x, p.y, p.w);
        luego(() => {
          f.el.animate([
            { transform: tf(f.tx, f.ty, f.s, f.r), opacity: 1 },
            { transform: tf(C.x - f.x0, C.y - f.y0, 0.15, f.r + 240), opacity: 0.15 },
          ], { duration: 540, easing: 'cubic-bezier(.55,0,.85,.4)', fill: 'forwards' });
        }, 170);
      }, i * espacio);
    });
    luego(rearmar, orden.length * espacio + 170 + 560);
  }
  function rearmar() {
    voladores.forEach((f) => f.el.remove());
    voladores = [];
    anilloExpansivo(C.x, C.y, 80, 6, 700);
    orbita.classList.remove('explotando');
    orbita.classList.add('regresando');
    ponerEstado(estados().exito);
    luego(() => orbita.classList.remove('regresando'), 1500);
    luego(() => { fase = 'quieto'; ponerEstado(estados().enLinea); programar(6500); }, 2400);
  }
  function programar(ms: number) {
    window.clearTimeout(siguiente);
    if (automaticas >= MAX_AUTOMATICAS) return;
    // Solo se dispara si el hero se ve y la pestaña está abierta: nada de explosiones a escondidas
    siguiente = window.setTimeout(() => {
      if (heroVisible && !document.hidden) { automaticas++; cargar(4400); } else programar(1500);
    }, ms);
  }
  function disparar() {
    if (fase !== 'quieto') return;
    window.clearTimeout(siguiente);
    cargar(1100);
  }
  nucleo.addEventListener('click', disparar);
  const observador = new IntersectionObserver((en) => { heroVisible = en[0].isIntersecting; }, { threshold: 0.35 });
  observador.observe(hero);
  programar(2500);

  return () => {
    vivo = false;
    window.clearTimeout(siguiente);
    relojes.forEach((id) => window.clearTimeout(id));
    nucleo.removeEventListener('click', disparar);
    observador.disconnect();
    voladores.forEach((f) => f.el.remove());
    orbita.classList.remove('cargando', 'explotando', 'regresando');
  };
}
