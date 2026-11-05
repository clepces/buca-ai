# Arquitectura y Árbol de Directorios Maestro (B.U.C.A. AI)

> **Documento:** Estándar de Estructura y Organización del Código Fuente  
> **Versión:** 1.0.0-Alpha (Sincronizado)  
> **Ámbito:** Frontend Modular Vanilla JS (ES6+), SASS y Arquitectura Clean Core

---

## 1. Principios de Gobernanza Estructural

1. **Vanilla JS Modular (Cero Frameworks):** Prohibido el uso de React, Vue, Svelte, Angular o wrappers de componentes externos. Toda la reactividad, renderizado de componentes y manipulación del DOM se realiza con ES6+ Vanilla, Template Literals y Web Components nativos.
2. **Límite de Líneas por Archivo:** Ningún archivo de código fuente (`.js`, `.scss`) debe exceder las **300 líneas de código**. Si un módulo sobrepasa este límite, debe subdividirse en controladores, adaptadores o servicios especializados.
3. **Nomenclatura Kebab-Case Obligatoria:** Todos los nombres de carpetas y archivos nuevos deben escribirse estrictamente en minúsculas y separados por guiones (ej. `module-placeholder-page.js`, `rate-modal.js`, `user-controller.js`).
4. **Protección del Workspace Compilado:** Queda estrictamente prohibido editar manualmente archivos dentro de `/dist`. Todo el trabajo se realiza en `/src` y se compila mediante Vite.
5. **Aislamiento en Tres Capas (Clean Core):**
   * **`Core` (`src/core/`):** El motor base del sistema (arranque, enrutador, bus de eventos, cliente de red, persistencia, seguridad y motor gráfico BNE). No contiene vistas de negocio directas.
   * **`Modules` (`src/modules/`):** Módulos de dominio empresarial desacoplados (`auth`, `business`, `finance`, `workspace`, `profile`, `sandbox`).
   * **`Shared` (`src/shared/`):** Componentes visuales transversales, layouts de aplicación, modales globales, estado compartido, utilidades y hojas de estilo SCSS.

---

## 2. Estructura Obligatoria de Cada Módulo

Cada dominio de negocio dentro de `src/modules/` debe mantener la siguiente anatomía de carpetas estandarizada:

```text
[modulo]/
  ├── index.js          # Punto de entrada y registro del módulo en el Kernel
  ├── routes.js         # Definición de rutas específicas del módulo
  ├── components/       # Componentes reusables de interfaz (UI)
  ├── logic/            # Reglas de negocio, cálculos y controladores
  ├── pages/            # Vistas principales del módulo
  ├── styles/           # Archivos .scss locales del módulo
  ├── services/         # Llamadas a Firebase Firestore / Auth o APIs externas
  └── constants/        # Constantes, configuraciones y enumeradores locales
```

---

## 3. Árbol de Directorios Maestro

