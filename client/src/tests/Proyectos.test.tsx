import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Proyectos } from '../components/Proyectos';
import { PROYECTOS } from '../data/contenido';

describe('sección de proyectos', () => {
  it('filtra por categoría y actualiza el contador', async () => {
    render(<Proyectos />);
    const total = PROYECTOS.length;
    const apps = PROYECTOS.filter((p) => p.categoria === 'app').length;

    expect(screen.getByText(`Mostrando ${total} de ${total} proyectos`)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Apps' }));

    expect(screen.getByText(`Mostrando ${apps} de ${total} proyectos`)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(apps);
    expect(screen.getByRole('button', { name: 'Apps' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('arranca en modo código (stack) y cambia a modo negocio (para / resultado)', async () => {
    render(<Proyectos />);
    expect(screen.queryByText('resultado')).not.toBeInTheDocument();
    expect(screen.getAllByText('Laravel').length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: /modo negocio/ }));

    expect(screen.getAllByText('resultado')).toHaveLength(PROYECTOS.length);
    expect(screen.getByRole('button', { name: /modo código/ })).toBeInTheDocument();
  });
});
