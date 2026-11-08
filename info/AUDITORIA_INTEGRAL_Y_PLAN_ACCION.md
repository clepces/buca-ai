# INFORME DE AUDITORÍA INTEGRAL, EJECUCIÓN LOCAL Y PLAN DE ACCIÓN MAESTRO
## B.U.C.A. AI (Business Under Control Access) — v1.0.0-Alpha

> **Fecha de Auditoría:** 05 de Noviembre de 2026  
> **Entorno de Verificación:** Local PC (Windows, Node.js v20.19.5, npm 10.8.2, Vite v8.3.5, Google Chrome DevTools MCP)  
> **Ubicación del Proyecto:** `C:\wamp64\www\Clepces\projects\buca-ai`  
> **Normativa de Gobernanza:** Clean Core 3-Tier, Vanilla JS ES6+ Modular, BNE-RULE-001, Cero Frameworks (No React/JSX).

---

## 1. DIAGNÓSTICO DE EJECUCIÓN EN ENTORNO LOCAL

### 1.1. Estado de Instalación de Dependencias
* **Condición Inicial:** El directorio `node_modules` no se encontraba instalado en la carpeta raíz del proyecto tras la migración desde Google AI Studio.
* **Acción Ejecutada:** Se ejecutó `npm install` incorporando 437 paquetes empresariales (`@eslint/js`, `stylelint`, `prettier`, `typescript`, `firebase`, `zod`, `d3`, `lucide`, `bootstrap`, `sass-embedded`).
* **Resultado:** Instalación exitosa sin colisiones de dependencias entre pares (*peer dependencies*).

### 1.2. Prueba de Compilación de Producción (`npm run build`)
* **Herramienta:** Vite v8.3.5 / Rolldown Engine.
* **Resultado:** Compilación exitosa en 5.23s generando el bundle en `/dist`.
* **Métricas de Salida:**
  * `dist/index.html`: 10.50 kB (gzip: 3.49 kB).
  * `dist/assets/vendor-firebase-*.js`: 347.64 kB (gzip: 106.51 kB).
  * `dist/assets/index-*.js`: 214.98 kB (gzip: 46.75 kB).
  * `dist/assets/index-*.css`: 475.37 kB (gzip: 72.14 kB).
* **Alertas Detectadas en el Empaquetador:**
  * 5 advertencias `[INEFFECTIVE_DYNAMIC_IMPORT]` causadas por importaciones dinámicas que al mismo tiempo son requeridas de forma estática en otros puntos de entrada (`NotificationTray.js`, `TopBar.js`, `NotificationService.js`, `ModuleLoader.js`, `BusinessService.js`).

### 1.3. Prueba de Servidor en Vivo (`npm run dev`) y Navegación
* **Servidor Local:** Activo en `http://localhost:3000/`.
* **Prueba de Flujo Completo con Navegador (Chrome DevTools):**
  1. Arranque del **Kernel** con preloader visual (10% -> 100%).
  2. Detección de falta de sesión por **RouterGuard** y redirección limpia a `/auth/login`.
  3. Carga e interacción con el formulario de credenciales corporativas (cuentas demo precargadas).
  4. Desafío **2FA** con generación y autocompletado de PIN de seguridad de 6 dígitos.
  5. Sincronización de sesión y transición fluida a la ruta protegida `/workspace`.
  6. Montaje del App Shell corporativo: TopBar con cotizaciones en vivo (BCV USD/EUR, Binance P2P), franjas de telemetría, carrusel de unidades comerciales (*BusinessHub*) y dock inferior con curvas dinámicas.

---

## 2. ANÁLISIS DE UI, UX E INTERACTION DESIGN (IxD)

### 2.1. Deficiencias de Accesibilidad (WAI-ARIA) en el Sistema de Modales
* **Severidad:** Media-Alta (Bloqueante para estándares de accesibilidad WCAG 2.1 AA).
* **Hallazgo Detectado por DevTools:**
  ```text
  [warn] Blocked aria-hidden on an element because its descendant retained focus.
  Element with focus: <button class="btn btn-ghost">
  Ancestor with aria-hidden: <div class="glass-modal-overlay" id="modal-base">
  ```
