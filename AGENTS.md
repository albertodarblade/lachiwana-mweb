# Lachiwana MWeb

This is a mobile web app built with **React 19**, **Framework7 9**, and **Vite 8**. Package manager is **pnpm**.

## Comandos
- `pnpm dev` — Iniciar servidor de desarrollo
- `pnpm build` — Build de producción
- `pnpm preview` — Preview del build

## Reglas de Contexto
- El backend vive en un repositorio hermano: `../Lachiwana-service`
- NO intentes escribir en el backend. Solo lectura para contexto adicional.
- Para leer archivos del backend, usa `Read` o `cat`.

## Stack
- **UI**: Framework7 9 (iOS/MD themes), Framework7 React bindings
- **State**: TanStack React Query 5 (con persistencia a localStorage)
- **Editor**: MDXEditor 3.55
- **Iconos**: Framework7 Icons, Lucide React
- **Enrutamiento**: Framework7 Router
- **Markdown**: react-markdown, remark-gfm, rehype-raw
- **Imágenes**: browser-image-compression
- **Prefijo de entorno**: `LACHIWANA_`

## Estructura
- `src/` — Código fuente de la app
- `public/` — Archivos estáticos (PWA, manifest, etc.)
- `specs/` — Especificaciones y planes de funcionalidades (Speck Kit)
- `.specify/` — Scripts de utilería del workflow Speck Kit

## Workflow Speck Kit
Este proyecto usa Speck Kit para gestión de funcionalidades. Los skills están en `.claude/skills/`. Los planes activos están en `specs/<feature-name>/plan.md`.

## Notas
- Sin TypeScript — JavaScript plano con JSX
- Sin Prettier, ESLint, o TSConfig configurados
- Sin pruebas configuradas
