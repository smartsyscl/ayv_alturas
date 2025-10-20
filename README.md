
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

---

### Guía para Subir el Proyecto a GitHub

Sigue estos pasos para guardar tu código en un repositorio de GitHub.

1.  **Crear un Nuevo Repositorio en GitHub:**
    *   Ve a [github.com](https://github.com) y accede a tu cuenta.
    *   Haz clic en el botón `+` en la esquina superior derecha y selecciona `New repository`.
    *   Dale un nombre a tu repositorio (ej. `cotizador-alturas`), elige si será público o privado y haz clic en `Create repository`. **Importante:** No inicialices el repositorio con un `README` o `.gitignore` desde GitHub, ya que tú subirás los archivos existentes.

2.  **Conectar tu Proyecto Local con GitHub:**
    *   En la terminal de VS Code, ejecuta los siguientes comandos uno por uno. Reemplaza `<tu-usuario>` y `<nombre-del-repositorio>` con tu nombre de usuario y el nombre que le diste al repositorio en GitHub.

    *   **Inicializa Git en tu proyecto (si no lo has hecho):**
        ```bash
        git init
        git add .
        git commit -m "Commit inicial: Configuración del proyecto"
        ```

    *   **Conecta tu repositorio local al remoto:**
        ```bash
        git branch -M main
        git remote add origin https://github.com/<tu-usuario>/<nombre-del-repositorio>.git
        ```

    *   **Sube tu código a GitHub:**
        ```bash
        git push -u origin main
        ```

¡Listo! Ahora tu código está guardado en GitHub y puedes seguir haciendo `commits` y `push` a medida que avanzas en el desarrollo.

---

Desarrollado por Jean Pérez - SMARTSYS
