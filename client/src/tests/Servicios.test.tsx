import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Servicios } from '../components/Servicios';

describe('servicios', () => {
  it('arranca en Aplicaciones web con el autoplay prendido', () => {
    const { container } = render(<Servicios />);

    expect(screen.getByRole('button', { name: /Aplicaciones web/ })).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('.servicios')).toHaveClass('automatico');
  });

  it('al escoger uno a mano se apaga el autoplay y cambia la ventanita', async () => {
    const { container } = render(<Servicios />);
    await userEvent.click(screen.getByRole('button', { name: /Bases de datos/ }));

    expect(screen.getByRole('button', { name: /Bases de datos/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Aplicaciones web/ })).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('.servicios')).not.toHaveClass('automatico');
    expect(screen.getByText('mysql · inventario')).toBeInTheDocument();
  });
});
