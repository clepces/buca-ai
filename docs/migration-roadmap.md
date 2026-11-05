# Hoja de Ruta de Desarrollo, Migración y Producción (B.U.C.A. AI)

> **Documento:** Plan Estratégico de Hitos de Ingeniería, Estabilización y Despliegue  
> **Versión:** 1.1.0  
> **Estado:** Fase Alpha/RC Completada — En Proceso de Conexión Live y Módulos Operativos  
> **Ámbito:** Frontend Modular Vanilla JS (ES6+), SASS, Firebase Firestore & Auth, PWA

---

## 1. Historial de Hitos Completados (Estabilización del Core)

### [HITO 0] Diagnóstico y Estabilización de Compilación Vite 8
- [x] **0.1.** Resolución de dependencias críticas en `package.json` (`sass-embedded`, `vite` 8 y `postcss`).
- [x] **0.2.** Corrección de retorno en `CryptoWrapper.js` y estabilización del ciclo de vida de sesión en cliente.
- [x] **0.3.** Generación de informes diagnósticos de arquitectura y estado inicial del repositorio.

---

### [HITO 1] Enrutamiento SPA y Accesibilidad WCAG (v0.2.0-alpha)
- [x] **1.1.** Creación de vistas procedurales dinámicas en `ModulePlaceholderPage.js` para rutas huérfanas (`/clients`, `/inventory`, `/pos`, `/users`, `/roles`, `/teams`).
- [x] **1.2.** Conmutación dinámica y transparente de `StorageAdapter.js` entre `LocalStorage` e `IndexedDB`.
- [x] **1.3.** Incorporación de atributos estándar de accesibilidad (`autocomplete`, `aria-label`, etiquetas semánticas) en formularios de autenticación.

---

### [HITO 2] UI & Estandarización de Tokens Gráficos (v0.3.0-alpha)
- [x] **2.1.** Normalización estricta de la escala de capas `z-index` (Header: 100, Huds: 500, Dock: 1000, Modales: 3000-3100, Toasts: 5000).
- [x] **2.2.** Condicionamiento de filtros gráficos pesados `backdrop-filter: blur(...)` según el perfil activo `[data-buca-perf="L0"]` para garantizar 60 FPS en hardware estándar.
- [x] **2.3.** Corrección de iconos rotos mediante vectores SVG nativos y clases de Bootstrap Icons.

---

### [HITO 3] UX, IxD y Navegación por Teclado (v0.4.0-alpha)
- [x] **3.1.** Implementación de gestos táctiles nativos pasivos (swipe con umbral de 8px) en el carrusel de negocios `BusinessHub.js`.
- [x] **3.2.** Integración de atajos de teclado globales (`Ctrl + K` / `Cmd + K` para búsqueda neural y tecla `Escape` para cierre de cualquier diálogo modal).
- [x] **3.3.** Optimización de eventos táctiles para evitar activaciones accidentales durante el desplazamiento horizontal en dispositivos móviles.

---

### [HITO 4] Fugas de Memoria y Ciclos de Desmontaje (v0.5.1-alpha)
- [x] **4.1.** Cancelación estricta de peticiones de animación `requestAnimationFrame` y timers huérfanos en `FPSMonitor.js` y `GhostSanitizer.js`.
- [x] **4.2.** Desconexión controlada de nodos huérfanos del DOM en `GraphicsEngine.js` y en la destrucción de layouts.
- [x] **4.3.** Incorporación de soporte `AbortController` en `BaseClient.js` y `http.js` para abortar peticiones asíncronas pendientes durante cambios de ruta.

---

### [HITO 5] Deuda Técnica, Purga y Code-Splitting (v1.0.0-rc1)
- [x] **5.1.** Eliminación de componentes redundantes u obsoletos (NewsTicker y páginas de error duplicadas).
- [x] **5.2.** Migración sistemática de eventos inline en plantillas HTML a delegación centralizada mediante atributos `data-action`.
- [x] **5.3.** Consolidación del punto de exportación de estado reactivo en `src/shared/state/index.js`.
- [x] **5.4.** Configuración de Rollup `manualChunks` en Vite: reducción del bundle principal de 758 kB a 122 kB (-84% de payload inicial).

---

## 2. Próximos Hitos Estratégicos

