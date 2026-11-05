# B.U.C.A. AI — Manuscrito de Arquitectura, Diagnóstico Comparativo y Hoja de Ruta Maestra

> **Documento:** Informe Técnico de Ingeniería de Software, Auditoría Comparativa y Plan de Armonización  
> **Autor:** Equipo de Ingeniería de Software (Core Platform & Architecture)  
> **Versión del Sistema:** 1.1.0 (Master de Producción)  
> **Estado de la Plataforma:** En Estabilización y Transición Híbrida Live  
> **Enfoque Tecnológico:** Vanilla JavaScript Puro (ES6+), SASS Modular, HTML5 Semántico, Firebase Firestore & Auth, EmailJS  
> **Regla de Integridad:** **CERO FRAMEWORKS** | **PRESUPUESTO $0.00 USD (Spark Plan)** | **AISLAMIENTO MULTI-TENANT**

---

## 1. Resumen Ejecutivo y Estado Actual del Proyecto

El sistema **B.U.C.A. AI (Business Under Control Access)** es una Single Page Application (SPA) modular progresiva diseñada para operar como una plataforma empresarial anti-crisis. Su propósito central es garantizar la continuidad de negocio, la exactitud contable bi-monetaria (USD / Bolívares) y la soberanía operativa de pequeños y medianos comercios, protegiéndolos de la devaluación acelerada, los cortes de conectividad y la pérdida de control de inventarios.

### 1.1. Arquitectura Base del Proyecto Real
A diferencia de aplicaciones monolíticas convencionales o basadas en frameworks pesados (React, Angular o Vue), el repositorio actual de B.U.C.A. AI opera sobre un **núcleo puro en Vanilla JS modular**, organizado estrictamente bajo el principio de separación de responsabilidades en tres capas:

1. **`src/core/` (El Motor del Sistema):**
   * **`kernel.js`**: Orquestador maestro del ciclo de vida de la aplicación y arranque procedural.
   * **`ModuleLoader.js`**: Cargador dinámico asíncrono para code-splitting bajo demanda.
   * **`config/`**: Configuración centralizada de variables de aplicación (`config.js`), entorno (`environment.js`) y servicios en la nube (`firebase.js`).
   * **`router/`**: Enrutador SPA nativo basado en la History API con guardias de seguridad (`guards.js`) y ciclo de desmontaje limpio.
   * **`eventBus/`**: Despachador reactivo desacoplado (`src/core/eventBus/index.js`), estructurado sobre `Map` y `Set`, con soporte nativo de comodines (`*`), middlewares globales (`use()`), desuscripción en $O(1)$ y telemetría de rendimiento para 60 FPS.
   * **`state/`**: Almacén reactivo de estado global (`session.js`, `global.js`, `ui.js`, `store.js`) con sincronización rAF.
   * **`storage/`**: Adaptador polimórfico de persistencia local (`StorageAdapter.js`) con soporte cifrado para `localStorage` e `IndexedDB`.
   * **`engine/`**: **Buca Neural Engine (BNE)**, motor de optimización gráfica que monitorea FPS y latencia, conmutando dinámicamente entre perfiles L0 (Eco), L1 (Balanced), L2 (Pro) y L3 (Ultra).

2. **`src/modules/` (Dominios de Negocio Aislados):**
   * **`auth/`**: Módulo de autenticación (Login, Registro, Recuperación, Verificación de 2FA y perfiles de sesión).
   * **`workspace/`**: Espacio de trabajo corporativo (Dashboard, vitrina de negocios `BusinessHub`, telemetría operativa y vistas procedimentales para sub-módulos).

3. **`src/shared/` (Recursos Transversales Compartidos):**
   * **`ui/`**: Componentes reutilizables (`TopBar`, `DockableNavbar`, layouts de pantalla).
   * **`overlays/`**: Modales del sistema (`RateModal`, `PerformanceModal`, `EmulatorModal`, `ModalService`).
   * **`styles/`**: Sistema de diseño "Corporate Hybrid Glass" estructurado en SASS modular.

---

## 2. Configuración de Entornos y Desactivación de Cuenta Demo