```text
buca-system/
├── AGENTS.md                      # Directivas maestras para agentes de IA (Google AI Studio, Antigravity)
├── index.html                     # App Shell y contenedor raíz SPA (#app)
├── vite.config.js                 # Configuración de compilación Vite y Rollup manualChunks
├── package.json                   # Dependencias de producción y scripts de auditoría/build
├── jsconfig.json                  # Mapeo de rutas estáticas y alias (@/ -> src/*)
├── eslint.config.js               # Configuración de ESLint flat para Vanilla JS
├── postcss.config.js              # Pipeline de PostCSS con Autoprefixer
├── .markuplintrc                  # Reglas de auditoría para HTML5 semántico
├── .stylelintrc.json              # Configuración de Stylelint para arquitectura SASS
├── .gitignore                     # Exclusión de artefactos, caches, dependencias y .env
├── firebase-applet-config.json    # Credenciales y configuración del proyecto Firebase (buca-scdbs)
├── firebase-blueprint.json        # Esquema blueprint de la infraestructura Firebase
├── firestore.rules                # Reglas de seguridad declarativas de Cloud Firestore
├── .agents/                       # Reglas maestras de agentes de IA
│   ├── readme.md                  # Índice corporativo de directivas
│   └── rules/                     # Reglas específicas por rol
│       ├── architect.md           # Estándares de ingeniería y Cero Frameworks
│       ├── designer.md            # BNE, glassmorphism, densidad ERP y z-index
│       ├── database-rules.md      # Firestore v4.1.0 y Snapshot Pattern
│       ├── cost-guard.md          # Políticas Spark Plan $0.00
│       └── cloud-functions.md     # Serverless, cold starts y límites de memoria
├── docs/                          # Documentación técnica corporativa
│   ├── readme.md                  # Visión general, slogan y filosofía de roles
│   ├── structure.md               # Árbol maestro y reglas de código
│   ├── api.md                     # Contratos de red y servicios externos
│   ├── components.md              # Catálogo de componentes visuales modulares
│   ├── database.md                # Esquema Firestore v4.1.0 y colecciones
│   ├── domain-logic.md            # Reglas de negocio bi-monetarias y de inventario
│   ├── events.md                  # Especificación del Bus de Eventos Pub/Sub
│   ├── interface.md               # Diseño Glassmorphism, SASS y correcciones responsivas
│   └── migration-roadmap.md       # Hoja de ruta y etapas de desarrollo
├── src/
│   ├── main.js                    # Bootstrap inicial y arranque del Kernel
│   │
│   ├── core/                      # NÚCLEO DEL SISTEMA (CORE KERNEL)
│   │   ├── kernel.js              # Orquestador maestro del ciclo de vida y preloader
│   │   ├── ModuleLoader.js        # Cargador asíncrono dinámico de módulos
│   │   ├── index.js               # Barrel export de servicios principales del Core
│   │   ├── api/                   # Clientes de red y comunicación
│   │   │   ├── BaseClient.js      # Cliente fetch con soporte AbortController y timeouts defensivos
│   │   │   ├── http.js            # Wrapper HTTP unificado para peticiones REST
│   │   │   └── endpoint.js        # Catálogo centralizado de endpoints y URLs de red
│   │   ├── config/                # Configuraciones maestras del sistema
│   │   │   ├── config.js          # Constantes globales y flags de entorno ENV
│   │   │   ├── environment.js     # Detección de host, IPs locales y variables Vite
│   │   │   ├── firebase.js        # Inicialización de Firebase SDK (Firestore, Auth, Functions)
│   │   │   └── permissions.js     # Mapa de claims granulares y validación de roles
│   │   ├── engine/                # BUCA NEURAL ENGINE (Motor Gráfico y Optimización)
│   │   │   ├── engine.js          # Fachada central del motor gráfico
│   │   │   ├── graphics.js        # Gestor de perfiles y observadores de rendimiento
│   │   │   ├── monitors/          # Monitores de hardware
│   │   │   │   ├── FPSMonitor.js      # Medidor de cuadros por segundo y cálculo de latencia
│   │   │   │   ├── ThermalGuard.js    # Detección de caídas sostenidas y degradación preventiva
│   │   │   │   └── MemoryGuard.js     # Vigilancia de JS Heap y límites de nodos DOM
│   │   │   ├── profiles/          # Perfiles de renderizado L0 (Eco), L1 (Balanced), L2 (Pro) y L3 (Ultra)
│   │   │   ├── safety/            # Mecanismos de seguridad gráfica
│   │   │   │   ├── ReflowGuard.js     # Prevención de layout thrashing y reflows forzados
│   │   │   │   └── GhostSanitizer.js  # Purga y desconexión de nodos huérfanos del DOM
│   │   │   ├── services/          # Servicios auxiliares de GPU
│   │   │   │   ├── HUDFeedbackManager.js # Indicadores y telemetría visual en pantalla
│   │   │   │   └── ResourceThrottle.js   # Suspensión de tareas pesadas durante estrés gráfico
│   │   │   └── utils/             # Utilidades de hardware
│   │   │       └── hardwareDetector.js   # Detección de GPU (WebGL vendor/renderer) y cores
│   │   ├── eventBus/              # BUS CENTRAL DE EVENTOS
│   │   │   └── index.js           # Implementación activa del EventBus (Map/Set, comodines *, middlewares use)
│   │   ├── lifecycle/             # GESTIÓN DEL CICLO DE VIDA
│   │   │   └── LifecycleManager.js# Ciclo de vida de módulos y hooks de montaje/desmontaje
│   │   ├── router/                # ENRUTADOR SPA NATIVO
│   │   │   ├── router.js          # Manejador del History API y transiciones suaves
│   │   │   ├── routes.js          # Mapa base y registro canónico de rutas
│   │   │   ├── guards.js          # Guardias de autenticación y permisos de acceso
│   │   │   └── RouteConfig.js     # Metadatos y configuración de rutas
│   │   ├── security/              # SEGURIDAD Y HUELLA DIGITAL
│   │   │   ├── CryptoWrapper.js   # Cifrado defensivo para almacenamiento local
│   │   │   ├── DeviceFingerprint.js # Generación de huella digital de navegador SHA-256
│   │   │   └── TOTPService.js     # Gestión de códigos de seguridad temporal 2FA
│   │   ├── services/              # SERVICIOS GLOBALES DEL KERNEL
│   │   │   ├── ActionDispatcher.js# Despachador de acciones desacopladas
│   │   │   ├── DolarVzlaService.js# Sincronizador de tasas cambiarias oficiales (BCV / Paralelo)
│   │   │   ├── KeyboardShortcuts.js # Atajos globales de teclado (Ctrl+K, Escape)
│   │   │   ├── NotificationService.js # Despacho de alertas y notificaciones transaccionales
│   │   │   ├── SearchService.js   # Motor de búsqueda global omnibox
│   │   │   └── ThemeManager.js    # Gestor de temas claro / oscuro y sincronización
│   │   ├── state/                 # ESTADO REACTIVO DEL NÚCLEO
│   │   │   ├── BaseState.js       # Clase base observable con batching rAF
│   │   │   ├── global.js          # Estado global de tasas y configuración
│   │   │   ├── session.js         # Estado reactivo de sesión de usuario y tokens
│   │   │   ├── ui.js              # Estado reactivo de interfaz, modales y motor gráfico
│   │   │   └── store.js           # Store unificado del sistema
│   │   └── storage/               # PERSISTENCIA LOCAL
│   │       ├── StorageAdapter.js  # Conmutador dinámico transparente entre Local e IndexedDB
│   │       ├── PerformanceStorage.js # Persistencia de métricas y perfiles de hardware
│   │       └── drivers/           # Controladores de bajo nivel
│   │           ├── LocalDriver.js     # Controlador nativo de LocalStorage
│   │           └── IndexedDBDriver.js # Controlador asíncrono IndexedDB
│   │
│   ├── modules/                   # MÓDULOS DE NEGOCIO (CARGA DINÁMICA)
│   │   ├── auth/                  # MÓDULO DE AUTENTICACIÓN
│   │   │   ├── index.js           # Registro y bootstrap del módulo
│   │   │   ├── routes.js          # Rutas (/auth/login, /auth/register, /auth/pin, etc.)
│   │   │   ├── components/        # LoginForm, PINForm, DeviceChallenge, SessionDashboard
│   │   │   ├── constants/         # auth.constants.js
│   │   │   ├── logic/             # AuthValidator.js, SessionManager.js
│   │   │   ├── pages/             # LoginPage, RegisterPage, RecoveryPage, ProfilePage, SettingsPage
│   │   │   ├── schemas/           # userProfileSchema.js (validación Zod)
│   │   │   ├── services/          # AuthService.js, FirebaseProvider.js, UserService.js
│   │   │   └── styles/            # auth.scss y parciales (_auth_base, _auth_forms, etc.)
│   │   │
│   │   ├── business/              # MÓDULO DE NEGOCIOS Y ESPACIOS
│   │   │   ├── index.js           # Registro y bootstrap del módulo
│   │   │   ├── BusinessWizardController.js # Controlador del asistente de nuevo negocio
│   │   │   ├── components/        # BusinessHub.js, BusinessWizardModal.js
│   │   │   ├── services/          # BusinessRepository.js
│   │   │   └── styles/            # _business.scss
│   │   │
│   │   ├── finance/               # MÓDULO DE FINANZAS Y TASAS CAMBIARIAS
│   │   │   ├── index.js           # Registro del módulo de finanzas
│   │   │   ├── components/        # RateManagementModal.js
│   │   │   ├── controllers/       # RateController.js
│   │   │   ├── services/          # FinanceRepository.js
│   │   │   └── styles/            # _finance.scss
│   │   │
│   │   ├── profile/               # MÓDULO DE PERFIL DE USUARIO
│   │   │   ├── index.js           # Registro del módulo de perfil
│   │   │   ├── components/        # Subcomponentes y pestañas (ProfileHero, ProfileGeneralTab, etc.)
│   │   │   ├── services/          # ProfileService.js
│   │   │   └── templates/         # _user_profile.js
│   │   │
│   │   ├── sandbox/               # MÓDULO EXPERIMENTAL / LABORATORIO
│   │   │   ├── SandboxController.js # Controlador de pruebas
│   │   │   └── components/        # ExperimentalDock.js
│   │   │
│   │   └── workspace/             # MÓDULO DE ESPACIO DE TRABAJO (ERP SHELL)
│   │       ├── index.js           # Registro y bootstrap del Workspace
│   │       ├── routes.js          # Rutas del ERP (/workspace, /clients, /inventory, /pos, etc.)
│   │       ├── components/        # Banner, PerformanceD3Dashboard, QuickActions, RecentActivity, etc.
│   │       ├── constants/         # workspace.constants.js
│   │       ├── logic/             # FinanceManager.js, WidgetOrchestrator.js
│   │       ├── pages/             # DashboardPage.js, WorkspacePage.js, module-placeholder-page.js
│   │       ├── services/          # BusinessService.js
│   │       ├── styles/            # workspace.scss y parciales (_telemetry, _banner, etc.)
│   │       └── templates/         # _export_report.js, _performance.js
│   │
│   └── shared/                    # RECURSOS TRANSVERSALES COMPARTIDOS
│       ├── hooks/                 # useBNE.js, useModal.js
│       ├── pages/                 # Páginas de error SPA (Error401, Error403, Error404, Error500, Error503)
│       ├── state/                 # Barrel export del Reactive State Store
│       ├── styles/                # ARQUITECTURA SASS MODULAR
│       │   ├── main.scss          # Punto de entrada global de estilos SASS
│       │   ├── vendor/            # _bootstrap.scss
│       │   └── neural/            # Sistema de diseño "Corporate Hybrid Glass"
│       │       ├── abstracts/     # _variables.scss, _mixins.scss, _functions.scss
│       │       ├── base/          # _reset.scss, _global.scss, _preloader.scss, _responsive.scss
│       │       ├── components/    # Botones, tarjetas, modales, huds, docks, tickers, widgets
│       │       ├── layout/        # Header, dock, footer, workspace grid y telemetría
│       │       ├── themes/        # _index.scss, _eco-mode.scss (L0)
│       │       └── utilities/     # Helpers visuales y utilidades
│       ├── ui/                    # COMPONENTES VISUALES COMPARTIDOS
│       │   ├── layouts/           # MainLayout.js, AuthLayout.js y subcomponentes (TopBar, DockableNavbar)
│       │   ├── components/        # LanguagePanel, NotificationsPanel, ProfilePanel, NotificationTray, SkeletonLoader
│       │   ├── overlays/          # EmulatorModal.js, ModalService.js, SystemOverlay.js
│       │   ├── services/          # FloatingPanelManager.js, ModalService.js
│       │   ├── templates/         # ModalTemplates.js y modales (_business_wizard, _settings, _system_modals)
│       │   └── widgets/           # WidgetTemplate.js
│       └── utils/                 # UTILIDADES GLOBALES
│           ├── debounce.js        # Limitador de frecuencia para eventos de alta tasa
│           ├── formatters.js      # Formateadores monetarios (USD/VES) y de fecha
│           ├── haptics.js         # Feedback háptico de vibración para dispositivos táctiles
│           ├── logger.js          # Logger estructurado con niveles de severidad
│           ├── performance.js     # Mediciones de tiempo de ejecución
│           ├── security.js        # Sanitización anti-XSS y validación de entradas
│           ├── touchGestures.js   # Detección de gestos táctiles (swipe, pinch)
│           └── validators.js      # Validadores universales de esquema y datos
```

---

## 4. Convenciones de Código y Estilo

* **Variables y Funciones:** `camelCase` (ej. `syncGraphicsUI`, `handleLayoutSync`).
* **Clases y Constructores:** `PascalCase` (ej. `GraphicsEngine`, `BaseClient`, `Router`).
* **Archivos y Directorios:** `kebab-case` (ej. `module-placeholder-page.js`, `storage-adapter.js`).
* **Constantes Globales:** `UPPER_SNAKE_CASE` (ej. `DEFAULT_CONFIG`, `STORAGE_KEYS`).
* **Atributos de Datos para Acciones:** `data-action="modulo:accion"` (ej. `data-action="workspace:scroll_carousel"`, `data-action="ui:open_modal"`).
* **Atributos de Rendimiento:** `data-buca-perf="L0|L1|L2|L3"` para controlar el nivel gráfico de la GPU.
