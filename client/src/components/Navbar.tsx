import { useState } from 'react';
import { ENLACES_NAV } from '../data/contenido';
import { useTema } from '../hooks/useTema';

export function Navbar({ temaAzul }: { temaAzul: boolean }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className={`encabezado-sitio sticky top-0 z-50 ${temaAzul ? 'tema-azul' : ''}`}>
      <nav className="envoltura flex min-h-[68px] items-center gap-4" aria-label="Principal">
        <a href="#inicio" className="flex items-center gap-3 no-underline" onClick={cerrarMenu}>
          <span className="marca-circulo" aria-hidden>
            <span className="logo-aj" />
          </span>
          <span className="font-titulo text-[1.35rem] tracking-[0.08em] whitespace-nowrap text-white uppercase">Almeida · Aristizabal</span>
        </a>

        {/* En celular van pegados a la derecha; en escritorio el order los manda entre el menú y "Contáctanos" */}
        <div className="ml-auto flex items-center gap-2.5 min-[861px]:order-1 min-[861px]:ml-0">
          <BotonTema />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg border border-(--dark-line) text-white min-[861px]:hidden"
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <span className="sr-only">{menuAbierto ? 'Cerrar menú' : 'Abrir menú'}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {menuAbierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        <ul
          id="menu-principal"
          className={`menu-movil ${menuAbierto ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col border-b border-(--dark-hair) bg-pu-600 px-[clamp(16px,4vw,40px)] pt-2 pb-4 transition-colors duration-700 min-[861px]:static min-[861px]:ml-auto min-[861px]:flex min-[861px]:flex-row min-[861px]:items-center min-[861px]:gap-8 min-[861px]:border-0 min-[861px]:bg-transparent min-[861px]:p-0`}
        >
          {ENLACES_NAV.map((enlace) => (
            <li key={enlace.id}>
              <a
                href={`#${enlace.id}`}
                onClick={cerrarMenu}
                className="enlace-nav block border-b border-(--dark-hair) py-3 text-[1.05rem] font-semibold text-in-100 no-underline hover:text-white min-[861px]:border-0 min-[861px]:py-0"
              >
                {enlace.texto}
              </a>
            </li>
          ))}
          <li className="min-[861px]:hidden">
            <a href="#contacto" onClick={cerrarMenu} className="enlace-nav block py-3 text-[1.05rem] font-semibold text-in-100 no-underline">
              Contacto
            </a>
          </li>
        </ul>

        <a href="#contacto" className="boton boton-primario boton-sm hidden min-[861px]:order-2 min-[861px]:inline-flex">
          Contáctanos
        </a>
      </nav>
    </header>
  );
}

function BotonTema() {
  const [tema, alternarTema] = useTema();
  const oscuro = tema === 'oscuro';
  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-pressed={oscuro}
      className="inline-flex size-11 cursor-pointer items-center justify-center rounded-lg border border-(--dark-line) bg-transparent text-white transition-colors hover:bg-(--dark-surface-2) min-[861px]:size-10"
    >
      <span className="sr-only">Modo oscuro</span>
      {/* Se muestra a dónde vas, no dónde estás: de noche sale el sol */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {oscuro ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        )}
      </svg>
    </button>
  );
}