* **Causa Raíz:** Al cerrarse un modal mediante `ModalService.hideModal()`, se aplica el atributo `aria-hidden="true"` al contenedor padre mientras el botón presionado aún conserva el foco del navegador.
* **Falta de Focus Trap (Atrapamiento de Foco):** Al abrir un modal, el usuario que navega mediante teclado (`Tab` / `Shift+Tab`) puede escapar del diálogo e interactuar accidentalmente con botones del fondo (Dock, TopBar), violando la experiencia de un diálogo modal verdadero.
* **Restauración de Foco Ausente:** Tras cerrarse el modal, el foco no retorna al elemento que disparó la acción original (`triggerElement.focus()`).

### 2.2. Remanentes de Sintaxis JSX Renderizados como Texto en Pantalla
* **Severidad:** Alta (Impacto visual directo al usuario final).
* **Archivo Afectado:** `src/shared/ui/templates/modals/_business_wizard.js` (Línea 10).
* **Hallazgo:** Se encuentra la cadena `{/* Step Indicator / Progress */}` dentro de un template literal de JavaScript.
* **Efecto en UI:** El motor del navegador interpreta dicha sintaxis como texto plano, haciendo visible en la interfaz la cadena literal `{/* Step Indicator / Progress */}` justo encima de las pestañas del asistente de registro de empresas.

### 2.3. Contaminación con Clases de Utilidad de Tailwind CSS (Framework Inexistente)
* **Severidad:** Media (Inconsistencia de sistema de diseño).
* **Archivos Afectados:**
  * `src/shared/ui/templates/modals/_business_wizard.js`
  * `src/modules/business/BusinessWizardController.js`
* **Hallazgo:** Se utilizan clases utilitarias ajenas como `space-y-6`, `flex`, `items-center`, `justify-between`, `text-cyan-400`, `bg-slate-800`, `rounded-xl`, `border-slate-700` y `grid-cols-12`.
* **Efecto en UI:** Dado que el stack tecnológico del proyecto no posee Tailwind CSS (utiliza Bootstrap 5 + arquitectura SASS BNE), estos elementos dependen de estilos fortuitos o quedan desalineados respecto a la identidad corporativa "Corporate Hybrid Glass".

### 2.4. Formularios sin Atributos de Autocompletado y Etiquetas Huérfanas
* **Severidad:** Baja-Media (Usabilidad en contraseñas y lectores de pantalla).
* **Hallazgo:** El navegador reporta 6 campos de entrada sin etiqueta `<label>` asociada explícitamente mediante atributo `for`/`id` y ausencia de metadatos `autocomplete="username"` o `autocomplete="current-password"`, lo que dificulta la integración fluida con gestores de contraseñas seguros.

### 2.5. Latencia Excesiva de Frame en Despacho de Eventos (>16ms)
* **Severidad:** Media (Pérdida de fluidez de 60 FPS).
* **Alerta en Consola:**
  ```text
  [EventBus][Performance Warning] El suscriptor de "ui:open_rate" tardó 101.40ms en responder.
  ```
* **Causa:** Al presionar la píldora de tasas en el TopBar, el controlador `RateController.js` ejecuta cálculos matemáticos síncronos y consultas de red bloqueantes dentro del bucle de evento en lugar de diferirlos mediante `requestAnimationFrame` o microtareas asíncronas.

---

## 3. IDENTIFICACIÓN DE BUGS, ERRORES Y FUGAS DE MEMORIA

### 3.1. Archivos Residuales en React/JSX (Violación a "Cero Frameworks" y Fallo de Linters)
* **Severidad:** Crítica para integración continua.
* **Archivos Detectados:**
  1. `src/modules/business/components/BusinessWizardModal.js`
  2. `src/modules/profile/components/UserProfileModal.js`
* **Diagnóstico:** Ambos archivos contienen componentes escritos íntegramente en **React / JSX** (`import React, { useState } from 'react'`, `return (<div className=...>)`). No están importados en ninguna parte del código en ejecución (fueron abandonados tras una prueba inicial en AI Studio), pero causan que `npm run lint:js` falle con errores de sintaxis (`Parsing error: Unexpected token <`).
* **Solución:** Eliminación inmediata de ambos archivos para cumplir con la regla corporativa de Cero Frameworks.

### 3.2. Error de Escape en Template Literal (`module-placeholder-page.js`)
* **Severidad:** Baja (Error de linting).
* **Archivo:** `src/modules/workspace/pages/module-placeholder-page.js` (Línea 45).
* **Hallazgo:** Presencia de escapes de comillas dobles redundantes (`\"`) dentro de una plantilla literal con comillas invertidas, lo que detona la regla `no-useless-escape` de ESLint.

