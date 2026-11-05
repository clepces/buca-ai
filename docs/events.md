# Bus Central de Eventos y Reactividad Pub/Sub (B.U.C.A. AI)

> **Documento:** Especificación del Bus Central de Eventos del Core, Patrón Pub/Sub y Catálogo de Canales  
> **Versión:** 1.1.0  
> **Ubicación en Código:** `src/core/eventBus/index.js`  
> **Patrón Arquitectónico:** Publicador / Suscriptor Desacoplado con Map, Set, Comodines (*) y Middlewares

---

## 1. Filosofía y Gobernanza Reactiva

En la arquitectura de **B.U.C.A. AI**, ningún módulo, vista o componente gráfico invoca directamente métodos internos de otro componente. Toda la comunicación transversal (cambios de ruta en la SPA, control de layouts, apertura y cierre de modales, sincronización de tasas bi-monetarias, telemetría de GPU y autenticación) se realiza estrictamente a través del **EventBus Central**.

### Ventajas del Patrón en Nuestro Ecosistema:
1. **Desacoplamiento Absoluto:** Los módulos de negocio (`auth`, `workspace`, `inventory`, `pos`) pueden añadirse, removerse o refactorizarse sin quebrar el resto del sistema.
2. **Eliminación de Dependencias Circulares:** Los componentes de interfaz solo emiten o escuchan tópicos, sin conocer la instancia ni la implementación del receptor.
3. **Resiliencia y Tolerancia a Fallos:** Si un oyente arroja una excepción, el bucle protegido garantiza que los demás suscriptores continúen ejecutándose sin interrumpir la experiencia de usuario.

---

## 2. Capacidades y Mecanismos del EventBus Actual (`src/core/eventBus/index.js`)

El EventBus en producción implementa las siguientes capacidades de ingeniería:

* **Estructura en Memoria con `Map` y `Set`:** Los canales se almacenan en un `Map` nativo donde cada valor es un `Set` de callbacks únicos. Esto asegura una complejidad de desuscripción de $O(1)$ sin colisiones con `Object.prototype`.
* **Soporte de Comodines Multicanal (`*`):** Permite escuchar familias completas de eventos (ej. `eventBus.on('kernel:*', handler)` o `eventBus.on('ui:*', handler)`). El despachador compila patrones regex optimizados para notificar a los oyentes correspondientes.
* **Tuberías Interceptoras (Middlewares):** Mediante `eventBus.use(middleware)`, se pueden registrar interceptores globales para auditoría, telemetría o seguridad. Si un middleware retorna `false`, la emisión del evento se cancela de forma controlada.
* **Desuscripción Inmediata por Retorno:** Al invocar `eventBus.on(event, callback)`, el método devuelve una función de limpieza directa `() => eventBus.off(event, callback)`.
* **Protección de Envoltorio `once`:** Los suscriptores únicos vinculan la referencia original en `onceWrapper.originalListener`, permitiendo desuscribir un listener antes de que se dispare.
* **Telemetría de Rendimiento para 60 FPS:** Cada emisión mide el tiempo de respuesta con `performance.now()`. Si un suscriptor toma más de 16 ms en ejecutarse, el EventBus emite un aviso en consola (`[Performance Warning]`) para alertar sobre posible caída de cuadros (*jank*).
* **Emisión Asíncrona Concurrente (`emitAsync`):** Además de `emit(...)` síncrono, cuenta con `emitAsync(event, ...args)`, despachando promesas en paralelo mediante `Promise.all` con captura de excepciones asíncronas.
* **Purga Limpia (`clear`):** Permite vaciar todos los listeners y middlewares registrados durante reinicios del Kernel o cierres de sesión.

---

## 3. Catálogo Canónico de Canales Activos

