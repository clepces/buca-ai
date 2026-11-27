# 📑 Catálogo Oficial de Tópicos y Acciones (`dominio:accion`)
## Diccionario Agrupado por Área y Categoría — B.U.C.A. AI

> **Módulo:** `docs/events/event-catalog.md`  
> **Archivos Fuente:** `src/core/eventBus/index.js`, `src/core/services/ActionDispatcher.js`, `src/shared/ui/services/shared-actions.js`  
> **Estado:** `[Producción v1.1.24-alpha]`

---

## 1. Convención Estándar: `dominio:accion`

Todas las comunicaciones del `EventBus` y atributos `data-action="dominio:accion"` siguen la estructura `<dominio>:<accion>` agrupada por área funcional.

---

## 2. Núcleo del Sistema (`kernel`, `router`, `engine`)

| Tópico / Acción | Tipo | Emisor / Origen | Suscriptor / Destino | Descripción |
|---|---|---|---|---|
| **`kernel:boot:progress`** | Evento | `Kernel` | UI Preloader | Reporta avance porcentual de arranque. |
| **`kernel:layout-ready`** | Evento | `Kernel` | `Router` | Notifica que el layout (`auth` / `workspace`) está montado. |
| **`kernel:ready`** | Evento | `Kernel` | Global | Sistema inicializado y operativo. |
| **`router:navigate`** | Acción / Evento | `[data-action]` / Módulos | `Router` | Navega a `payload.path` previa sanitización `sanitizeReturnUrl`. |
| **`router:before-change`** | Evento | `Router` | Módulos | Antes de resolver cambio de ruta. |
| **`router:changed`** | Evento | `Router` | `DockableNavbar` | Sincroniza estado activo tras cambiar de ruta. |
| **`router:layout-sync-required`** | Evento | `Router` | `Kernel` | Solicita conmutar entre `AuthLayout` y `MainLayout`. |
| **`engine:recalibrate`** | Evento | UI / Servicios | `Kernel` | Dispara recalibración de `GraphicsEngine`. |
| **`engine:profile_selected`** | Evento | `PerformanceD3Dashboard` | Telemetría | Perfil de rendimiento seleccionado manualmente. |
| **`graphics:tier-changed`** | Evento | `GraphicsEngine` | `TopBar`, `uiState` | Cambio de tier gráfico (`L0`–`L3`). |
| **`buca:panic_mode_toggled`** | Evento | `PanicModeManager` | Sistema | Activa o desactiva el Modo Pánico. |
| **`buca:drp_pause_polling`** | Evento | `ResourceThrottler` | Red / Servicios | Pausa sondeos secundarios bajo estrés. |

---

## 3. Autenticación y Seguridad (`auth`, `profile`)

| Tópico / Acción | Tipo | Emisor / Origen | Suscriptor / Destino | Descripción |
|---|---|---|---|---|
| **`auth:logout`** | Acción / Evento | `ProfilePanel` (`[data-action]`) | `AuthModule` | Inicia cierre de sesión con modal de feedback (equivalente UI a `/auth/logout`). |
| **`auth:login-success`** | Evento | `AuthService` | `BusinessHub` | Sesión autenticada confirmada. |
| **`auth:login-failed`** | Evento | `AuthService` | `AuthModule` | Fallo de credenciales en login. |
| **`auth:logout-success`** | Evento | `AuthService` | Sistema | Confirmación de sesión cerrada y estado purgado. |
| **`auth:mfa-required`** | Evento | `Router`, `AuthService` | `AuthModule` | Redirección por desafío TOTP AAL2 pendiente. |
| **`auth:password-recovery`** | Evento | `AuthModule` | Flujo Auth | Sesión aislada en modo `PASSWORD_RECOVERY`. |
| **`auth:password-updated`** | Evento | `AuthService` | Auditoría | Contraseña actualizada en Supabase Auth. |
| **`auth:register-success`** / **`failed`** | Evento | `AuthService` | `AuthModule` | Resultado de registro de nueva cuenta. |
| **`profile:open`** | Acción / Evento | `ProfilePanel` (`data-tab`) | `ProfileModule` | Abre modal de perfil (`general`, `security`, `subscription`). |
| **`profile:open_modal`** | Evento | `ProfileModal` | `ProfileController` | Inicializa controladores internos del modal de perfil. |
| **`profile:mfa-enrolled`** | Evento | `MFAEnrollmentModal` | `ActivityLogService`, `ProfileController` | Nuevo factor TOTP verificado e inscrito. |

---

## 4. Negocios, Finanzas y Espacio de Trabajo (`business`, `finance`, `workspace`)