En cumplimiento directo de las directrices del usuario, se ha implementado la gestión centralizada de entornos y la encapsulación defensiva de las funciones de prueba.

### 2.1. Propiedad Agregada en `src/core/config/config.js`
Se incorporó el bloque `ENV` dentro de la constante maestra `CONFIG`, centralizando los flags de desarrollo y producción:

```javascript
export const CONFIG = {
    APP: { ... },

    /**
     * Variables de Entorno y Control de Despliegue
     * - IS_PRODUCTION: false (desarrollo activo) | true (producción - desactiva cuentas demo y accesos temporales)
     * - IS_DEVELOPMENT: true cuando se trabaja localmente o en entornos de prueba
     * - SHOW_DEMO_ACCOUNTS: true muestra el selector de cuentas demo en login; se desactiva automáticamente en producción
     * - USE_EMULATOR: true para desviar tráfico a emuladores locales de Firebase
     */
    ENV: {
        MODE: 'development', // 'development' | 'production'
        IS_DEVELOPMENT: true,
        IS_PRODUCTION: false,
        SHOW_DEMO_ACCOUNTS: true,
        USE_EMULATOR: false
    },

    DATABASE: {
        COLLECTIONS: {
            GLOBAL_CONFIG: 'global_config',
            USERS: 'users',
            BUSINESSES: 'businesses',
            ACTIVITY_LOG: 'activity_log',
            NOTIFICATIONS: 'notifications',
            USER_WORKSPACES: 'workspaces',
            STAFF: 'staff',
            ROLES: 'roles',
            CATEGORIES: 'categories',
            WAREHOUSES: 'warehouses',
            PRODUCTS: 'products',
            INVENTORY_LOTS: 'inventory_lots',
            SALES: 'sales',
            CASH_SHIFTS: 'cash_shifts',
            PURCHASES: 'purchases',
            CUSTOMERS: 'customers',
            SUPPLIERS: 'suppliers',
            EXPENSES: 'expenses',
            SEQUENCES: 'sequences',
            CREDIT_NOTES: 'credit_notes'
        }
    },
    ...
};
```

### 2.2. Encapsulación de la Cuenta Demo en `LoginForm.js`
* **Cero Eliminación de Código HTML:** No se eliminó el marcado de cuentas demo; fue encapsulado reactivamente mediante condicionales de plantilla ES6:
  ```javascript
  const isProd = CONFIG?.ENV?.IS_PRODUCTION || CONFIG?.ENV?.MODE === 'production';
  const showDemoAccounts = !isProd && Boolean(CONFIG?.ENV?.SHOW_DEMO_ACCOUNTS);
  ```
* **Comportamiento en Producción (`IS_PRODUCTION: true` o `SHOW_DEMO_ACCOUNTS: false`):**
  1. El contenedor del selector de cuentas demo (`#demo-accounts-wrapper`) **no se renderiza en el DOM**.
  2. Los campos de texto de correo y contraseña se inicializan vacíos (`value=""`) con placeholders genéricos (`usuario@empresa.com`).
  3. En `init()`, los listeners de clics se salvaguardan verificando si existen botones demo antes de vincular eventos, eliminando cualquier error en consola.
  4. En `AuthService.js`, se desactiva automáticamente el bypass de credenciales demo, exigiendo autenticación estricta contra Firebase Authentication en la nube.

### 2.3. Configuración para Firebase App & Cloud Firestore
Cuando la aplicación conmuta entre producción y desarrollo:
* **En Producción (`IS_PRODUCTION: true`):**
  * `src/core/config/firebase.js` bloquea cualquier conexión hacia emuladores locales (`localhost:9099`, `localhost:8080`, `localhost:5001`).
  * Se enlaza directamente a la base de datos Firestore viva del proyecto `buca-scdbs` (`firestoreDatabaseId: "(default)"`) utilizando el SDK oficial v9+ modular (`firebase/firestore`, `firebase/auth`).
  * Se activa el `persistentLocalCache` con `persistentMultipleTabManager` para mantener la sesión y caché local sincronizados entre múltiples pestañas del navegador sin generar lecturas duplicadas.
