import { useCallback, useSyncExternalStore } from 'react';
import { TEXTOS, type Idioma } from '../i18n/textos';

// Ojo: el script de index.html usa esta misma clave pa' poner el idioma antes de que cargue React
const CLAVE = 'idioma';
const oyentes = new Set<() => void>();

const leerIdioma = (): Idioma => (document.documentElement.lang === 'en' ? 'en' : 'es');

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => {
    oyentes.delete(avisar);
  };
}

// Igualito a useTema: el idioma vive en <html lang="…"> (así los lectores de pantalla también se enteran)
// y todos los componentes que usan el hook se repintan cuando cambia
export function useIdioma() {
  const idioma = useSyncExternalStore(suscribir, leerIdioma, (): Idioma => 'es');

  const alternarIdioma = useCallback(() => {
    const nuevo: Idioma = leerIdioma() === 'en' ? 'es' : 'en';
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // Sin almacenamiento igual cambia, solo que al recargar vuelve al del navegador
    }
    document.documentElement.lang = nuevo;
    oyentes.forEach((avisar) => avisar());
  }, []);

  return { idioma, t: TEXTOS[idioma], alternarIdioma };
}
