# 📑 Catálogo Oficial de Tópicos y Canales del EventBus
## Diccionario de Eventos, Soporte de Comodines y Payloads

> **Módulo:** `docs/events/event-catalog.md`  
> **Archivo Fuente:** `src/core/eventBus/index.js`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Nomenclatura Estándar: `dominio:accion`

Todos los eventos siguen la convención `dominio:accion`. El bus soporta suscripciones exactas y por comodín global (`*` o `dominio:*`):

| Tópico | Emisor Típico | Payload | Descripción |
|---|---|---|---|
| **`auth:login_success`** | `AuthService` | `{ user, session }` | Autenticación confirmada por Supabase Auth. |
| **`auth:logout`** | `AuthService` | `{}` | Cierre de sesión y purga de estado local. |
| **`auth:mfa_required`** | `guards.js` | `{ factorId }` | Redirección por desafío AAL2 pendiente. |
| **`rate:updated`** | `FinanceRepository` | `{ bcv, parallel, gap }` | Nueva cotización capturada en tiempo real. |
| **`business:selected`** | `BusinessHub` | `{ businessId, config }` | Cambio de comercio o sucursal activa. |
| **`ui:theme_changed`** | `ThemeManager` | `{ theme: 'light'\|'dark' }` | Conmutación de esquema cromático. |
| **`graphics:tier-changed`**| `BNE / BENE` | `{ tier: 'L0'\|'L1'\|'L2'\|'L3' }` | Modificación de perfil de calidad por telemetría. |
| **`buca:panic_mode_toggled`**| `PanicModeManager` | `{ isPanicMode: boolean }` | Activación/desactivación del Modo Pánico. |
| **`buca:drp_pause_polling`** | `ResourceThrottle` | `{ critical: boolean }` | Orden a la capa de red para detener sondeos secundarios. |

---

## 2. Suscripciones con Comodines

```javascript
// Escuchar todos los eventos del dominio auth
eventBus.on('auth:*', (event, data) => {
    console.log(`[Auth Audit] Evento: ${event}`, data);
});

// Desuscribirse limpiamente para evitar fugas de memoria
const unsubscribe = eventBus.on('rate:updated', handleRateChange);
// Al destruir el componente:
unsubscribe();
```
