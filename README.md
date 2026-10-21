# Portafolio_Almeida_Aristizabal

Portafolio de AJ (Alejandra Aristizabal y Juan Pablo Almeida): quiénes somos, qué hacemos, los proyectos, un cotizador que da un rango de precio en 30 segundos y un formulario de contacto que manda el mensaje al correo.

## Stack

- **client/**: React 19 + TypeScript + Vite + Tailwind CSS v4, formularios con React Hook Form + Zod, pruebas con Vitest y Testing Library, lint con oxlint.
- **server/**: Express 5 + TypeScript, validación con Zod, correos con Nodemailer, `helmet` y límite de mensajes por IP, pruebas con Vitest y Supertest.

## Cómo correrlo

Necesitas Node 24 o más nuevo.

```bash
# 1. El server (API de contacto)
cd server
npm install
cp .env.example .env   # llena los valores; sin SMTP en desarrollo usa un buzón de prueba de Ethereal
npm run dev            # http://localhost:3001

# 2. El client, en otra terminal
cd client
npm install
npm run dev            # http://localhost:5173 (Vite le pasa /api al server)
```

## Pruebas

```bash
cd client && npm test
cd server && npm test
```

## Variables de entorno

**server/.env** (ver `server/.env.example`):

| Variable | Para qué sirve |
| --- | --- |
| `PUERTO` | Puerto del server (por defecto 3001) |
| `ORIGEN_PERMITIDO` | Dominio del client que puede llamar la API (CORS) |
| `SALTOS_PROXY` | Cuántos proxies hay delante del server. En Render o Railway normalmente es `1`; en local, `0` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USUARIO`, `SMTP_CLAVE` | Cuenta de correo que manda los mensajes. En producción son obligatorias: sin ellas el server no arranca |
| `CORREO_DESTINO` | A dónde llegan los mensajes (si no se pone, llegan a `SMTP_USUARIO`) |

**client** (opcional): `VITE_URL_API` es la URL del server cuando client y server se publican en dominios distintos.

## Antes del primer deploy

- Cambiar los datos de relleno de `client/src/data/contenido.ts` (correo, GitHub, LinkedIn) y los proyectos de ejemplo.
- Revisar la tarifa y la TRM de `client/src/data/cotizador.ts`.