### 3.3. Manejo Destructivo de Errores Globales en el Enrutador SPA
* **Severidad:** Crítica (Riesgo de colapso de la aplicación).
* **Archivo:** `src/core/router/router.js` (`#setupGlobalErrorCapture`).
* **Diagnóstico:** Los escuchadores globales `window.addEventListener('error')` y `window.addEventListener('unhandledrejection')` ejecutan inmediatamente:
  ```javascript
  this.#renderError('500'); // app.innerHTML = '<div class="full-screen-error-layout">...'
  ```
* **Impacto:** Si un servicio de analítica, una petición secundaria en segundo plano o una promesa cancelada por `AbortController` arroja un error no crítico, **la aplicación completa se borra de la pantalla del usuario**, sustituyendo el espacio de trabajo por una pantalla de error 500 irrecuperable.
* **Solución:** Los errores globales deben registrarse en el logger y despacharse mediante toasts o banner de notificación; únicamente errores fatales no recuperables en el ciclo de montaje del enrutador deben sustituir la vista activa.

### 3.4. Fuga de Suscriptores y Proliferación de Listeners en `BusinessHub`
* **Severidad:** Alta (Fuga progresiva de memoria).
* **Archivo:** `src/modules/business/components/BusinessHub.js` (Método `init`).
* **Diagnóstico:** Cada vez que el usuario navega hacia `/workspace` desde otra sección (`/clients`, `/inventory`, `/pos`), el componente `WorkspacePage` ejecuta nuevamente `BusinessHub.init()`. Este método suscribe 4 eventos en el EventBus (`workspace:business_created`, `workspace:refresh_data`, `auth:login-success`, `workspace:filter_context`) sin desuscribir los anteriores ni poseer un método de ciclo de vida `destroy()`.
* **Impacto:** En una sesión prolongada con múltiples transiciones de ruta, las funciones en memoria se duplican indefinidamente, consumiendo memoria RAM y ejecutando llamadas repetitivas a Firestore.

### 3.5. Fuga y Duplicación de Nodos en `FloatingPanelManager`
* **Severidad:** Media (Contaminación del DOM).
* **Archivo:** `src/shared/ui/services/FloatingPanelManager.js` (`extractPanelsToBody`).
* **Diagnóstico:** Cada vez que el TopBar se monta, ejecuta `document.body.appendChild(panel)` para los paneles `.glass-panel`. Si el usuario navega entre auth y workspace, los paneles anteriores permanecen desconectados en `document.body`, duplicando identificadores (`#dw-notif-panel`, `#dw-profile-panel`) y provocando que los selectores capturen instancias obsoletas.

### 3.6. Fuga de Contextos de Audio en el Dock (`DockableNavbar.js`)
* **Severidad:** Media-Alta (Agotamiento de recursos del sistema).
* **Archivo:** `src/shared/ui/layouts/components/DockableNavbar.js` (`_triggerFeedback`).
* **Diagnóstico:** En cada clic sobre cualquier botón del Dock se instancia un nuevo objeto de audio:
  ```javascript
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  ```
* **Impacto:** Los navegadores imponen un límite rígido de contextos de audio simultáneos (comúnmente entre 6 y 32). Si el usuario pulsa repetidamente, se arroja la excepción `DOMException: The number of hardware contexts provided has been reached` y se bloquea el hilo de audio del navegador.

### 3.7. Desconexión del Evento de Monitoreo de Memoria (`modal:closed`)
* **Severidad:** Baja-Media (Ineficacia de mitigación de RAM).
* **Diagnóstico:** El servicio `MemoryGuard.js` escucha `window.addEventListener('modal:closed')` para activar la purga de memoria tras cerrar modales de gran tamaño. Sin embargo, `ModalService.hideModal()` únicamente retira clases CSS y desbloquea el scroll, sin emitir jamás el evento `modal:closed`.

### 3.8. Endpoint Inexistente en `DolarVzlaService` (Error 404)
* **Severidad:** Baja (Petición fallida de red).
* **Archivo:** `src/core/services/DolarVzlaService.js` (Línea 182).
* **Diagnóstico:** Se efectúa una petición `fetch` a `${cdnBase}/bcv/usdt.json`. El Banco Central de Venezuela no emite cotizaciones de USDT (criptoactivo no oficial del BCV), por lo que el CDN retorna un error HTTP 404. La cotización de USDT proviene exclusivamente del canal Binance P2P.