* **En Desarrollo (`IS_DEVELOPMENT: true` / producción desactivada):**
  * La aplicación sigue conectada a Firestore de forma segura, pero permite opcionalmente habilitar emuladores si se declara `USE_EMULATOR: true`.

---

## 3. Especificación de API REST, Cloud Functions y Servicios Externos (`docs/api.md`)

Uno de los puntos clave a aclarar en este manuscrito es cómo se interpreta y ejecuta la arquitectura de red descrita en `docs/api.md`:

### 3.1. ¿Por qué NO necesitamos un Servidor REST Tradicional (Express/Node)?
En arquitecturas web convencionales, el frontend hace peticiones `fetch('/api/v1/products')` a un servidor Node.js/Express, el cual consulta una base de datos SQL/NoSQL y responde. 
* **El Problema:** Requiere mantener un servidor encendido 24/7, lo cual **rompe la regla de costo $0.00 USD** (costes de hosting, CPU y memoria).
* **La Solución Serverless en B.U.C.A. AI:** Nuestra SPA en Vanilla JS se conecta **directamente** a Firebase Firestore y Firebase Auth mediante el SDK cliente oficial. 
  * Las lecturas y escrituras se validan en el borde (*at the edge*) mediante las reglas de seguridad `firestore.rules`.
  * La latencia es casi instantánea gracias al `persistentLocalCache` de Firestore en el navegador.

### 3.2. ¿Qué Rol Cumple el Sobre Canónico (Envelope) de `docs/api.md`?
Aunque consultemos Firestore directamente en cliente, nuestros servicios modulares (`src/modules/*/services/`) y adaptadores HTTP (`src/core/api/BaseClient.js`) deben devolver los datos envueltos en el sobre canónico estandarizado:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 45, "cursor": "doc_id_99" },
  "timestamp": "2026-10-31T21:00:00.000Z"
}
```
Y para errores:
```json
{
  "success": false,
  "error": "No posee autorización para modificar el inventario.",
  "code": "permission-denied"
}
```
**Ventaja:** Si en el futuro se añade un microservicio externo o Cloud Function, la interfaz de usuario no cambia en lo absoluto. Todo el frontend consume el mismo contrato de respuesta predecible y seguro (Cero Stack Traces).

### 3.3. ¿Para Qué Sí Se Utilizan Cloud Functions?
Las Cloud Functions se reservan estrictamente para tareas que un cliente en el navegador no debe o no puede ejecutar por seguridad o límites del entorno:
1. **Cron Job de Tasas Oficiales (BCV):** Tarea programada cada 4 horas que consulta el portal del Banco Central de Venezuela y actualiza el documento `/global_config/main` en Firestore.
2. **Consecutivos Fiscales Estrictos (`/sequences/`):** Si dos cajas cobran en el mismo milisegundo, una transacción en Cloud Function garantiza que jamás se duplique un número de factura (`FAC-000100`).
3. **Manejo Seguro de Claims Administrativos:** Asignar o revocar roles de `super_admin` o `admin`.

### 3.4. Servicios Externos: EmailJS API a Costo $0.00 USD
Para evitar desplegar y pagar servidores SMTP dedicados (SendGrid, Mailgun, Postmark):
* La aplicación se conecta vía HTTPS REST a EmailJS (`https://api.emailjs.com/api/v1.0/email/send`).
* Utiliza tres plantillas transaccionales seguras:
  1. `template_auth_2fa`: Envío de código OTP de 6 dígitos con expiración de 10 minutos para autorizar nuevos dispositivos.
  2. `template_stock_alert`: Notificación al Owner cuando un producto alcanza su umbral mínimo de stock.
  3. `template_hire_notice`: Notificación a un colaborador cuando es dado de alta en la nómina de un negocio.

---

## 4. Base de Datos Firestore v4.1.0: Reingenierías Críticas y Hoja de Ruta

La base de datos es el corazón de B.U.C.A. AI. Como se especificó en la directriz del usuario, no se puede improvisar; debe implementarse de forma precisa y ordenada.

