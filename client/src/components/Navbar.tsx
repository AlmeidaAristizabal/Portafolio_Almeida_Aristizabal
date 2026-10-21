import { useState } from 'react';
import { ENLACES_NAV } from '../data/contenido';

export function Navbar({ temaAzul }: { temaAzul: boolean }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className={`encabezado-sitio sticky top-0 z-50 ${temaAzul ? 'tema-azul' : ''}`}>
      <nav className="envoltura flex min-h-[68px] items-center justify-between gap-4" aria-label="Principal">
        <a href="#inicio" className="flex items-center gap-3 no-underline" onClick={cerrarMenu}>
          <span className="marca-circulo" aria-hidden>
            <span className="logo-aj" />
          </span>
          <span className="font-titulo text-[1.35rem] tracking-[0.08em] whitespace-nowrap text-white uppercase">Almeida · Aristizabal</span>
        </a>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg border border-[var(--dark-line)] text-white min-[861px]:hidden"
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <span className="sr-only">{menuAbierto ? 'Cerrar menú' : 'Abrir menú'}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {menuAbierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <ul
          id="menu-principal"
          className={`menu-movil ${menuAbierto ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col border-b border-[var(--dark-hair)] bg-pu-600 px-[clamp(16px,4vw,40px)] pt-2 pb-4 transition-colors duration-700 min-[861px]:static min-[861px]:flex min-[861px]:flex-row min-[861px]:items-center min-[861px]:gap-8 min-[861px]:border-0 min-[861px]:bg-transparent min-[861px]:p-0`}
        >
          {ENLACES_NAV.map((enlace) => (
            <li key={enlace.id}>
              <a
                href={`#${enlace.id}`}
                onClick={cerrarMenu}
                className="enlace-nav block border-b border-[var(--dark-hair)] py-3 text-[1.05rem] font-semibold text-in-100 no-underline hover:text-white min-[861px]:border-0 min-[861px]:py-0"
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

        <a href="#contacto" className="boton boton-primario boton-sm hidden min-[861px]:inline-flex">
          Contáctanos
        </a>
      </nav>
    </header>
  );
}