### 3.1. Canales del Ciclo de Vida del Kernel (`kernel:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `kernel:boot:progress` | `BucaKernel` | `percent: number` | Preloader Splash | Actualiza la barra de progreso de inicialización (0% a 100%). |
| `kernel:ready` | `BucaKernel` | `{ timestamp: number }` | Overlays, Modales, Shell | Notifica que el bootstrap del núcleo ha concluido y revela la interfaz. |
| `kernel:layout-ready` | `BucaKernel` | `{ path: string, mode: string }` | Router SPA, Layouts | Confirma que los slots del layout (`MainLayout` o `AuthLayout`) están montados en el DOM. |

- [ ] **K.1.** *Desarrollo Futuro:* Implementar evento `kernel:reload` para reinicialización en caliente de servicios sin recarga física de página.
- [ ] **K.2.** *Desarrollo Futuro:* Incorporar canal `kernel:heartbeat` para monitoreo de estado de salud en segundo plano.

---

### 3.2. Canales de Navegación y Enrutador SPA (`router:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `router:navigate` | Botones, Enlaces, Dock | `{ path: string }` | `Router` | Solicita navegación SPA fluida sin refresco de página. |
| `router:before-change` | `Router` | `{ path: string, route: object }` | `BucaKernel`, Clientes HTTP | Notifica el inicio de transición de ruta para abortar peticiones pendientes (`AbortController`). |
| `router:changed` | `Router` | `{ path: string, route: object }` | Layouts, Ribbon, Widgets | Notifica que la nueva vista ha finalizado su montaje en el DOM. |
| `router:layout-sync-required` | `Router` | `{ layout: string }` | `BucaKernel` | Solicita intercambio estructural entre el layout inmersivo Auth y el ERP Shell. |

- [ ] **R.1.** *Desarrollo Futuro:* Canal `router:blocked` para prevenir navegación si el usuario tiene formularios con cambios sin guardar en el POS o inventario.
- [ ] **R.2.** *Desarrollo Futuro:* Canal `router:history-back` para soporte de botón atrás nativo en PWA móvil.

---

### 3.3. Canales de Autenticación y Seguridad (`auth:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `auth:login-success` | `AuthService` | `{ user: object }` | SessionState, Router | Acceso autorizado; actualiza perfil y redirige al Workspace. |
| `auth:login-failed` | `AuthService` | `{ error: object }` | `LoginForm` | Credenciales incorrectas o fallo de red; actualiza feedback visual. |
| `auth:register-success` | `AuthService` | `{ user: object }` | `RegisterPage`, Router | Registro exitoso de nuevo usuario en Firebase Auth. |
| `auth:register-failed` | `AuthService` | `{ error: object }` | `RegisterPage` | Notifica error de registro (ej. email en uso). |
| `auth:logout-success` | `AuthService` | `{}` | SessionState, Router | Cierre de sesión confirmado; purga tokens y storage local. |

- [ ] **A.1.** *Desarrollo Futuro:* Canal `auth:token-refreshed` para actualizar tokens JWT en segundo plano sin interrumpir turnos de venta.
- [ ] **A.2.** *Desarrollo Futuro:* Canal `auth:challenge-required` para disparo inmediato del modal de verificación 2FA ante dispositivos desconocidos.

---

