import { useCallback, useSyncExternalStore } from 'react';

export type Tema = 'claro' | 'oscuro';

// Ojo: el script de index.html usa esta misma clave pa' pintar el tema antes de que cargue React
const CLAVE = 'tema';
const CONSULTA = '(prefers-color-scheme: dark)';
const oyentes = new Set<() => void>();

// localStorage puede reventar en modo incógnito o con las cookies bloqueadas: ahí nadie se acuerda de nada
function leerGuardado(): Tema | null {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado === 'claro' || guardado === 'oscuro' ? guardado : null;
  } catch {
    return null;
  }
}

const temaDelSistema = (): Tema => (window.matchMedia?.(CONSULTA).matches ? 'oscuro' : 'claro');
const leerTema = (): Tema => (document.documentElement.dataset.tema === 'oscuro' ? 'oscuro' : 'claro');

function aplicar(tema: Tema) {
  document.documentElement.dataset.tema = tema;
  oyentes.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  // Mientras la persona no escoja, seguimos al sistema (si el celular se apaga de noche, la página también)
  const mq = window.matchMedia?.(CONSULTA);
  const alCambiarSistema = () => {
    if (!leerGuardado()) aplicar(temaDelSistema());
  };
  mq?.addEventListener('change', alCambiarSistema);
  return () => {
    oyentes.delete(avisar);
    mq?.removeEventListener('change', alCambiarSistema);
  };
}

// El tema vive en <html data-tema="…">: el CSS lo lee de ahí y este hook solo lo prende y lo apaga
export function useTema() {
  const tema = useSyncExternalStore(suscribir, leerTema, (): Tema => 'claro');

  const alternarTema = useCallback(() => {
    const nuevo: Tema = leerTema() === 'oscuro' ? 'claro' : 'oscuro';
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // Sin almacenamiento igual cambia, solo que al recargar se le olvida
    }
    aplicar(nuevo);
  }, []);

  return [tema, alternarTema] as const;
}
