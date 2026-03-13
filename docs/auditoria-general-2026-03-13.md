# Auditoria general del proyecto (2026-03-13)

## Resumen ejecutivo
- Proyecto base: Next.js + TypeScript + Prisma + SQLite.
- Estado tecnico para pruebas: parcial.
- Bloqueadores actuales:
  - Lint falla por incompatibilidad/configuracion ESLint.
  - Build falla en inicializacion de Prisma (constructor validation error) durante la ruta `/api/quotes`.

## Mapeo del repositorio (sin node_modules, .next, .git)
- Total archivos fuente/relevantes: 91
- Distribucion por nivel superior:
  - src: 67
  - prisma: 3
  - public: 1
  - docs: 1
  - raiz (config + metadatos): 19

## Mapeo interno de src
- src/components: 39
- src/app: 17
- src/lib: 5
- src/ai: 4
- src/hooks: 2

## Duplicados y consistencia
- Duplicado detectado historicamente: `src/.gitignore` (aparece como eliminado en estado git, que es correcto para consolidar en raiz).
- `.gitignore` raiz fue consolidado para eliminar bloques repetidos y reglas conflictivas.
- Repeticiones por nombre como `page.tsx`, `layout.tsx`, `route.ts` son esperadas por App Router de Next.js.

## Archivos potencialmente innecesarios o locales
- `.modified`: archivo vacio, no funcional para ejecucion.
- `dev.db`: base SQLite local de desarrollo (no se versiona).
- `tsconfig.tsbuildinfo`: cache local de TypeScript (no se versiona).

## Estado de chequeos tecnicos
- `npm run typecheck`: OK
- `npm run lint`: FAIL (error circular JSON desde `.eslintrc.json`/tooling)
- `npm run build`: FAIL (PrismaClientConstructorValidationError en `/api/quotes`)

## Recomendacion para iniciar pruebas
1. Resolver lint (alinear version de `eslint-config-next` con `next` o migrar a ESLint CLI).
2. Resolver inicializacion Prisma para build (adaptador o configuracion de engine compatible con Prisma 7).
3. Ejecutar baseline:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
   - `npm run dev`
4. Iniciar smoke test manual:
   - `/`
   - `/cotizar`
   - `/login`
   - `/admin`
   - `POST /api/quotes`
   - `POST /api/auth/login`

## Riesgos actuales
- Sin build exitoso no hay garantia de despliegue estable.
- Sin lint operativo, aumenta riesgo de regresiones de estilo y errores de calidad.