| Tópico / Acción | Tipo | Emisor / Origen | Suscriptor / Destino | Descripción |
|---|---|---|---|---|
| **`business:open_create`** | Acción / Evento | `BusinessHub`, `Ribbon`, `CommandPalette` | `BusinessModule` | Abre wizard de creación de negocio. |
| **`business:open_wizard`** | Evento | Módulos | `BusinessModule` | Inicializa controlador del wizard. |
| **`business:enter`** | Acción / Evento | `BusinessHub`, `Dock`, `Telemetry` | `BusinessModule` | Selecciona unidad comercial activa en `sessionState`. |
| **`business:selected`** | Evento | `BusinessModule` | Módulos | Notifica cambio de inquilino activo. |
| **`business:registered`** | Evento | `BusinessWizardController` | `BusinessHub` | Nuevo comercio guardado en Supabase. |
| **`business:toggle_view`** | Evento | `WorkspaceModule` | `BusinessHub` | Alterna vista carrusel / cuadrícula. |
| **`finance:sync-rates`** | Evento | `Kernel` | `FinanceModule` | Sincroniza tasas BCV / paralelo / snapshot. |
| **`finance:open_rate`** | Acción / Evento | `Telemetry`, `CommandPalette` | `FinanceModule` | Abre modal de tasas cambiarias. |
| **`finance:rate_updated`** | Evento | `FinanceModule`, `RateController` | `TopBar`, `TelemetryComponent`, `ActivityLogService` | Nueva tasa cambiaria vigente. |
| **`workspace:filter_context`** | Acción / Evento | `Ribbon` | `WorkspaceModule` | Filtra contexto del espacio de trabajo. |
| **`workspace:refresh_data`** | Acción / Evento | `Ribbon`, `UserService` | `Workspace` | Recarga datos del escritorio. |
| **`workspace:toggle_view_mode`** | Acción / Evento | `Ribbon` | `WorkspaceModule` | Conmuta modo de vista del hub. |
| **`workspace:export_report`** | Acción / Evento | `Ribbon`, `CommandPalette` | `WorkspaceModule` | Abre modal de exportación de reportes. |

---

## 5. Notificaciones, Auditoría y UI Transversal (`notifications`, `activity`, `header`, `advisor`, `ui`, `settings`)

| Tópico / Acción | Tipo | Emisor / Origen | Suscriptor / Destino | Descripción |
|---|---|---|---|---|
| **`notifications:push`** | Evento | Servicios / Módulos | `NotificationService` | Encola notificación en tiempo real. |
| **`notifications:updated`** | Evento | `NotificationService` | `TopBar` | Actualiza contador de no leídas. |
| **`notifications:mark_as_read`** | Acción / Evento | `NotificationsPanel`, `NotificationTray` | `NotificationService` | Marca una notificación como leída vía RPC. |
| **`notifications:clear`** | Acción / Evento | `NotificationsPanel`, `NotificationTray` | `NotificationService`, `TopBar` | Marca todas las notificaciones como leídas. |
| **`notifications:filter_tab`** | Acción / Evento | `NotificationTray` | `SharedActions` | Filtra pestañas (`all`, `unread`, `system`). |
| **`activity:logged`** | Evento | `ActivityLogService` | `RecentActivity` | Nueva entrada inmutable en bitácora. |
| **`header:toggle_panel`** | Acción / Evento | `topbar-template` | `TopBar` | Abre/cierra panel flotante del header. |
| **`header:close_all_panels`** | Acción / Evento | Paneles / `KeyboardShortcuts` | `TopBar` | Cierra todos los paneles abiertos. |
| **`header:toggle_fullscreen`** | Acción / Evento | `TopBar` | `TopBar` | Alterna pantalla completa. |
| **`advisor:*`** | Acción / Evento | `advisor-panel` | `advisor-panel` | `toggle_filter`, `select_filter`, `clear_filters`, `show_detail`, `back_to_list`. |
| **`feedback:select_type`** | Acción / Evento | `feedback-panel` | `SharedActions` | Selecciona categoría en panel de feedback. |
| **`settings:toggle_glass`** | Acción / Evento | `_settings` | `SharedActions` | Conmuta efectos de cristal. |
| **`ui:open_modal`** / **`ui:close_modal`** | Acción / Evento | Global | `ModalService` | Abre modal sanitizado / cierra modal activo. |
| **`ui:open_activity_log`** | Acción / Evento | `Ribbon`, `TopBar`, `Advisor` | `SharedActions` | Abre `AuditTerminalModal`. |
| **`ui:open_search_palette`** | Acción / Evento | `TopBar`, `KeyboardShortcuts` | `SharedActions` | Abre `CommandPaletteModal` (`Ctrl/Cmd + K`). |
| **`ui:open_ai_assistant`** | Acción / Evento | `TopBar`, `Advisor` | `SharedActions` | Abre `AICopilotModal`. |
| **`ui:open_features_modal`** | Acción / Evento | `ProfilePanel` | `SharedActions` | Muestra hoja de ruta de módulos. |
| **`ui:open_changelog_modal`** | Acción / Evento | `ProfilePanel` | `SharedActions` | Muestra notas de versión (`ENV.APP_VERSION`). |
| **`ui:open_performance`** / **`ui:open_settings`** | Acción / Evento | `Ribbon`, `ProfilePanel`, `Advisor` | `WorkspaceModule` | Abre `PerformanceModal`. |
| **`ui:set_theme`** / **`ui:toggle_theme`** / **`ui:set_language`** | Acción / Evento | `ProfilePanel`, `LanguagePanel` | `ThemeManager` / `TopBar` | Cambia tema o idioma. |

---

## 6. Suscripciones con Comodines

```javascript
eventBus.on('auth:*', (event, data) => {
    Logger.debug({ layer: 'MODULE', role: 'EVENT', target: 'AuthAudit', message: `Evento: ${event}`, data });
});

const unsubscribe = eventBus.on('finance:rate_updated', handleRateChange);
unsubscribe();
```
