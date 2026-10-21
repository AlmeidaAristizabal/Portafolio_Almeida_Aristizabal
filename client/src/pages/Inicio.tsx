import { useCallback, useState } from 'react';
import { Contacto } from '../components/Contacto';
import { Cotizador, type CotizacionElegida } from '../components/Cotizador';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { Nosotros } from '../components/Nosotros';
import { Proceso } from '../components/Proceso';
import { Proyectos } from '../components/Proyectos';
import { Servicios } from '../components/Servicios';

export function Inicio() {
  // El hero y el navbar cambian de morado a azul juntos cuando explota el banner
  const [temaAzul, setTemaAzul] = useState(false);
  const cambiarTema = useCallback(() => setTemaAzul((azul) => !azul), []);
  // El cotizador y el formulario son vecinos: el papá les sirve de mensajero
  const [cotizacion, setCotizacion] = useState<CotizacionElegida | null>(null);

  return (
    <>
      <Navbar temaAzul={temaAzul} />
      <main id="inicio">
        <Hero temaAzul={temaAzul} onCambiarTema={cambiarTema} />
        <Nosotros />
        <Servicios />
        <Proyectos />
        <Proceso />
        <Cotizador onEnviar={setCotizacion} />
        <Contacto cotizacion={cotizacion} />
      </main>
      <Footer />
    </>
  );
}
