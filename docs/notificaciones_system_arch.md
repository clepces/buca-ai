# Arquitectura del Sistema de Notificaciones y Eventos (B.U.C.A. AI)

> **Documento:** Especificación Arquitectónica del Sistema de Notificaciones en Tiempo Real, Bandeja de Interfaz y Sincronización Multi-Usuario  
> **Archivo:** `docs/notificaciones_system_arch.md`  
> **Versión:** 1.0.0 — Enterprise Grade  
> **Base de Datos:** Cloud Firestore (`ai-studio-b6f68ff5-24ea-407f-bfea-e87eb66b9104`)  
> **Patrón de Persistencia:** Multi-Tenant Read-By Array Pattern (`read_by: string[]`)  
> **Patrón Visual:** Dual-Dispatch (HUD Transient Toasts + Persistent Notification Tray)

---

## 1. Resumen Ejecutivo y Objetivos

El sistema de notificaciones de **B.U.C.A. AI** unifica la comunicación reactiva de la plataforma en una arquitectura desacoplada, escalable y en tiempo real. Resuelve tres necesidades críticas:

1. **Feedback Visual Inmediato (HUD):** Alertar al operador al instante sobre operaciones exitosas, advertencias o excepciones sin interrumpir su flujo de trabajo.
2. **Bandeja Histórica y Persistente (`NotificationTray`):** Proporcionar una bandeja en el encabezado principal de la aplicación (`TopBar`) que consolide avisos de sistema, cambios de estado fiscal/tasas y mensajes administrativos.
3. **Aislamiento Multi-Usuario en Firestore:** Garantizar que cada usuario mantenga un estado de lectura (*leído / no leído*) independiente, sin duplicar documentos ni saturar la cuota del plan gratuito Spark de Firebase.

---

## 2. Filosofía Arquitectónica: Patrón Dual-Dispatch

El ecosistema implementa el patrón **Dual-Dispatch**, separando la capa efímera de atención inmediata de la capa persistente de registro:

```
                      [ Evento / Disparador en la App ]
                                    │
                                    ▼
                          notifications:push
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
           [ HUDFeedbackManager ]        [ NotificationService ]
                     │                             │
                     ▼                             ▼
             ui:notification_hud              addDoc(db, 'notifications')
                     │                             │
          Toast Flotante en Pantalla               ▼
             (Auto-cierre en 4s)           Escucha en Tiempo Real (onSnapshot)
                                                   │
                                                   ▼
                                         notifications:updated
                                                   │
                                                   ▼
                                        [ NotificationTray UI ]
                                        (Punto de Alerta en TopBar)
```

1. **Capa Transitoria (Toast HUD):** `HUDFeedbackManager.js` monta mensajes visuales en `#buca-hud-feedback-container` con una duración de 4 segundos. Si el motor gráfico detecta estrangulamiento térmico (`buca-thermal-throttle`), se adapta automáticamente a un estilo económico sin efectos pesados de desenfoque.
2. **Capa Persistente (Firestore Tray):** `NotificationService.js` persiste el documento en la colección `/notifications`. Al registrarse en la base de datos, el listener en tiempo real (`onSnapshot`) actualiza de inmediato todas las instancias abiertas del sistema.

---

## 3. Modelo de Datos Firestore y Patrón Multi-Usuario "Read-By Array"

### 3.1. ¿Cómo se resuelve el dilema multi-usuario?
En aplicaciones multi-usuario estándar, cuando un administrador publica un aviso global (por ejemplo: *"Se ha actualizado la tasa oficial BCV a Bs. 36.50"*), existen dos enfoques comunes:

* **Enfoque Anti-Patrón (Fan-Out / Duplicación de Documentos):** Crear 1 copia del documento por cada usuario del sistema.  
  * *Problema:* Para 100 usuarios, requiere 100 escrituras y 100 lecturas. Destruye la cuota del Spark Plan y satura Firestore.
