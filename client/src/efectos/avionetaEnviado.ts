// Avioneta con pancarta (portada del HTML v9): rueda sobre el botón "Enviar" de borde a borde y despega,
// da una vuelta, cruza el formulario, pasa por DETRÁS de las fotos, sale por la izquierda y cruza la
// pantalla de borde a borde arrastrando la pancarta "¡ENVIADO!".

interface Punto { x: number; y: number }
interface Caja { l: number; t: number; r: number; b: number; w: number; h: number }
interface Muestra extends Punto { nx: number; ny: number; atras: boolean }
interface Humo extends Punto { r: number; vx: number; vy: number; vida: number; atras: boolean }

export interface ElementosAvioneta {
  boton: HTMLElement;
  seccion: HTMLElement;
  formulario: HTMLElement;
  fotoJuan: HTMLElement | null;
  fotoEleira: HTMLElement | null;
  tarjeta: HTMLElement | null;
}

const caja = (el: Element): Caja => {
  const r = el.getBoundingClientRect();
  return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height };
};
const limitar = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const suave = (x: number) => { x = limitar(x, 0, 1); return x * x * (3 - 2 * x); };

export function volarAvioneta(el: ElementosAvioneta, alTerminar: () => void): () => void {
  const vw = window.innerWidth, vh = window.innerHeight;
  const { boton, seccion: sec } = el;
  const k = limitar(vw / 1100, 0.8, 1.25);
  // Todo se ancla a la sección de contacto: si la página se desplaza, la avioneta se mueve con ella
  const sr = sec.getBoundingClientRect(), ox = sr.left, oy = sr.top, SW = sec.clientWidth, SH = sec.clientHeight;
  const arriba = Math.max(96, sr.top + 24), abajo = Math.min(vh, sr.bottom);
  const Bt = caja(boton), F = caja(el.formulario);
  const J = el.fotoJuan ? caja(el.fotoJuan) : null, E = el.fotoEleira ? caja(el.fotoEleira) : null, R = el.tarjeta ? caja(el.tarjeta) : null;
  const hayPersonas = !!(J && E && J.w > 0 && J.b > 120 && J.t < vh - 120);

  const css = getComputedStyle(document.documentElement);
  const v = (n: string) => css.getPropertyValue(n).trim();
  const COL = {
    blanco: '#FFFFFF', franja: v('--color-pu-500'), ala: v('--color-pu-500'), estab: v('--color-pu-400'), vidrio: v('--color-bl-200'),
    oscuro: v('--color-in-600'), helice: v('--color-pu-200'), borde: v('--color-pu-200'), texto: v('--color-pu-500'), brillo: v('--color-pu-200'),
  };

  // Lienzos: uno detrás del contenido y otro al frente
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const fondo = document.createElement('canvas');
  fondo.className = 'avioneta-fondo'; fondo.setAttribute('aria-hidden', 'true');
  const capa = document.createElement('div');
  capa.className = 'avioneta-frente'; capa.setAttribute('aria-hidden', 'true');
  const frente = document.createElement('canvas');
  frente.className = 'avioneta-lienzo';
  capa.appendChild(frente);
  const ctxFondo = fondo.getContext('2d'), ctxFrente = frente.getContext('2d');
  // Sin canvas (navegador viejito o pruebas) no hay avioneta: se avisa de una y listo
  if (!ctxFondo || !ctxFrente || typeof Path2D === 'undefined') {
    alTerminar();
    return () => {};
  }
  // Constantes ya revisadas: así TypeScript no duda de ellas dentro de las funciones de abajo
  const bctx: CanvasRenderingContext2D = ctxFondo, fctx: CanvasRenderingContext2D = ctxFrente;
  sec.appendChild(fondo); sec.appendChild(capa);
  for (const c of [bctx, fctx]) {
    c.canvas.width = Math.round(SW * dpr); c.canvas.height = Math.round(SH * dpr);
    // Trasladamos el lienzo pa' poder dibujar en coordenadas de pantalla
    c.setTransform(dpr, 0, 0, dpr, -ox * dpr, -oy * dpr);
  }

  // Pancarta
  const fuente = `700 ${Math.round(22 * k)}px ${v('--font-titulo')}`;
  fctx.font = fuente;
  const letras = Array.from('¡ENVIADO!').map((ch) => ({ ch, w: fctx.measureText(ch).width, en: 0 }));
  const sep = 2.4 * k, relleno = 16 * k;
  let anchoTexto = 0;
  letras.forEach((c, i) => { c.en = anchoTexto; anchoTexto += c.w + (i < letras.length - 1 ? sep : 0); });
  const BAN = { len: anchoTexto + 2 * relleno, h: 30 * k, cuerda: 40 * k };
  const fueraDePantalla = BAN.cuerda + BAN.len + 90 * k;

  // 1. Pista: borde superior del botón, de borde a borde
  const alturaRueda = 13 * k;
  const R0 = { x: Bt.l + 30 * k, y: Bt.t - alturaRueda }, R1 = { x: Bt.r - 4 * k, y: Bt.t - alturaRueda };
  const radio = limitar(vw * 0.07, 45, 70);
  const P1 = { x: limitar(R1.x + 80, 2 * radio + 24, vw - 24), y: limitar(R1.y - 130, radio + arriba, abajo - radio - 24) };
  // Usamos un <path> SVG invisible solo pa' medir la ruta con getTotalLength / getPointAtLength
  const NS = 'http://www.w3.org/2000/svg';
  const anfitrion = document.createElementNS(NS, 'svg');
  anfitrion.setAttribute('width', '0'); anfitrion.setAttribute('height', '0'); anfitrion.style.position = 'absolute';
  const ruta = document.createElementNS(NS, 'path');
  anfitrion.appendChild(ruta); document.body.appendChild(anfitrion);
  let d = `M${R0.x} ${R0.y} L${R1.x} ${R1.y}`;
  ruta.setAttribute('d', d); const Lr = ruta.getTotalLength();
  d += ` Q${R1.x + 70} ${R1.y - 4} ${P1.x} ${P1.y}`;
  ruta.setAttribute('d', d); const inicioVuelta = ruta.getTotalLength();
  d += ` A${radio} ${radio} 0 0 0 ${P1.x - 2 * radio} ${P1.y} A${radio} ${radio} 0 0 0 ${P1.x} ${P1.y}`;
  ruta.setAttribute('d', d); const finVuelta = ruta.getTotalLength();

  // 2. Recorrido: formulario, detrás de las personas y salida por la izquierda
  const cy = (y: number) => limitar(y, arriba, abajo - 40);
  const pts: Punto[] = [P1];
  pts.push({ x: limitar(F.l + F.w * 0.18, 40, vw - 40), y: cy(F.t + F.h * 0.32) });
  pts.push({ x: limitar(F.l + F.w * 0.72, 40, vw - 40), y: cy(F.t + 14) });
  let inicioAtras = -1, finAtras = -1;
  if (hayPersonas && J && E) {
    const cabeza = Math.min(J.t, E.t);
    const yB = limitar(Math.max(J.t, E.t) + Math.min(J.h, E.h) * 0.42, arriba, abajo - 50);
    const yU = limitar(R ? Math.max(R.b + 40, cabeza - 50) : cabeza - 50, arriba, abajo - 50);
    pts.push({ x: J.l - 32, y: yB }); inicioAtras = pts.length - 1;
    pts.push({ x: (J.l + E.r) / 2, y: yB + 18 });
    pts.push({ x: Math.min(E.r + 50, vw - 28), y: yB - 10 });
    pts.push({ x: Math.min(E.r + 40, vw - 28), y: yU }); finAtras = pts.length - 1;
    pts.push({ x: J.l + 10, y: yU - 10 });
    pts.push({ x: vw * 0.3, y: cy(yU - 70) });
    pts.push({ x: -fueraDePantalla - 40, y: cy(yU - 110) });
  } else {
    pts.push({ x: vw * 0.82, y: cy(F.t - 40) });
    pts.push({ x: vw * 0.35, y: cy(F.t - 110) });
    pts.push({ x: -fueraDePantalla - 40, y: cy(F.t - 150) });
  }
  // Curva suave que pasa por todos los puntos (Catmull-Rom convertida a Bézier)
  const todos = [{ x: P1.x, y: P1.y + 140 }, ...pts];
  const ult = pts[pts.length - 1], penult = pts[pts.length - 2];
  todos.push({ x: ult.x + (ult.x - penult.x), y: ult.y + (ult.y - penult.y) });
  const largoEn = [finVuelta];
  for (let i = 1; i < todos.length - 2; i++) {
    const p0 = todos[i - 1], p1 = todos[i], p2 = todos[i + 1], p3 = todos[i + 2];
    d += ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
    ruta.setAttribute('d', d);
    largoEn.push(ruta.getTotalLength());
  }
  const LA = largoEn[largoEn.length - 1];
  const dEntra = inicioAtras > 0 ? largoEn[inicioAtras] : Infinity, dSale = finAtras > 0 ? largoEn[finAtras] : -Infinity;
  const ax: number[] = [], ay: number[] = [];
  for (let s = 0; s <= LA; s += 2) { const q = ruta.getPointAtLength(s); ax.push(q.x); ay.push(q.y); }
  const qe = ruta.getPointAtLength(LA); ax.push(qe.x); ay.push(qe.y);
  anfitrion.remove();

  // 3. Cruce final de izquierda a derecha, por encima de las cabezas si están a la vista
  const yMedio = limitar(vh * 0.42, arriba + 60, abajo - 80);
  const yF = hayPersonas && J && E ? limitar(Math.min(J.t, E.t) - 36, arriba + 50, yMedio) : yMedio;
  const B0 = -70 * k, B1 = vw + fueraDePantalla + 20, LB = B1 - B0, S = LA + LB;
  function pos(s: number): Punto {
    if (s > LA) return { x: B0 + Math.min(s - LA, LB), y: yF };
    const f = Math.max(0, s) / 2, i0 = Math.min(Math.floor(f), ax.length - 2), t = f - i0;
    return { x: ax[i0] + (ax[i0 + 1] - ax[i0]) * t, y: ay[i0] + (ay[i0 + 1] - ay[i0]) * t };
  }
  function tangente(s: number): Punto {
    if (s > LA) return { x: 1, y: 0 };
    const a = pos(s - 2), b = pos(Math.min(LA, s + 2)), l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: (b.x - a.x) / l, y: (b.y - a.y) / l };
  }
  const atras = (s: number) => s > dEntra && s < dSale;

  // Velocidad: arranque lento en la pista, más despacio detrás de las personas
  const factorAtras = (s: number) => (isFinite(dEntra) ? suave((s - (dEntra - 90)) / 140) * (1 - suave((s - (dSale - 50)) / 140)) : 0);
  function velocidad(s: number) {
    if (s < Lr) return 50 + 520 * Math.pow(s / Lr, 1.3);
    if (s < LA) return (570 + 160 * suave((s - Lr) / 200)) * (1 - 0.45 * factorAtras(s));
    // Cruce final: rápido fuera de pantalla, lento cuando se ve y más lento con la pancarta en el centro pa' que se lea
    const x = B0 + (s - LA), colaFuera = vw + BAN.cuerda + BAN.len;
    const visible = suave((x + 40) / 120) * (1 - suave((x - colaFuera) / 120));
    const bc = x - BAN.cuerda - BAN.len / 2 - vw / 2, campana = Math.exp(-Math.pow(bc / (vw * 0.32), 2));
    const lento = limitar(vw * 0.2 + 80, 170, 340) * (1 - 0.4 * campana);
    return 700 + (lento - 700) * visible;
  }
  // Tabla distancia ↔ tiempo pa' saber dónde va la avioneta en cada milisegundo
  const tabla = [{ d: 0, t: 0 }];
  let tt = 0;
  for (let s0 = 3; s0 <= S; s0 += 3) { tt += 3 / velocidad(s0); tabla.push({ d: s0, t: tt }); }
  const DUR = tt * 1000;
  function distanciaEn(ms: number) {
    const meta = limitar(ms / 1000, 0, tt);
    let lo = 0, hi = tabla.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (tabla[mid].t < meta) lo = mid; else hi = mid; }
    const a = tabla[lo], b = tabla[hi], f = b.t > a.t ? (meta - a.t) / (b.t - a.t) : 0;
    return Math.min(S, a.d + (b.d - a.d) * f);
  }

  // Dibujo de la avioneta (vista lateral, mirando a la derecha)
  const cuerpo = new Path2D('M27 1 Q26 -6 17 -7 L-8 -6.5 Q-21 -5 -30 -2.5 L-30 2 Q-20 5.5 -6 6.5 L17 6.5 Q26 6.5 27 1 Z');
  const aleta = new Path2D('M-21 -4.5 L-29 -15 Q-32 -17 -34 -14 L-31 -2 Z');
  const cabina = new Path2D('M5 -6.6 Q8 -12.5 15 -12.5 Q20 -12 22 -6.8 Z');
  const franja = new Path2D('M-29 -.8 L25 -.8 L26.4 1.6 L-29 1.6 Z');
  function dibujarAvioneta(c: CanvasRenderingContext2D, p: Punto, ang: number, sy: number, ahora: number) {
    c.save();
    c.translate(p.x, p.y); c.rotate(ang); c.scale(k, k * sy);
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.fillStyle = COL.estab; c.beginPath(); c.ellipse(-27, 0.5, 7, 1.8, 0, 0, 6.283); c.fill();
    c.fillStyle = COL.ala; c.fill(aleta);
    c.shadowColor = COL.brillo; c.shadowBlur = 12;
    c.fillStyle = COL.blanco; c.fill(cuerpo);
    c.shadowBlur = 0;
    c.strokeStyle = COL.borde; c.lineWidth = 0.8; c.stroke(cuerpo);
    c.fillStyle = COL.franja; c.fill(franja);
    c.fillStyle = COL.vidrio; c.fill(cabina);
    c.fillStyle = COL.ala; c.beginPath(); c.ellipse(2, 4.2, 15, 2.6, 0, 0, 6.283); c.fill();
    c.strokeStyle = COL.oscuro; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(8, 6); c.lineTo(10.5, 10.5); c.stroke();
    c.fillStyle = COL.oscuro; c.beginPath(); c.arc(10.5, 11, 2.6, 0, 6.283); c.fill();
    c.beginPath(); c.arc(-27, 3.8, 1.3, 0, 6.283); c.fill();
    c.fillStyle = COL.helice; c.beginPath(); c.ellipse(28.5, 1, 2.6, 2.9, 0, 0, 6.283); c.fill();
    c.globalAlpha = 0.35; c.fillStyle = COL.blanco; c.beginPath(); c.ellipse(30.5, 1, 1.3, 11, 0, 0, 6.283); c.fill();
    c.globalAlpha = 1;
    const aspa = 11 * Math.cos(ahora * 0.045);
    c.strokeStyle = COL.oscuro; c.lineWidth = 1.6; c.beginPath(); c.moveTo(30.5, 1 - aspa); c.lineTo(30.5, 1 + aspa); c.stroke();
    c.restore();
  }

  // La pancarta sigue la trayectoria y ondea
  const onda = (u: number, tm: number) => Math.sin(u * 7.5 - tm * 9) * 3.6 * k * (0.25 + u);
  function dibujarPancarta(s: number, despliegue: number, ahora: number, cola: Punto) {
    const L = BAN.len * despliegue, N = Math.max(4, Math.ceil(L / (5 * k))), paso = L / N, tm = ahora / 1000;
    const muestras: Muestra[] = [];
    for (let i = 0; i <= N; i++) {
      const a = i * paso, sd = s - BAN.cuerda - a;
      if (sd < 0) break;
      const p = pos(sd), t = tangente(sd), nx = -t.y, ny = t.x, w = onda(a / BAN.len, tm);
      muestras.push({ x: p.x + nx * w, y: p.y + ny * w, nx, ny, atras: atras(sd) });
    }
    if (muestras.length < 2) return;
    const h = BAN.h / 2, f0 = muestras[0];
    const rc = atras(s - BAN.cuerda / 2) ? bctx : fctx;
    if (Math.hypot(f0.x - cola.x, f0.y - cola.y) < BAN.cuerda * 2.5) {
      rc.strokeStyle = COL.blanco; rc.globalAlpha = 0.85; rc.lineWidth = 1.2;
      rc.beginPath(); rc.moveTo(cola.x, cola.y); rc.lineTo(f0.x, f0.y); rc.stroke(); rc.globalAlpha = 1;
    }
    // La tela se pinta por tramos: los que van detrás de las fotos en un lienzo y el resto en el otro
    let tramo = [muestras[0]];
    const vaciar = () => {
      if (tramo.length < 2) return;
      const c = tramo[0].atras ? bctx : fctx;
      c.beginPath();
      tramo.forEach((q, j) => { const x = q.x - q.nx * h, y = q.y - q.ny * h; if (j) c.lineTo(x, y); else c.moveTo(x, y); });
      for (let j = tramo.length - 1; j >= 0; j--) c.lineTo(tramo[j].x + tramo[j].nx * h, tramo[j].y + tramo[j].ny * h);
      c.closePath();
      c.shadowColor = COL.brillo; c.shadowBlur = 10; c.fillStyle = COL.blanco; c.fill(); c.shadowBlur = 0;
      c.strokeStyle = COL.borde; c.lineWidth = 1.5; c.stroke();
    };
    for (let m = 1; m < muestras.length; m++) {
      const q = muestras[m], pr = muestras[m - 1];
      if (Math.hypot(q.x - pr.x, q.y - pr.y) > paso * 4 + 20) { vaciar(); tramo = [q]; continue; }
      tramo.push(q);
      if (q.atras !== pr.atras) { vaciar(); tramo = [q]; }
    }
    vaciar();
    // Asta delantera
    const pc = f0.atras ? bctx : fctx;
    pc.strokeStyle = COL.texto; pc.lineWidth = 3 * k;
    pc.beginPath();
    pc.moveTo(f0.x - f0.nx * (h + 2 * k), f0.y - f0.ny * (h + 2 * k));
    pc.lineTo(f0.x + f0.nx * (h + 2 * k), f0.y + f0.ny * (h + 2 * k));
    pc.stroke();
    // Texto: siempre se lee de izquierda a derecha, aunque la avioneta vaya pa'l otro lado
    const mt = tangente(Math.max(0, s - BAN.cuerda - L / 2)), alReves = mt.x < 0;
    for (const c of letras) {
      const a = alReves ? relleno + c.en + c.w / 2 : BAN.len - relleno - c.en - c.w / 2;
      if (a > L) continue;
      const sd = s - BAN.cuerda - a;
      if (sd < 0) continue;
      const p = pos(sd), t = tangente(sd), w = onda(a / BAN.len, tm);
      const cx = atras(sd) ? bctx : fctx;
      cx.save();
      cx.translate(p.x - t.y * w, p.y + t.x * w);
      cx.rotate(Math.atan2(t.y, t.x) + (alReves ? Math.PI : 0));
      cx.font = fuente; cx.fillStyle = COL.texto; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText(c.ch, 0, 1.2 * k);
      cx.restore();
    }
  }

  let humos: Humo[] = [];
  const inicio = performance.now();
  let ultimo = inicio, sy = 1, raf = 0, cancelado = false;
  function cuadro(ahora: number) {
    if (cancelado) return;
    const dt = Math.min(3, (ahora - ultimo) / 16.67); ultimo = ahora;
    const ms = ahora - inicio, s = distanciaEn(ms), terminado = ms >= DUR;
    bctx.clearRect(ox, oy, SW, SH); fctx.clearRect(ox, oy, SW, SH);
    const p = pos(s), tg = tangente(s), ang = Math.atan2(tg.y, tg.x), estaAtras = atras(s);
    // Cuando vuela pa' la izquierda se voltea (sy = -1) pa' no quedar patas arriba
    const meta = s < Lr || (s >= inicioVuelta && s <= finVuelta) ? 1 : tg.x >= 0 ? 1 : -1;
    sy += (meta - sy) * Math.min(1, 0.14 * dt);
    if (Math.abs(sy) < 0.05) sy = sy < 0 ? -0.05 : 0.05;
    const cola = { x: p.x - tg.x * 33 * k, y: p.y - tg.y * 33 * k };

    // Pista punteada sobre el botón
    const pista = 1 - suave((s - Lr) / 160);
    if (pista > 0) {
      fctx.save(); fctx.globalAlpha = pista * 0.9; fctx.strokeStyle = COL.blanco; fctx.lineWidth = 2; fctx.setLineDash([8, 6]);
      fctx.lineDashOffset = -s * 0.6;
      fctx.beginPath(); fctx.moveTo(Bt.l + 14, Bt.t - 1); fctx.lineTo(Bt.r - 14, Bt.t - 1); fctx.stroke(); fctx.restore();
    }
    // Humo del motor
    if (!terminado && s > Lr * 0.5 && Math.random() < 0.7) {
      humos.push({ x: cola.x, y: cola.y, r: 2 * k, vx: -tg.x * 0.4 + (Math.random() - 0.5) * 0.4, vy: -tg.y * 0.4 + (Math.random() - 0.5) * 0.4, vida: 1, atras: estaAtras });
    }
    humos = humos.filter((q) => q.vida > 0);
    for (const q of humos) {
      q.x += q.vx * dt; q.y += q.vy * dt; q.r += 0.18 * k * dt; q.vida -= 0.03 * dt;
      const c = q.atras ? bctx : fctx;
      c.globalAlpha = Math.max(0, q.vida) * 0.45; c.fillStyle = COL.blanco;
      c.beginPath(); c.arc(q.x, q.y, q.r, 0, 6.283); c.fill();
    }
    bctx.globalAlpha = 1; fctx.globalAlpha = 1;

    const despliegue = suave((s - Lr - 60) / 260);
    if (despliegue > 0) dibujarPancarta(s, despliegue, ahora, cola);
    dibujarAvioneta(estaAtras ? bctx : fctx, p, ang, sy, ahora);

    if (!terminado) raf = requestAnimationFrame(cuadro);
    else { capa.remove(); fondo.remove(); alTerminar(); }
  }
  raf = requestAnimationFrame(cuadro);

  return () => {
    cancelado = true;
    cancelAnimationFrame(raf);
    capa.remove();
    fondo.remove();
  };
}
