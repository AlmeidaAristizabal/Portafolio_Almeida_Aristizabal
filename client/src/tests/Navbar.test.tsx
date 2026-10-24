import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Navbar } from '../components/Navbar';

describe('modo oscuro', () => {
  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.tema;
  });

  it('el botón prende y apaga el modo oscuro y se acuerda de la elección', async () => {
    render(<Navbar temaAzul={false} />);
    const boton = screen.getByRole('button', { name: 'Modo oscuro' });
    expect(boton).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(boton);
    expect(document.documentElement.dataset.tema).toBe('oscuro');
    expect(localStorage.getItem('tema')).toBe('oscuro');
    expect(boton).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(boton);
    expect(document.documentElement.dataset.tema).toBe('claro');
    expect(localStorage.getItem('tema')).toBe('claro');
    expect(boton).toHaveAttribute('aria-pressed', 'false');
  });

  it('respeta el tema que ya pintó el script de index.html', () => {
    document.documentElement.dataset.tema = 'oscuro';
    render(<Navbar temaAzul={false} />);

    expect(screen.getByRole('button', { name: 'Modo oscuro' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('idioma', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('el botón EN pasa la página a inglés, cambia el lang del <html> y se acuerda', async () => {
    render(<Navbar temaAzul={false} />);
    expect(screen.getByRole('link', { name: 'Nosotros' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ver en inglés' }));

    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('idioma')).toBe('en');
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    // Y de vuelta: ahora el botón ofrece español
    await userEvent.click(screen.getByRole('button', { name: 'View in Spanish' }));
    expect(document.documentElement.lang).toBe('es');
    expect(screen.getByRole('link', { name: 'Nosotros' })).toBeInTheDocument();
  });
});