### 3.4. Canales de Interfaz, Modales y Diálogos (`ui:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `ui:open_modal` | Botones, Tablas | `{ title, content, actions }` | `ModalService` | Despliega un diálogo modal genérico del sistema. |
| `ui:close_modal` | Tecla Esc, Botón Cerrar | `{}` | `ModalService` | Oculta el modal activo y restaura el scroll del documento. |
| `ui:toggle_theme` | Botón TopBar | `{}` | `ThemeManager` | Alterna entre tema claro y tema oscuro (Light/Dark). |
| `ui:open_rate` | TopBar Pill | `{}` | `RateManagementModal` | Abre la consola financiera y de ajuste de tasas de cambio. |
| `ui:open_performance` | Header / Atajo | `{}` | `PerformanceModal` | Despliega la consola de telemetría de GPU y control de perfiles BNE. |
| `ui:enter_business` | `BusinessHub` | `{ id: string }` | `Router`, Workspace | Ingresa a la gestión operativa de una unidad de negocio seleccionada. |
| `ui:open_create_business` | Tarjeta Create | `{}` | `BusinessWizardModal` | Dispara el modal asistente para registrar una nueva empresa. |
| `ui:open_profile` | Menú Usuario | `{}` | `Router` | Navega al perfil de usuario y configuración laboral. |
| `ui:open_security` | Menú Usuario | `{}` | `Router` | Navega a los controles de seguridad y dispositivos 2FA. |
| `ui:open_activity_log` | TopBar / Atajo | `{}` | Modal de auditoría | Abre la bitácora inmutable de eventos y transacciones. |
| `ui:open_billing` | Configuración | `{}` | Modal de planes | Despliega el gestor de suscripción del Owner (Spark, Silver, Gold). |
| `ui:open_terminal` | Atajo rápido | `{}` | Consola de comandos | Abre la terminal operativa rápida para comandos del ERP. |
| `ui:open_help` | Header / Footer | `{}` | Modal de soporte | Muestra el centro de ayuda y documentación rápida. |
| `ui:clear_notifications`| Panel notificaciones | `{}` | HUD, Store | Marca todas las notificaciones pendientes como leídas. |
| `ui:logout` | Botón Salir | `{}` | `AuthService` | Dispara el flujo de cierre de sesión global. |
| `ui:export_report` | Botones de reporte | `{ type: string }` | Generador de reportes | Solicita exportación de balance o inventario en CSV/PDF. |
| `ui:accordion:toggle` | Secciones colapsables | `{ id: string }` | Componente acordeón | Expande o colapsa un panel acordeón interactivo. |
| `ui:accordion:set_state`| Controladores | `{ id, state }` | Componente acordeón | Fija forzosamente el estado abierto/cerrado de un acordeón. |

- [ ] **U.1.** *Desarrollo Futuro:* Canal `ui:toast` para mostrar notificaciones flotantes transitorias no intrusivas en pantalla.
- [ ] **U.2.** *Desarrollo Futuro:* Canal `ui:context-menu` para menú contextual de clic secundario en el catálogo de productos y ventas.

---

### 3.5. Canales del Encabezado y Paneles Flotantes (`header:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `header:toggle_panel` | Botones TopBar | `{ panelId: string }` | `FloatingPanelManager` | Abre o cierra paneles flotantes (notificaciones, tasas, usuario). |
| `header:close_all_panels` | Clic exterior, Esc | `{}` | `FloatingPanelManager` | Cierra todos los paneles flotantes activos de forma simultánea. |
| `header:toggle_fullscreen`| Botón pantalla completa | `{}` | `TopBar` | Alterna la visualización del navegador en modo pantalla completa. |

- [ ] **H.1.** *Desarrollo Futuro:* Canal `header:search-shortcut` para sincronizar atajo `Ctrl + K` con el input de búsqueda del header.

---

### 3.6. Canales del Espacio de Trabajo (`workspace:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `workspace:toggle_search` | Lupa, Atajo `Ctrl+K` | `{ active: boolean }` | `WidgetGrid`, TopBar | Despliega o contrae el buscador neural global de negocios y productos. |
| `workspace:filter_context` | Pills de contexto | `{ filter: 'all' \| 'properties' \| 'collaborations' }` | `BusinessHub` | Filtra el carrusel entre "Mis Propiedades" (Owner) y "Mis Colaboraciones" (Worker). |
| `workspace:refresh_data` | Botón refrescar | `{}` | `WorkspacePage` | Fuerza la revalidación y recarga de métricas del dashboard. |

- [ ] **W.1.** *Desarrollo Futuro:* Canal `workspace:mode-switched` para notificar la transición instantánea entre modo Owner y modo Worker (Modo Espejo).
- [ ] **W.2.** *Desarrollo Futuro:* Canal `workspace:quick-sale` para invocar la venta express directamente desde el dashboard.

---

