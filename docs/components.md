# Catálogo de Componentes UI Modulares (Vanilla JS ES6+)

> **Documento:** Inventario de Componentes Visuales, Props, Eventos e Interfaz  
> **Versión:** 1.1.0 (Sincronizado)  
> **Patrón:** Pure Vanilla JS Templates con Delegación de Eventos (`data-action`), Ciclo de Vida y Web Components Nativos  
> **Ámbito:** `src/shared/ui/`, `src/modules/workspace/components/`, `src/modules/auth/components/`, `src/modules/business/components/`, `src/modules/finance/components/`, `src/modules/profile/components/`

---

## 1. Componentes de Navegación y Shell

### 1.1. `TopBar` (Header Superior Corporativo)
* **Ubicación:** `src/shared/ui/layouts/components/TopBar.js`
* **Propósito:** Barra superior fija translúcida con información del sistema, tasas de cambio en tiempo real, selector de tema claro/oscuro, buscador neural y controles rápidos.
* **Características Clave:**
  * Renderizado condicional de píldoras financieras (`Tasa BCV`).
  * Integración de paneles desplegables (`LanguagePanel`, `NotificationsPanel`, `ProfilePanel`).
  * Extracción dinámica de paneles al `body` para resolver conflictos de Stacking Context y `z-index`.
  * Soporte de gestos táctiles de deslizamiento (swipe-down) para cerrar paneles en móviles.

### 1.2. `DockableNavbar` (Dock de Navegación Flotante)
* **Ubicación:** `src/shared/ui/layouts/components/DockableNavbar.js`
* **Propósito:** Menú inferior flotante con estética de corte circular y curva negativa animada.
* **Mapeo de Contextos:**
  * `main`: Navegación principal (Módulos, Negocios, Dashboard, Personal, Ajustes).
  * `modules`: Sub-módulo ERP (Clientes, Proveedores, Inventario, Punto de Venta).
  * `people`: Gestión de equipo (Usuarios, Roles, Equipos).
* **Adaptación Responsiva:** En pantallas menores a 576px oculta textos secundarios y compacta el ancho para maximizar el área de trabajo útil.

### 1.3. Paneles Auxiliares de Cabecera
* **`LanguagePanel`:** `src/shared/ui/components/header/LanguagePanel.js` (Selector multi-idioma).
* **`NotificationsPanel`:** `src/shared/ui/components/header/NotificationsPanel.js` (Bandeja rápida de notificaciones transaccionales).
* **`ProfilePanel`:** `src/shared/ui/components/header/ProfilePanel.js` (Acceso rápido a estado de cuenta, perfil y cierre de sesión).
* **`NotificationTray`:** `src/shared/ui/components/notifications/NotificationTray.js` (Bandeja y toasts del sistema).
* **`SkeletonLoader`:** `src/shared/ui/components/skeleton/SkeletonLoader.js` (Placeholders de carga con efecto shimmer).

---

## 2. Componentes del Espacio de Trabajo (`src/modules/workspace/components/`)

### 2.1. `BannerComponent` (Banner de Bienvenida y Estado del Ecosistema)
* **Ubicación:** `src/modules/workspace/components/BannerComponent.js`
* **Propósito:** Franja superior del dashboard con saludo contextualizado según la hora del día, selector de modo activo (Owner / Worker) y badge de salud de conexión.

### 2.2. `WorkspaceNavRibbon` (Cinta de Navegación Contextual)
* **Ubicación:** `src/modules/workspace/components/WorkspaceNavRibbon.js`
* **Propósito:** Píldoras de conmutación rápida entre sub-módulos del negocio activo (Inventario, POS, Clientes, Facturación, Ajustes) con indicador de ruta activa.

### 2.3. `QuickActionsControl` (Botonera de Acciones Rápidas)
* **Ubicación:** `src/modules/workspace/components/QuickActionsControl.js`
* **Propósito:** Barra de botones de alta frecuencia (Nueva Venta, Registrar Producto, Abrir Turno, Reporte Diario) conectada al `eventBus`.

### 2.4. `SystemWidgets` (Franja de Métricas y Telemetría Operativa)
* **Ubicación:** `src/modules/workspace/components/SystemWidgets.js`
* **Propósito:** Cuadrícula de tarjetas financieras en tiempo real con facturación en Bs./USD, margen comercial y personal activo.

### 2.5. `TelemetryComponent` (Gráfica de Rendimiento y Ventas)
* **Ubicación:** `src/modules/workspace/components/TelemetryComponent.js`
* **Propósito:** Renderizado de gráficos vectoriales ligeros mediante SVG nativo para proyectar curvas de ventas por hora.

### 2.6. `PerformanceD3Dashboard` (Dashboard de Métricas con D3.js)
* **Ubicación:** `src/modules/workspace/components/PerformanceD3Dashboard.js`
* **Propósito:** Renderizado de métricas avanzadas y telemetría de hardware con D3.js.

### 2.7. `RecentActivity` (Feed de Actividad y Auditoría)
* **Ubicación:** `src/modules/workspace/components/RecentActivity.js`
* **Propósito:** Registro cronológico de sucesos en el negocio (aperturas de caja, recepciones de mercancía, ventas, cambios de tasa).