### 3.9. Fragilidad de Parseo en `SessionState`
* **Severidad:** Alta (Punto único de fallo en arranque).
* **Archivo:** `src/core/state/session.js`.
* **Diagnóstico:** Se ejecuta `JSON.parse(localStorage.getItem(CONFIG.STORAGE.SESSION))` de forma directa dentro del constructor sin bloque de protección `try / catch`. Si un valor corrupto reside en el almacenamiento, la aplicación se bloquea de inmediato al arrancar.

### 3.10. Falla de Fallback en el Service Worker (`public/sw.js`)
* **Severidad:** Media (Comportamiento offline errático).
* **Diagnóstico:** En el evento `fetch` del Service Worker, si la llamada de red falla y no existe copia previa en caché, el bloque `.catch(() => {})` devuelve `undefined`, provocando que `event.respondWith()` falle con `TypeError: Failed to execute 'respondWith' on 'FetchEvent': The provided value is not a valid Response`.

---

## 4. ANÁLISIS DE BRECHAS DE ARQUITECTURA (LO QUE FALTA)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MAPA DE BRECHAS FUNCIONALES DEL ERP                  │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│ Componente / Módulo  │ Estado Actual        │ Requerimiento Faltante   │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ /pos                 │ Mockup Placeholder   │ Terminal numérico, cobro │
│                      │ en escala de grises  │ bi-monetario e impresión │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ /inventory           │ Mockup Placeholder   │ Catálogo SKU, lotes FIFO │
│                      │ sin persistencia     │ y alertas de stock en DB │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ /clients             │ Mockup Placeholder   │ Cartera de clientes y    │
│                      │ estático             │ libro de crédito fiado   │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ /providers           │ Mockup Placeholder   │ Gestión de órdenes de    │
│                      │ sin conexión         │ compra y suministros     │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ /users y /roles      │ Vistas informativas  │ CRUD de personal y       │
│                      │ no interactivas      │ asignación de claims     │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ Guardias RBAC        │ Solo booleano        │ Control granular por     │
│                      │ (isAuthenticated)    │ rol y aislamiento tenant │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ Sincronización       │ Detección básica     │ Patrón Outbox IndexedDB  │
│ Offline              │ (navigator.onLine)   │ con cola de reintento    │
└──────────────────────┴──────────────────────┴──────────────────────────┘
```

1. **Submódulos de Negocio Operativos:**
   * Las rutas principales del ERP (`/clients`, `/providers`, `/inventory`, `/pos`, `/users`, `/roles`, `/teams`) están montadas sobre el generador de bocetos `createModulePage`. Falta la implementación interactiva de los componentes de negocio conectados a las colecciones de Firestore v4.1.0.
2. **Middleware de Autorización Granular (RBAC):**
   * El enrutador verifica únicamente si el usuario está autenticado, pero no valida si el rol del usuario (`super_admin`, `admin`, `operator`) tiene permiso para acceder a módulos de administración, configuración fiscal o cierre de caja.
3. **Capa de Persistencia Offline Transaccional (Outbox Pattern):**
   * El sistema detecta desconexión a través de `navigator.onLine`, pero no encola mutaciones de base de datos ni transacciones de ventas cuando el usuario pierde la conexión en el Punto de Venta.
4. **Vinculación de Perfil con Firestore y 2FA:**
   * Las pestañas del modal de perfil (`ProfileSecurityTab`, `ProfileDevicesTab`) son maquetas visuales que requieren vinculación directa con `users/{uid}/trusted_devices` y revocación de sesiones en tiempo real.

---

## 5. PLAN DE ACCIÓN Y SOLUCIONES DE ARQUITECTURA

Con el fin de erradicar la deuda técnica y consolidar una solución limpia tanto a corto como a largo plazo:

### FASE 1: RESOLUCIÓN INMEDIATA Y ESTABILIZACIÓN (Corto Plazo / Hotfixes)
1. **Erradicación de Residuos React / JSX:**
   * Eliminar físicamente `src/modules/business/components/BusinessWizardModal.js` y `src/modules/profile/components/UserProfileModal.js`.
   * Corregir el carácter de escape innecesario en `module-placeholder-page.js` (Línea 45).
   * Validar que `npm run lint:js` ejecute con **0 errores**.
2. **Corrección de Textos JSX y Clases en el Asistente Comercial:**
   * Eliminar `{/* Step Indicator / Progress */}` de `_business_wizard.js`.
   * Reemplazar las clases de Tailwind por el sistema estándar BNE y Bootstrap 5 en `_business_wizard.js` y `BusinessWizardController.js`.
3. **Corrección de Endpoints en `DolarVzlaService`:**
   * Suprimir la consulta fallida a `bcv/usdt.json` y consolidar la lectura de USDT en el proveedor `binanceP2P`.
4. **Blindaje de Parseo en Almacenes de Estado:**
   * Envolver la lectura de `localStorage` en `SessionState` y `PerformanceStorage` con bloques de recuperación `try / catch` ante datos corruptos.
5. **Corrección de Fallback en Service Worker (`sw.js`):**
   * Garantizar que el manejador devuelva un `Response.error()` o una respuesta offline estándar cuando falle tanto la red como la caché.

### FASE 2: BLINDAJE DE INTERACCIÓN Y GOBERNANZA DE MEMORIA (Medio Plazo)
1. **Refactorización de Accesibilidad y Ciclo de Vida en `ModalService`:**
   * Implementar `FocusTrap` nativo accesible para atrapar el tabulador dentro de `#modal-container`.
   * Remover el foco activo antes de aplicar `aria-hidden="true"` al overlay y retornar el foco al botón disparador original.
   * Emitir `window.dispatchEvent(new CustomEvent('modal:closed'))` al ocultar el modal para despertar a `MemoryGuard`.