### 3.7. Canales del Motor Gráfico y Rendimiento (`engine:*` y `graphics:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `engine:profile_selected` | `PerformanceModal` | `{ profile: 'L0' \| 'L1' \| 'L2' \| 'L3' }` | `GraphicsEngine` | Aplica un perfil gráfico específico manualmente. |
| `engine:recalibrate` | Atajo, Modal | `{}` | `BucaNeuralEngine` | Fuerza una nueva prueba de benchmarking de hardware para reasignar tier. |
| `graphics:tier-changed` | `GraphicsEngine` | `{ tier, id, isLowPerf }` | `ResourceThrottle`, UI | Notifica cambio de nivel gráfico para habilitar o deshabilitar efectos de cristal. |
| `buca:perf_critical` | `FPSMonitor` | `{ fps: number }` | `GraphicsEngine` | Dispara auto-degradación de emergencia ante caídas sostenidas por debajo de 30 FPS. |
| `buca:drp_pause_polling` | `ResourceThrottle` | `{ critical: boolean }` | `BaseClient` | Suspende peticiones de red y polling no esenciales durante estrés gráfico alto. |

- [ ] **E.1.** *Desarrollo Futuro:* Canal `engine:gpu-recovered` para restaurar efectos de desenfoque al detectar estabilización sostenida a 60 FPS.

---

### 3.8. Canales Financieros y Notificaciones (`buca:*` y `notifications:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `buca:rate_change` | `RateModal`, Cloud Function | `{ rate: number, source: string, timestamp: number }` | TopBar, POS, Widgets | Notifica la actualización de la tasa oficial BCV a todos los componentes bi-monetarios. |
| `notifications:push` | Modales, Servicios, API | `{ title: string, message: string, type: string }` | `NotificationService` | Dispara el flujo Dual-Dispatch (Toast HUD + Persistencia Firestore). |
| `ui:notification_hud` | `NotificationService` | `{ title: string, message: string, type: string }` | `HUDFeedbackManager` | Despliega alerta visual toast efímera de 4s en pantalla. |
| `notifications:updated` | `NotificationService` | `items: array` | TopBar, `NotificationTray` | Actualiza en tiempo real las notificaciones y badges del shell. |
| `notifications:mark_as_read` | Elemento bandeja / Botón | `{ id: string }` | `NotificationService` | Registra el UID actual en el arreglo read_by de Firestore. |
| `ui:clear_notifications` | Botón bandeja | `{}` | `NotificationService` | Marca masivamente como leídas todas las alertas pendientes del usuario. |
| `tray:filter_tab` | Tabs de bandeja | `{ tab: string }` | `NotificationTray`, TopBar | Filtra la vista entre Todas, No leídas y Sistema. |

- [ ] **F.1.** *Desarrollo Futuro:* Canal `buca:rate_spread_alert` para emitir alerta sonora/visual si la brecha cambiaria supera el 10%.
- [ ] **F.2.** *Desarrollo Futuro:* Canal `buca:stock_critical` para notificar que un lote de inventario ha alcanzado existencias mínimas.

---

## 4. Próximas Mejoras Estratégicas para el EventBus

Para continuar robusteciendo el bus de eventos en las próximas fases del proyecto:

- [ ] **EB.1. Registro de Auditoría Inmutable:** Crear un middleware nativo que intercepte todos los eventos `auth:*`, `buca:rate_change` y `workspace:*` para grabarlos en la colección `/activity_log` de Firestore.
- [ ] **EB.2. Cola de Eventos Offline (Replay Queue):** Si el navegador pierde la conexión a internet, encolar los eventos transaccionales en `IndexedDB` y retransmitirlos automáticamente cuando retorne la red.
- [ ] **EB.3. Time-Travel Debugging en Desarrollo:** Almacenar los últimos 100 eventos emitidos en un buffer circular en memoria para depuración desde la consola de desarrollador mediante `window.__BUCA_EVENT_HISTORY__`.
- [ ] **EB.4. Throttling Declarativo por Evento:** Permitir configurar opcionalmente un debounce o throttle nativo al suscribirse: `eventBus.on('window:resize', handler, { throttle: 150 })`.