* **Enfoque Canónico BUCA (Patrón "Read-By Array"):** Almacenar un **único documento global** en `/notifications` que contiene un arreglo `read_by: []`.  
  * Cuando el usuario $U_1$ lee la notificación, su UID se agrega atómicamente a `read_by` mediante `arrayUnion(uid)`.
  * La interfaz calcula en tiempo de renderizado si el usuario en sesión actual ha leído o no la notificación:
    ```javascript
    const isRead = notification.read_by?.includes(currentUid);
    ```
  * *Ventaja:* 1 sola escritura al crear el aviso para todos los usuarios. Cada usuario solo escribe para registrar su propia lectura. Completa independencia sin conflictos de concurrencia.

### 3.2. Esquema del Documento (`/notifications/{notificationId}`)

```typescript
interface SystemNotification {
    id?: string;                // ID autogenerado por Firestore
    title: string;              // Título descriptivo (ej: "Actualización de Tasa")
    message: string;            // Detalle o descripción técnica
    type: 'info' | 'success' | 'warning' | 'error'; // Severidad
    timestamp: FieldValue;      // serverTimestamp() de Firestore
    read_by: string[];          // Lista de UIDs de usuarios que la han leído
    author_id: string;          // 'system' o UID del usuario emisor
    target_tenant: string|null; // ID de empresa/workspace (para multi-tenancy)
}
```

### 3.3. Reglas de Seguridad Validadas (`firestore.rules`)

Las reglas garantizan que ningún usuario pueda eliminar notificaciones de otros ni alterar el contenido original, permitiendo únicamente añadir su propio UID al arreglo `read_by`:

```javascript
match /notifications/{notifId} {
    // Lectura: Cualquier usuario autenticado
    allow read: if request.auth != null;
    
    // Creación: Usuarios autenticados
    allow create: if request.auth != null;
    
    // Actualización: Solo permitir agregar el propio UID a read_by
    allow update: if request.auth != null && 
                 request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read_by']) &&
                 request.resource.data.read_by.hasAll(resource.data.read_by) &&
                 request.auth.uid in request.resource.data.read_by;
                 
    // Eliminación: Reservada para administradores del sistema
    allow delete: if request.auth != null && 
                 request.auth.token.role in ['admin', 'superadmin'];
}
```

---

## 4. Bus Central de Eventos (`eventBus`) y Reactividad

Toda la comunicación interna está orquestada a través de `src/core/eventBus/index.js` para desacoplar vistas, servicios y componentes de interfaz:

| Canal | Emisor | Payload | Receptor | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| `notifications:push` | Cualquier Módulo / Servicio | `{ title, message, type }` | `NotificationService` | Dispara el flujo Dual-Dispatch (HUD + Firestore). |
| `ui:notification_hud` | `NotificationService` | `{ title, message, type }` | `HUDFeedbackManager` | Muestra el toast en pantalla inmediatamente. |
| `notifications:updated` | `NotificationService` | `Array<Notification>` | `TopBar`, `NotificationTray` | Actualiza la lista y el contador de insignias. |
| `notifications:mark_as_read` | Elemento de la bandeja / Botón | `{ id: string }` | `NotificationService` | Agrega el UID actual a `read_by` en Firestore. |
| `ui:clear_notifications` | Botón "Marcar todas leídas" | `{}` | `NotificationService` | Marca concurrentemente todas las no leídas del usuario. |
| `tray:filter_tab` | Pestaña en `NotificationTray` | `{ tab: 'all'\|'unread'\|'system' }` | `ActionDispatcher` | Filtra la vista sin reconsultar Firestore. |

---

## 5. Lógica de Disparo para Notificaciones de Sistema

Las notificaciones del sistema se generan ante eventos clave de la infraestructura:

### 5.1. Errores de Conectividad y Red (`BaseClient.js`)
Si una petición HTTP a servicios externos (ej. BCV, endpoints de facturación o EmailJS) falla repetidamente:
```javascript
eventBus.emit('notifications:push', {
    title: 'Fallo de Conexión en Red',
    message: `No se pudo sincronizar el recurso ${endpoint}. Operando en caché local.`,
    type: 'error'
});
```

### 5.2. Errores de Carga en Modales (`ModalTemplates.js` y `ModalService.js`)
Cuando un módulo pesado o componente bajo demanda falla al inicializarse:
```javascript
eventBus.emit('notifications:push', {
    title: 'Error de Inicialización UI',
    message: 'El modal solicitado no pudo desplegarse correctamente.',
    type: 'warning'
});
```