2. **Idempotencia y Teardown en Componentes con Ciclo de Vida (`BusinessHub`, etc.):**
   * Implementar un método `destroy()` o almacenamiento de desuscripción de eventos (`this._unsubscribers = []`) para que al salir de la vista no queden oyentes zombis en el EventBus.
3. **Optimización de AudioContext Singleton en `DockableNavbar`:**
   * Centralizar la instancia de audio en un servicio reutilizable perezoso (`AudioManager.playFeedback()`) que reutilice el contexto sin instanciar uno nuevo por cada clic.
4. **Aislamiento No Destructivo en el Enrutador SPA:**
   * Reemplazar la sobreescritura total del DOM ante excepciones no controladas por un despachador de alertas flotantes (`NotificationTray`), preservando la operatividad de la aplicación.
5. **Optimización de Caché de Expresiones Regulares en `EventBus`:**
   * Precompilar y cachear las instancias `RegExp` para eventos comodín (`*`) en lugar de recrearlas en cada invocación de `emit()`.

### FASE 3: IMPLEMENTACIÓN DE MÓDULOS OPERATIVOS Y OFFLINE (Largo Plazo)
1. **Desarrollo del Módulo Punto de Venta (POS):**
   * Implementar la interfaz de cobro rápido bi-monetaria (`USD` y `VES`), integración con cálculo dinámico de vuelto según tasa BCV y registro inmutable en Firestore (`sales/{id}`) aplicando el **Snapshot Pattern**.
2. **Desarrollo del Módulo de Inventario con Trazabilidad FIFO:**
   * Construcción de la tabla de stock interactiva con paginación virtual, control de lotes con fechas de vencimiento y cálculo automático de costo promedio ponderado.
3. **Middleware de Autorización por Claims (RBAC):**
   * Evolucionar `guards.js` hacia una matriz de validación de roles cruzada con los permisos configurados en `src/core/config/permissions.js`.
4. **Motor de Sincronización Transaccional Offline (Outbox IndexedDB):**
   * Almacenar transacciones en cola local cuando no haya conexión a Internet y sincronizarlas de forma atómica y secuencial en segundo plano mediante Web Workers al recuperar la señal.

---

## 6. CONCLUSIÓN DE LA AUDITORÍA
La base arquitectónica de **B.U.C.A. AI** implementa con éxito el desacoplamiento en tres capas (*Clean Core*), un motor gráfico reactivo de alto rendimiento (BNE) y una sólida integración con servicios Firebase. La resolución de los hallazgos documentados en este informe garantiza la eliminación definitiva de fugas de memoria, asegura la plena conformidad con las directivas de **Cero Frameworks** y prepara la plataforma para su escalado a producción industrial.
