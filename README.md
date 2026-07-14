# Minders Credit - Arquitectura de Continuidad y Analíticas Estáticas Cross-Device

MindersCredit ha sido refactorizado como una **Single Page Application (SPA) 100% estática**, desplegable en GitHub Pages, libre de dependencias de servidores externos o bases de datos en la nube. Cuenta con una arquitectura robusta para la **unificación de usuarios multidispositivo en Amplitude** y la **continuidad de solicitudes** sin comprometer datos personales (PII-Safe).

---

## 🚀 Características Clave Implementadas

### 1. Unificación en Amplitude con Catálogo de Usuarios Demo (Sin Hash)
*   **Identificación Unificada**: Se reemplazó el antiguo generador de IDs aleatorios (`generateCustomerId`) por un catálogo estático (`DEMO_USERS`) que asocia a cada persona de prueba un `customer_id` fijo e inmutable.
*   Al iniciar sesión en cualquier navegador, teléfono o computadora, Amplitude asocia de forma determinista la sesión al mismo `customer_id`, unificando el journey del usuario entre dispositivos (web y mobile web) de forma transparente.
*   **Aislamiento de PII (PII-Safe)**: El `customer_id` y el RUT normalizado nunca se muestran en la interfaz de usuario ni se transmiten con datos personales legibles. El módulo `amplitudeService` filtra recursivamente nombres, correos, teléfonos y RUTs antes de cualquier despacho.

### 2. Continuidad Física de Solicitudes (Continuity Link)
Debido a que el sitio es 100% estático y opera de manera local:
*   **Continuity Link**: Implementa un mecanismo de continuidad física que codifica en Base64 el estado activo de la simulación de crédito (paso actual, parámetros calculados, montos e identificadores).
*   **Seguridad y Validación**: 
    *   Genera enlaces URL estructurados bajo el hash de la aplicación: `#/continue?handoff=PAYLOAD_BASE64`.
    *   **Expiración Automática**: El payload incluye marcas de tiempo con expiración obligatoria de 30 minutos.
    *   **Alineamiento de Identidad**: Al abrirse en el nuevo dispositivo, el sistema exige que el usuario inicie sesión y valida estrictamente que el `customer_id` de la simulación importada coincida con el usuario activo. Si no coincide, rechaza la importación con un mensaje claro en pantalla.
    *   **Taxonomía Analítica**: Registra con precisión los eventos `journey_handoff_created`, `journey_handoff_opened`, `journey_handoff_imported`, `journey_handoff_expired` y `cross_device_journey_resumed`.

### 3. Panel de Desarrollo Expandido (DevPanel)
Ubicado de forma flotante en la esquina inferior derecha, se expandió con las siguientes herramientas de monitoreo en tiempo real:
*   **Estado de Amplitude**: Indica visualmente en verde si el SDK está conectado y muestra el `customer_id` asignado actualmente.
*   **Simulador de Plataforma**: Botones de un solo clic para simular "Escritorio (Web)" o "Móvil (Mobile Web)", forzando la recarga y la actualización de los metadatos de Amplitude.
*   **Simulador de Dispositivo (Device Rotation)**: Permite simular un cambio físico de dispositivo al limpiar y regenerar la huella virtual del `installation_id`.
*   **Selector Rápido de Usuarios**: Login inmediato de Camila, Jorge o Rosa con un solo clic.
*   **Estado de Journeys (localStorage)**: Muestra en formato JSON interactivo los borradores de solicitudes activos almacenados en el disco local.
*   **Consola de Eventos Reales**: Un visor con los últimos 5 eventos trackeados en vivo con un badge verde parpadeante que certifica la captura del Replay.

---

## 🛠️ Estructura del Código Estático

*   `/src/data.ts`: Catálogo unificado de usuarios de prueba (`DEMO_USERS`).
*   `/src/services/amplitude.service.ts`: Integración segura con Amplitude SDK v2.x con filtro de PII recursivo y control de plataforma virtual.
*   `/src/services/auth.service.ts`: Proveedor de autenticación estática persistente sobre `localStorage` utilizando el catálogo cerrado.
*   `/src/services/journey.service.ts`: Controlador de progreso de solicitudes con persistencia en `localStorage` segmentada por `customer_id`.
*   `/src/components/ContinuityModal.tsx`: Componente modular para copiar enlaces de continuidad, códigos Base64 y realizar importaciones manuales.
*   `/src/components/DevPanel.tsx`: Panel flotante interactivo de testing.
*   `/vite.config.ts`: Configurado con `base: "/MindersCredit/"` para su correcta resolución de recursos estáticos en GitHub Pages.

---

## 👥 Catálogo de Usuarios de Prueba

Para las demostraciones y el testeo, puedes alternar de forma inmediata entre estos perfiles desde el **Minders Demo Panel** o iniciar sesión manualmente:

| Nombre | RUT Socio | Contraseña | customer_id Fijo | Perfil |
| :--- | :--- | :--- | :--- | :--- |
| **Camila Rojas** | `12.345.678-5` | `Demo1234` | `cust_demo_camila` | Socio Activo |
| **Jorge Fuentes** | `9.876.543-3` | `Demo1234` | `cust_demo_jorge` | Jubilado/Pensionado IPS (Tasa Preferencial 1.49%) |
| **Rosa Espinoza** | `15.678.901-2` | `Demo1234` | `cust_demo_rosa` | Socio Activo |