### 2.8. `SystemHealthMonitor` (Monitor de Salud y Estado de Servicios)
* **Ubicación:** `src/modules/workspace/components/SystemHealthMonitor.js`
* **Propósito:** Indicador de estado de sincronización con Firestore, latencia de red y cuotas Spark.

---

## 3. Componentes de Negocios y Finanzas (`src/modules/business/` & `src/modules/finance/`)

### 3.1. `BusinessHub` (Carrusel de Negocios)
* **Ubicación:** `src/modules/business/components/BusinessHub.js`
* **Propósito:** Vitrina principal para visualizar las unidades de negocio del usuario (Modo Owner) o empresas afiliadas (Modo Worker).
* **Interacciones:**
  * Arrastre con ratón en escritorio (Drag-to-scroll).
  * Soporte táctil móvil (`touchstart`, `touchmove`, `touchend`) con detección de umbral para evitar clics accidentales.
  * Tarjeta especial `create-new` para invocar el modal `BusinessWizardModal`.

### 3.2. `BusinessWizardModal` (Asistente de Creación de Negocios)
* **Ubicación:** `src/modules/business/components/BusinessWizardModal.js`
* **Propósito:** Flujo asistido paso a paso para dar de alta nuevas sucursales o empresas en Firestore.

### 3.3. `RateManagementModal` (Gestor de Tasa de Cambio Bi-Monetaria)
* **Ubicación:** `src/modules/finance/components/RateManagementModal.js`
* **Propósito:** Panel estilo Fintech para supervisión y ajuste de la tasa oficial BCV, tasa de reposición pesimista y cálculo de brecha.

---

## 4. Modales y Overlays del Sistema (`src/shared/ui/overlays/`)

### 4.1. `ModalService` (Orquestador Central de Modales)
* **Ubicación:** `src/shared/ui/overlays/ModalService.js` (y `src/shared/ui/services/ModalService.js`)
* **Propósito:** Administrador de apertura, apilamiento y cierre de modales en el DOM, gestionando el foco de teclado y previniendo fugas de eventos.

### 4.2. `PerformanceModal` (Gestor de Buca Neural Engine)
* **Ubicación:** `src/modules/workspace/components/PerformanceModal.js`
* **Propósito:** Panel de control de hardware gráfico. Permite alternar entre los niveles **L0 (Eco)**, **L1 (Balanced)**, **L2 (Pro)** y **L3 (Ultra)** con medición de FPS y memoria JS Heap.

### 4.3. `EmulatorModal` (Aviso de Entorno Local)
* **Ubicación:** `src/shared/ui/overlays/EmulatorModal.js`
* **Propósito:** Notificación visual al detectar ejecución con emuladores locales activos.

### 4.4. `SystemOverlay` (Capa de Desenfoque y Bloqueo de Foco)
* **Ubicación:** `src/shared/ui/overlays/SystemOverlay.js`
* **Propósito:** Telón de fondo translúcido (`backdrop`) reutilizable para diálogos y menús desplegables.

---

## 5. Componentes del Módulo de Autenticación (`src/modules/auth/components/`)

### 5.1. `LoginForm` (Acceso Corporativo)
* **Ubicación:** `src/modules/auth/components/LoginForm.js`
* **Propósito:** Entrada de credenciales corporativas con selector de cuentas demo encapsulado y soporte de visibilidad de contraseña.

### 5.2. `PINForm` (Verificación OTP 2FA)
* **Ubicación:** `src/modules/auth/components/PINForm.js`
* **Propósito:** Entrada numérica segmentada de 6 dígitos para validar el segundo factor con reenvío temporizado.

### 5.3. `DeviceChallenge` (Reto de Autorización de Dispositivos)
* **Ubicación:** `src/modules/auth/components/DeviceChallenge.js`
* **Propósito:** Diálogo de confirmación cuando el usuario ingresa desde un navegador o terminal no registrado previamente.

### 5.4. `SessionDashboard` (Visor de Sesión y Seguridad)
* **Ubicación:** `src/modules/auth/components/SessionDashboard.js`
* **Propósito:** Panel informativo sobre el estado del token activo, tiempo de expiración y lista de dispositivos autorizados.

---

## 6. Componentes del Módulo de Perfil (`src/modules/profile/components/parts/`)

* **`ProfileHero`:** Cabecera inmersiva con avatar, rol y acciones rápidas de perfil.
* **`ProfileTabs`:** Navegación por pestañas desacopladas:
  * `ProfileGeneralTab.js`: Datos personales y preferencias básicas.
  * `ProfileWorkerTab.js`: Asignaciones operativas y empresas vinculadas como colaborador.
  * `ProfileSubscriptionTab.js`: Planes y capacidad multi-negocio.
  * `ProfileSecurityTab.js`: 2FA, dispositivos de confianza y cambio de credenciales.
  * `ProfileMonitoringTab.js`: Bitácora personal de accesos y telemetría de sesión.
