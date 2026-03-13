
# Cotizador Inteligente para A&V Alturas

## Características Principales

### Portal de Clientes
- **Flujos de Cotización Dinámicos:** La interfaz se adapta inteligentemente según el tipo de cliente y servicio seleccionado (ej. "Pintar mi Hogar" vs. "Remodelación de Edificio"), mostrando únicamente los campos relevantes para cada caso.
- **Formulario Multi-paso:** Un proceso de cotización guiado que divide la recolección de información en pasos lógicos (Datos de Contacto, Detalles de la Propiedad, Especificaciones del Servicio), mejorando la usabilidad.
- **Diseño Responsivo:** Interfaz completamente funcional y estéticamente agradable tanto en dispositivos de escritorio como móviles, garantizando una experiencia de usuario consistente.
- **Componentes Visuales Interactivos:** Uso de tarjetas y selectores visuales para hacer el proceso de selección de servicios más intuitivo.

### Panel de Administración
- **Dashboard Centralizado:** Una vista principal con estadísticas clave y resúmenes de la actividad de la plataforma (ej. cotizaciones generadas, clientes activos).
- **Gestión de Servicios:** Interfaz para que los administradores puedan añadir, editar y gestionar los servicios ofrecidos por la empresa.
- **Historial de Cotizaciones y Clientes:** Secciones dedicadas para visualizar y administrar la información de los clientes y las cotizaciones generadas.
- **Interfaz Moderna y Profesional:** Construido con un sistema de diseño basado en componentes que incluye una barra lateral colapsable y una experiencia móvil optimizada.
- **Autenticación Demo:** 

- Usuario: demo Contraseña: demo

## Stack Tecnológico

- **Framework:** **Next.js 15** (con App Router) para renderizado del lado del servidor (SSR), component-based architecture y un rendimiento optimizado.
- **Lenguaje:** **TypeScript** para un código más robusto, mantenible y con tipado estático.
- **UI & Styling:**
  - **ShadCN UI:** Colección de componentes de alta calidad, accesibles y personalizables.
  - **Tailwind CSS:** Framework CSS utility-first para un diseño rápido y consistente.
- **Iconos:** **Lucide Icons**, una biblioteca de íconos moderna y ligera.
- **Gestión de Formularios y Estado:**
  - **React Hook Form & Zod:** Para la gestión eficiente y validación robusta de formularios.
- **Hosting:** Diseñado para ser desplegado en **Vercel** o **Firebase App Hosting**.

## Backend y Persistencia

- **Base de datos:** PostgreSQL gestionado con Prisma ORM.
- **Autenticación Admin:** sesión con cookie `httpOnly` firmada en servidor.
- **Flujos activos:**
  - Registro de cotizaciones desde `/cotizar`.
  - Visualización de cotizaciones y clientes en `/admin`.
  - Respuesta y cierre de cotizaciones desde el panel admin.

### Variables de entorno requeridas

Crear (o actualizar) el archivo `.env` con:

```env
DATABASE_URL="postgresql://usuario:password@host:5432/db?sslmode=require"
AUTH_SECRET="cambia-esta-clave-secreta"
ADMIN_USERNAME="demo"
ADMIN_PASSWORD="demo"
```

### Comandos iniciales del backend

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Prisma aplica las migraciones en `prisma/migrations` sobre la base PostgreSQL configurada en `DATABASE_URL`.

### Despliegue en Vercel (con backend)

Para Vercel **Production**, usa base de datos PostgreSQL gestionada.

Variables obligatorias en Vercel:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="clave-larga-y-segura"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="clave-segura"
```

El proyecto incluye `vercel-build`, que valida entorno y ejecuta migraciones Prisma antes del build:

```bash
npm run vercel-build
```

Paso a paso sugerido:
- Configura variables en Vercel (Preview y Production).
- Haz push a la rama principal.
- Verifica en logs que `npm run vercel-build` termine en verde.
- Prueba en URL desplegada: `/cotizar`, `/login`, `/admin/quotes`, `/admin/customers`.

### Pruebas y calidad (recomendado antes de cada release)

```bash
npm run typecheck
npm run lint
npm run build
```

### Prueba E2E del flujo critico (cotizar + admin)

Primera vez en tu maquina:

```bash
npx playwright install chromium
```

Ejecucion:

```bash
npm run test:e2e
```

La suite E2E levanta la app en local, aplica migraciones Prisma y valida:
- Envio de cotizacion desde `/cotizar`.
- Inicio de sesion de administrador.
- Visualizacion de la nueva cotizacion en `/admin/quotes`.

---

Desarrollado por Jean Pérez - SMARTSYS
