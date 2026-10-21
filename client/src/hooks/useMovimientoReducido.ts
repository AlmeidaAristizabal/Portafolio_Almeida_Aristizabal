import { useSyncExternalStore } from 'react';

const CONSULTA = '(prefers-reduced-motion: reduce)';

function suscribir(avisar: () => void) {
  if (!window.matchMedia) return () => {};
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener('change', avisar);
  return () => mq.removeEventListener('change', avisar);
}

// true si la persona pidió menos animaciones en su sistema: ahí apagamos explosiones y avionetas
export function useMovimientoReducido(): boolean {
  return useSyncExternalStore(suscribir, () => window.matchMedia?.(CONSULTA).matches ?? false, () => false);
}