### [HITO 6] Integración Oficial con Firebase Live y Entornos de Despliegue
* **Objetivo:** Conectar la aplicación al proyecto real de Firebase Firestore (`buca-scdbs`), aislando los entornos de desarrollo y producción bajo la regla de coste $0.00 USD.
* **Tareas Clave:**
  - [x] **6.1.** Configuración de variables de entorno maestras (`CONFIG.ENV` en `src/core/config/config.js`) con flags `MODE`, `IS_DEVELOPMENT`, `IS_PRODUCTION` y `SHOW_DEMO_ACCOUNTS`.
  - [x] **6.2.** Encapsulación condicional del selector de cuentas demo en `LoginForm.js` e inhabilitación del bypass en `AuthService.js` cuando `IS_PRODUCTION: true`, sin eliminar el marcado HTML.
  - [x] **6.3.** Conexión directa a Firebase Cloud Firestore y Auth en `src/core/config/firebase.js`, suprimiendo emuladores en producción y activando `persistentLocalCache` multi-pestaña.
  - [x] **6.4.** Sincronización completa de la documentación técnica en `/docs/` y generación del informe comparativo de arquitectura en `/README.md`.
  - [ ] **6.5.** Despliegue y auditoría de reglas de seguridad en `firestore.rules` validadas por roles (`super_admin`, `admin`, `owner`, `worker`).
  - [ ] **6.6.** Integración de EmailJS API para el despacho real del código OTP de 6 dígitos en el flujo 2FA (`template_auth_2fa`).
  - [ ] **6.7.** Normalización de la densidad visual ERP según `interface.md`: reducción del ancho de tarjetas `.b-card` de 340px a 280px en escritorio y compactación de modales.
  - [ ] **6.8.** Verificación de telemetría de red y manejo de excepciones con el sobre canónico `{ success, data, error, code }`.

---

### [HITO 7] Implementación de Módulos Operativos de Negocio
* **Objetivo:** Sustituir las pantallas placeholder procedimentales por módulos de producción de alta densidad de datos.
* **Módulos a Desarrollar:**
  - [ ] **7.1. Módulo de Inventario y Almacenes (`/inventory`):**
    - [ ] 7.1.1. Catálogo interactivo de productos con paginación por cursor `limit(20)` y `startAfter()`.
    - [ ] 7.1.2. Subcolección de trazabilidad FIFO por lotes (`/products/{id}/inventory_lots/{lot_id}`) con control de fecha de caducidad.
    - [ ] 7.1.3. Algoritmo de precios SMART con reposición pesimista y dispersión cambiaria.
    - [ ] 7.1.4. Bloqueo estricto de inventario negativo en mostrador con flag de excepción para el Owner.
  - [ ] **7.2. Módulo de Punto de Venta Bi-Monetario (`/pos`):**
    - [ ] 7.2.1. Terminal de cobro rápido con conversión automática USD / Bolívares a tasa oficial BCV.
    - [ ] 7.2.2. Manejo de pagos combinados (Efectivo divisa, Pago Móvil, Punto de Débito, USDT) con desglose de contravalor exacto.
    - [ ] 7.2.3. Control de turnos y Arqueo Ciego de caja (`cash_shifts`): conteo físico por el cajero sin visualización del total del sistema.
    - [ ] 7.2.4. Snapshot inmutable en cada venta de `/sales/` (precios unitarios, costos de adquisición de lote, tasas y tributos congelados).
    - [ ] 7.2.5. Consecutivos fiscales atómicos (`FAC-`, `NC-`, `TKT-`) mediante `runTransaction` en `/sequences/`.
  - [ ] **7.3. Módulo de Clientes y Crédito Comercial ("Fiado"):**
    - [ ] 7.3.1. Directorio de clientes en `/customers/` con control de cuenta corriente.
    - [ ] 7.3.2. Anclaje de saldo deudor en divisas (`balance_usd`), liquidado a la tasa oficial del día del abono.
  - [ ] **7.4. Módulo de Personal, Equipos y Modelo Híbrido (`/users` y `/teams`):**
    - [ ] 7.4.1. Panel de gestión del perfil laboral `worker_profile` (habilidades, disponibilidad y turnos completados).
    - [ ] 7.4.2. Activación del "Modo Espejo" al conmutar a negocios ajenos, restringiendo visuales a la terminal asignada.
    - [ ] 7.4.3. Sistema de reputación bilateral y evaluación recíproca entre empleador y colaborador.

---

### [HITO 8] Certificación PWA y Modo Offline Completo
* **Objetivo:** Habilitar facturación continua en mostrador ante fallos de energía eléctrica o conectividad a internet.
* **Tareas Clave:**
  - [ ] **8.1.** Configuración de Service Worker nativo (`sw.js`) con estrategia Cache-First para el App Shell y Network-First con fallback a IndexedDB para el catálogo.
  - [ ] **8.2.** Cola de transacciones offline (Offline Sync): ventas locales almacenadas de forma cifrada en IndexedDB con sincronización atómica hacia Firestore al reanudar la conexión.
  - [ ] **8.3.** Manifiesto de aplicación web (`manifest.json`), iconos corporativos WebP/PNG y habilitación de instalación en modo standalone para terminales Windows y Android.
  - [ ] **8.4.** Auditoría final de rendimiento Lighthouse (PWA, Performance, Accessibility, Best Practices > 95%).