### 4.1. Resumen de las 6 Reingenierías Maestras a Implementar:
1. **Subcolección `users/{uid}/workspaces/{bizId}` y `display_cache`:**
   * Evita sobrecargar el documento raíz del usuario y elimina el problema de lecturas $N+1$.
   * El carrusel de negocios en el dashboard se dibuja en **0 ms** leyendo solo la subcolección de workspaces del usuario.
2. **Cuenta Híbrida Dual (`profile` vs `worker_profile`):**
   * En `profile`: datos personales y modo visual activo (`owner` o `worker`).
   * En `worker_profile`: habilidades (`skills`), biografía, disponibilidad y turnos completados. Es **100% gratuita de por vida**. La suscripción de pago solo aplica al Owner para crear empresas propias.
3. **Anclaje de Cuenta Corriente ("Fiado") en USD (`balance_usd`):**
   * En `customers/{id}/credit_account`, el saldo adeudado se registra congelado en dólares ($ USD).
   * Al pagar o abonar, se multiplica por la tasa oficial BCV del día del cobro, preservando íntegro el capital de trabajo del comercio frente a la inflación.
4. **Inmutabilidad Fiscal en `sales`:**
   * Cada comprobante de venta almacena una copia estática e inmutable de los productos vendidos con precio histórico, costo de reposición del lote en ese instante, tasa de cambio y desglose de IVA e IGTF.
5. **Numeración Fiscal Atómica (`sequences`):**
   * Contadores atómicos con prefijos estandarizados: `"FAC-"` (Factura Fiscal), `"NC-"` (Nota de Crédito) y `"TKT-"` (Ticket de Mostrador), con 6 dígitos de relleno.
6. **Trazabilidad FIFO por Lotes (`inventory_lots`):**
   * Subcolección en `/products/{id}/inventory_lots/{lotId}` que controla la fecha de vencimiento (`expiration_date`) y costo real de adquisición, asegurando que el Punto de Venta descargue contablemente la mercancía más antigua primero.

---

## 5. EventBus Central: El Potencial de Nuestra Implementación (`src/core/eventBus/index.js`)

Se ha aclarado documentalmente que **no se requiere ninguna migración externa**, ya que nuestro archivo `src/core/eventBus/index.js` **es exactamente la versión optimizada con `Map`, `Set`, comodines y middlewares**:

* **Rendimiento $O(1)$:** Desuscripción instantánea sin escaneos de arreglos.
* **Comodines Dinámicos (`*`):** Permite a los layouts y servicios escuchar familias enteras de eventos (`kernel:*`, `ui:*`, `router:*`).
* **Middlewares (`use()`):** Capacidad de interceptar, validar o registrar en auditoría (`activity_log`) cualquier evento emitido antes de que llegue a los suscriptores.
* **Telemetría para 60 FPS:** Monitorea suscriptores lentos (> 16 ms) para evitar tirones en las animaciones de la interfaz.

---

## 6. Plan de Acción y Consulta Previa antes de Editar Código

Siguiendo la instrucción preventiva del usuario (*"no podemos simplemente ir y editar código. Si vas a hacer algo, primero pregunta"*), se definen los siguientes pasos a coordinar:

1. **Fase 1 (Sincronización Completada):** Documentación unificada (`structure.md`, `migration-roadmap.md`, `events.md`, `components.md`, `database.md`), variables de entorno configuradas (`CONFIG.ENV`) y selector demo encapsulado.
2. **Fase 2 (Próximo Paso Sugerido para Aprobación):**
   * Crear los adaptadores de datos limpios en `src/modules/workspace/services/` para empezar a leer las unidades de negocio reales desde Firestore (`businesses` y `workspaces`) bajo la capa gratuita Spark.
   * Diseñar las interfaces operativas del Punto de Venta (`/pos`) e Inventario (`/inventory`) conectadas a las colecciones canónicas.

---

> **Conclusión:** El sistema se encuentra en estado óptimo de compilación y arquitectura. Toda la documentación está perfectamente alineada con el código real y lista para iniciar la conexión operativa con Firestore bajo confirmación del usuario.