### 5.3. Pánico Térmico del Motor Gráfico (`BucaNeuralEngine.js`)
Si el monitor de cuadros por segundo detecta caídas prolongadas (< 30 FPS en móviles):
```javascript
eventBus.emit('notifications:push', {
    title: 'Optimización BNE Activada',
    message: 'El motor gráfico ha reducido efectos visuales para proteger el rendimiento.',
    type: 'warning'
});
```

### 5.4. Difusión de Tasa Cambiaria Oficial (`RateModal.js`)
Al ingresar o modificarse la tasa oficial del día:
```javascript
eventBus.emit('notifications:push', {
    title: 'Tasa BCV Actualizada',
    message: `Nueva tasa oficial establecida en Bs. ${rate.toFixed(2)} / USD.`,
    type: 'info'
});
```

---

## 6. Componente UI `NotificationTray`

Ubicado en `src/shared/ui/components/notifications/NotificationTray.js`, este componente reemplaza los paneles estáticos por una bandeja interactiva de grado empresarial:

### 6.1. Características Principales
* **Pestañas de Filtrado Dinámico:**
  * **Todas:** Historial completo recibido por la estación de trabajo.
  * **No leídas:** Exclusivamente elementos donde `!read_by.includes(uid)`.
  * **Sistema:** Notificaciones de tipo `warning`, `error` o emitidas por el autor `system`.
* **Micro-Interacciones de Lectura:**
  * Botón específico `Marcar leída` en cada tarjeta con icono de comprobación (`bi-check2`).
  * Al marcarse como leída, la opacidad se atenúa al 65% y el borde de acento se neutraliza.
  * La insignia numérica en el encabezado disminuye en tiempo real.
* **Acciones Masivas:**
  * Botón de pie de panel: `"Marcar todas leídas"` (`ui:clear_notifications`).
  * Enlace directo a la auditoría cronológica del ERP (`ui:open_activity_log`).
* **Diseño Adaptativo Móvil / Desktop:**
  * **En Escritorio (Desktop):** Flota anclado al botón de campana mediante `FloatingPanelManager.js` con estética Corporate Hybrid Glass.
  * **En Móvil (≤767px):** Se transforma automáticamente en un **Bottom Sheet táctil** que emerge desde la parte inferior de la pantalla con handle táctil (`swipe-down` para cerrar).

---

## 7. Guía Práctica de Integración para Desarrolladores

Para disparar una notificación desde cualquier vista o servicio de la aplicación, solo se requiere importar `eventBus` y emitir en el canal `notifications:push`:

```javascript
import { eventBus } from '@/core/eventBus/index.js';

// Ejemplo 1: Alerta de Éxito en una Venta POS
eventBus.emit('notifications:push', {
    title: 'Venta Procesada Exitosamente',
    message: 'Comprobante #4092 emitido con factura electrónica.',
    type: 'success'
});

// Ejemplo 2: Advertencia de Inventario Crítico
eventBus.emit('notifications:push', {
    title: 'Existencia Crítica',
    message: 'El producto "Harina Pan 1kg" ha alcanzado el umbral mínimo (3 unidades).',
    type: 'warning'
});

// Ejemplo 3: Excepción o Error Operativo
eventBus.emit('notifications:push', {
    title: 'Transacción Declinada',
    message: 'El punto de venta reportó fallo de comunicación con el banco emisor.',
    type: 'error'
});
```

El sistema se encarga de manera transparente de:
1. Desplegar el Toast HUD en pantalla.
2. Registrar el evento en Firestore.
3. Actualizar la bandeja `NotificationTray` de todos los usuarios conectados.
4. Preservar el estado de lectura independiente para cada usuario.

---

## 8. Conclusión

La implementación de `NotificationTray` junto con el patrón `read_by` en Firestore y el canal centralizado `eventBus`:
* **Elimina duplicaciones de código** al centralizar la visualización de alertas.
* **Protege las cuotas del servidor** con lecturas atómicas de Firestore.
* **Mejora la experiencia de usuario** permitiendo filtrado rápido y control total sobre notificaciones leídas y no leídas sin recargar la página.
