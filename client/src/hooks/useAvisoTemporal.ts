import { useCallback, useEffect, useRef, useState } from 'react';

// Muestra un valor por un ratico y vuelve al de reposo. Si avisan otra vez, el reloj arranca de cero,
// y si el componente se desmonta, el setTimeout se va con él (nada de fantasmas en casa vieja)
export function useAvisoTemporal<T>(reposo: T, ms: number) {
  const [valor, setValor] = useState<T>(reposo);
  const reloj = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(reloj.current), []);

  const avisar = useCallback(
    (nuevo: T) => {
      window.clearTimeout(reloj.current);
      setValor(nuevo);
      reloj.current = window.setTimeout(() => setValor(reposo), ms);
    },
    [reposo, ms],
  );

  return [valor, avisar] as const;
}