---

## 🧪 Pasos para probar el Escenario Cross-Device Continuity

1.  Abre el **Minders Demo Panel** en la esquina inferior derecha.
2.  Inicia sesión como **Camila Rojas** con un clic en el selector rápido.
3.  Simula la plataforma como **Móvil (Mobile Web)** (el panel recargará la página).
4.  Entra al simulador, ingresa un monto (ej: `$4.500.000`) y avanza al **Paso 2** (parámetros).
5.  Haz clic en el enlace "**Continuidad de dispositivo**" del banner o la cabecera.
6.  En el modal, haz clic en **Copiar Enlace** o **Copiar Código**.
7.  Simula un cambio de dispositivo en el panel de desarrollo:
    *   Haz clic en **Rotar ID Dispositivo** (recrea un identificador de hardware distinto).
    *   Cambia la plataforma a **Escritorio (Web)**.
8.  Pega el enlace en una nueva pestaña o abre el modal de continuidad, pega el código Base64 y presiona **Importar Progreso**.
9.  El sistema validará que sigas logueado como Camila, unirá el progreso y te redirigirá instantáneamente al paso exacto de la simulación con tus `$4.500.000` intactos.
10. La consola de eventos mostrará el trackeo de `cross_device_journey_resumed` registrando el cambio de plataformas origen y destino.

## 🧬 Demo Lab (Generador de Usuarios Sintéticos)
La aplicación cuenta con una vista interna  (accesible desde el footer) que permite generar flujos completos de usuarios sintéticos y enviarlos directamente a la HTTP API v2 de Amplitude. Esta herramienta es ideal para popular dashboards en demostraciones sin contaminar la sesión actual. Requiere configurar `VITE_AMPLITUDE_API_KEY` y `VITE_AMPLITUDE_DEPLOYMENT_KEY` (si aplica) en el archivo `.env.local`.

## 🧬 Demo Lab (Generador de Usuarios Sintéticos)
La aplicación cuenta con una vista interna `/demo-lab` (accesible desde el footer) que permite generar flujos completos de usuarios sintéticos y enviarlos directamente a la HTTP API v2 de Amplitude. Esta herramienta es ideal para popular dashboards en demostraciones sin contaminar la sesión actual. Requiere configurar `VITE_AMPLITUDE_API_KEY` y `VITE_AMPLITUDE_DEPLOYMENT_KEY` (si aplica) en el archivo `.env.local`.

---
## 📚 Taxonomía de Eventos Educa (Amplitude)
Se ha integrado el hub de educación financiera con su respectivo tracking para relacionar el consumo de contenido con la conversión a créditos:

**Eventos de Interacción:**
- `educa_hub_vista`
- `educa_contenido_iniciado`
- `educa_contenido_progreso` (25%, 50%, 75%)
- `educa_contenido_completado`
- `educa_modulo_leccion_completada`
- `educa_quiz_respondido`
- `educa_cta_producto_clic`

**Propiedades de Usuario (Identify):**
- `contenidos_educa_completados` (Incremento)
- `categorias_educa` (Array)
- `nivel_educacion_financiera` ("iniciado", "activo", "avanzado")

**Correlación en Journeys de Negocio:**
Todos los eventos de los journeys transaccionales incluyen:
- `leyo_contenido_educa` (booleano)
- `ultimo_contenido_educa` (string)
- `contenidos_educa_vistos` (número)

---
## 🧪 Checklist de Validación Post-Deploy (Amplitude)
1. **Eventos visibles en Live Events:** Ingresar a Amplitude Analytics > Live Events y confirmar que el flujo de eventos se está capturando (usando VITE_AMPLITUDE_API_KEY).
2. **Autocapture Funcionando:** Validar que los eventos como `[Amplitude] Page Viewed` y `[Amplitude] Element Clicked` llegan sin problemas y con la información de sesión.
3. **Session Replay Privado:** Visualizar una sesión grabada en la pestaña Session Replay y comprobar que los campos de RUT, Serie de Cédula y Clave aparezcan redactados y bloqueados por `data-amp-mask`.
4. **Experimentación:** En la consola, verificar el payload de inicialización y observar que `hero-cta-variant` retorne el variant correcto, así como la confirmación del evento de exposure en el stream del usuario.

---
## 🌐 GitHub Pages SPA Fallback
Se ha integrado el patrón [spa-github-pages](https://github.com/rafrex/spa-github-pages) para dar soporte al ruteo de frontend en GitHub Pages:
- `public/404.html`: Actúa como controlador de errores, capturando cualquier request directo de la web (e.g. `https://dominio.com/MindersCredit/ruta`), convirtiendo el path en query string y redireccionando.
- `index.html`: Restaura dinámicamente la URL en la barra del navegador usando `history.replaceState` y delegando el parseo al Router.
- Los enlaces de continuidad (`Continuity Link`) no son afectados y continúan operando con `#/continue?handoff=...`.
