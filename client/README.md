# client

La cara del portafolio de AJ: React 19 + TypeScript + Vite + Tailwind CSS v4.

```bash
npm install
npm run dev      # http://localhost:5173 (las llamadas a /api se van al server en el puerto 3001)
npm test         # pruebas con Vitest
npm run lint     # oxlint
npm run build    # revisa los tipos y arma la carpeta dist/
```

Dónde está cada cosa:

- `src/components/`: las secciones de la página (Hero, Servicios, Cotizador, Contacto...).
- `src/data/`: los textos, los proyectos y las tarifas del cotizador. Aquí se cambian los datos de relleno.
- `src/schemas/contacto.ts`: las reglas del formulario. Deben coincidir con las de `server/src/models/MensajeContacto.ts`.
- `src/efectos/`: las animaciones (la explosión del hero, la avioneta del envío).

Cómo correr el proyecto completo: ver el [README de la raíz](../README.md).
