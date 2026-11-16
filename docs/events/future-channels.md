# 🌐 Sincronización Multi-Pestaña y Canales Futuros
## BroadcastChannel y Replicación P2P Local — B.U.C.A. AI

> **Módulo:** `docs/events/future-channels.md`  
> **Estado:** `[Hoja de Ruta / En Diseño (new)]`

---

## 1. Sincronización Multi-Pestaña con `BroadcastChannel API`

En entornos de comercios con múltiples monitores o pestañas abiertas (ej. Pestaña 1: Facturación POS, Pestaña 2: Control de Tasas):
* **El Problema:** Si la tasa de cambio se actualiza en la Pestaña 2, la Pestaña 1 podría continuar operando con una tasa desactualizada hasta que recargue.
* **La Solución `(new)`:** Un canal `BroadcastChannel('buca_event_bus')` que replica eventos clave (`rate:updated`, `auth:logout`, `business:selected`) entre contextos del mismo origen de forma instantánea sin tocar la red remota.

```javascript
// Propuesta de integración en EventBus
const crossTabChannel = new BroadcastChannel('buca_sync');

// Replicar a otras pestañas
crossTabChannel.postMessage({ type: 'rate:updated', payload });

// Escuchar cambios de otras pestañas
crossTabChannel.onmessage = (event) => {
    eventBus.emit(event.data.type, event.data.payload, { localOnly: true });
};
```

---

## 2. Replicación Local P2P para Cajas de Red Local (LAN)

* **Objetivo:** Permitir que múltiples cajas registradoras compartan el snapshot de tasas y sincronización de stock en red local mediante WebRTC DataChannels en caso de corte total de Internet.
