import { Link } from 'react-router-dom';
import { CamionAJ } from '../components/CamionAJ';

export function NoEncontrada() {
  return (
    <main className="hero oscuro flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="relative z-[1] w-[min(90%,420px)]">
        <CamionAJ etiqueta="Camión de AJ Express perdido" />
      </div>
      <h1 className="relative z-[1] m-0 font-titulo text-7xl font-bold text-white uppercase">404</h1>
      <p className="relative z-[1] m-0 text-xl text-pu-100">El camión se perdió: esta página no existe.</p>
      <Link to="/" className="boton boton-primario relative z-[1]">
        Volver al inicio
      </Link>
    </main>
  );
}
