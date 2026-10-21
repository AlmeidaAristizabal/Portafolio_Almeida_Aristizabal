import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Cotizador } from '../components/Cotizador';

describe('cotizador', () => {
  it('Reiniciar también devuelve la moneda a USD', async () => {
    const usuario = userEvent.setup();
    render(<Cotizador onEnviar={vi.fn()} />);

    await usuario.click(screen.getByRole('button', { name: 'COP' }));
    expect(screen.getByText(/Inversión estimada · COP/)).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Reiniciar' }));
    expect(screen.getByText(/Inversión estimada · USD/)).toBeInTheDocument();
  });
});
