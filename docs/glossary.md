# 📖 Glosario Corporativo y Conceptual — B.U.C.A. AI

> **Documento:** Terminología Técnica, Patrones Propietarios y Conceptos Arquitectónicos del Ecosistema  
> **Alcance:** Definiciones canónicas para desarrolladores, auditores y agentes de IA

---

### A

#### AAL2 (Authenticator Assurance Level 2)
Nivel de garantía de autenticación definido por el estándar NIST SP 800-63B. En B.U.C.A. AI se alcanza cuando el operador supera un primer factor de conocimiento (contraseña) y un segundo factor de posesión físico basado en tiempo (TOTP RFC 6238).

#### ActionDispatcher
Servicio central del Kernel que intercepta eventos globales del DOM mediante delegación de eventos (`document.addEventListener('click', ...)`), identificando elementos con el atributo `data-action="modulo:accion"` y enrutándolos hacia los controladores correspondientes.

#### Activity Log (Bitácora Inmutable)
Tabla relacional en PostgreSQL (`public.activity_log`) diseñada bajo la directriz de solo inserción (Append-Only) para registrar auditorías de eventos críticos, modificaciones de tasas y accesos de seguridad.

---

### B

#### BNE (Buca Neural Engine)
Motor gráfico procedural del sistema (`src/core/engine/`) encargado de calibrar la tasa de cuadros por segundo (FPS), la latencia de renderizado y el consumo térmico/memoria, conmutando la interfaz entre perfiles de calidad gráfica `L0`, `L1`, `L2` y `L3`.

#### BNE-RULE-001
Regla de oro de la ingeniería gráfica de B.U.C.A. AI que estipula que cualquier selector o componente que utilice efectos de desenfoque (`backdrop-filter: blur(...)`) debe obligatoriamente contar con una variante para `[data-buca-perf="L0"]` que aplique un fondo sólido opaco (`var(--surface-solid)`).

#### Brecha Cambiaria (Exchange Rate Gap %)
Diferencial porcentual entre la tasa oficial regulada (ej. BCV en Venezuela) y la tasa de mercado alternativo o criptoactivo (USDT / Paralelo). Se calcula automáticamente mediante la fórmula:
$$\text{Brecha (\%)} = \left(\frac{\text{Tasa Paralela} - \text{Tasa Oficial}}{\text{Tasa Oficial}}\right) \times 100$$

---

### C

#### Clean Core Architecture
Patrón de diseño por capas concéntricas (`src/core/`, `src/modules/`, `src/shared/`) que prohíbe el uso de frameworks externos invasivos (React, Vue, Angular) y aísla la lógica de bajo nivel del Kernel de los dominios comerciales de negocio.

#### Corporate Hybrid Glass
Lenguaje visual y sistema de diseño propio de B.U.C.A. AI. Combina superficies translúcidas con desenfoque de fondo dinámico, bordes con brillo sutil y alta densidad de información estructurada para entornos ERP empresariales.

---

### D

#### Drive Pattern (Patrón Polimórfico de Almacenamiento)
Arquitectura de persistencia desacoplada implementada a través de `StorageAdapter.js`. Permite a los módulos interactuar con una interfaz uniforme (`get`, `set`, `remove`, `list`) mientras el adaptador delega las operaciones al controlador idóneo (`MemoryDriver`, `LocalDriver`, `IndexedDBDriver` o `SupabaseDriver`).

#### Dual-Dispatch Notifications
Patrón de despacho reactivo dual para notificaciones y alertas. El sistema emite la alerta simultáneamente hacia un HUD visual efímero en pantalla (toast inmediato con háptica) y hacia la base de datos persistente (`public.notifications`) con control de lectura multiusuario (`read_by: uuid[]`).

---

### F

#### Fail-Open Guard (Guarda de Falla Abierta)
Mecanismo de resiliencia del Kernel ante caídas de red o fallos de conexión externa. Si la API remota de cotizaciones o el backend no responden durante el arranque, el sistema no bloquea la interfaz de usuario; en su lugar, utiliza el último snapshot anclado en almacenamiento local y continúa operando de forma offline.

---

### G

#### Ghost Sanitizer
Mecanismo de seguridad de memoria del BNE (`src/core/engine/safety/GhostSanitizer.js`). Al destruir o conmutar vistas en el SPA Router, escanea y desconecta nodos zombi del DOM, observadores de mutación huérfanos y listeners de eventos no liberados.

---

### I

#### Idempotency Key (Clave de Idempotencia)
Identificador criptográfico único asignado a operaciones transaccionales offline (`tx:uuid` o hash SHA-256). Almacenado en la tabla `public.idempotency_keys` para garantizar que la retransmisión de órdenes o cobros no se procese por duplicado en el servidor.

#### InitPlan O(1) Optimization
Directiva de diseño de políticas de seguridad en PostgreSQL (RLS). Consiste en envolver las funciones de contexto (`auth.uid()`) dentro de una subconsulta escalar `(SELECT auth.uid())`. Esto permite al optimizador de consultas de Postgres calcular el valor una sola vez por sentencia ($O(1)$) en lugar de recalcularlo por cada fila escaneada ($O(N)$).

---

### M

#### ModuleLoader
Subsistema de carga dinámica asíncrona (`src/core/ModuleLoader.js`) que implementa code-splitting por ruta, soporte de reintentos, precarga perezosa en periodos de inactividad de la CPU (`requestIdleCallback`) y un registro estático de respaldo ante contingencias de red.

---

### R

#### Reflow Guard
Subsistema de optimización visual del BNE (`src/core/engine/safety/ReflowGuard.js`) que previene el *Layout Thrashing* en el navegador mediante el almacenamiento en búfer de lecturas geométricas y la ejecución programada de escrituras al DOM.

---

### S

#### Snapshot Pattern (Patrón de Instantánea Inmutable)
Directiva financiera y de base de datos que exige que cada transacción, venta o cierre de caja capture y almacene una instantánea estática e inmutable de los precios, tasas cambiarias e impuestos vigentes en el instante exacto de la operación. Prohíbe terminantemente calcular totales históricos consultando tasas cambiarias en tiempo real.

---

### T

#### Tasas Ancladas (Anchored Exchange Rates)
Modelo contable donde el valor monetario de los productos, cuentas por cobrar y pasivos se almacena de forma soberana en una divisa base estable (USD), actualizando su expresión transaccional en moneda local (VES) mediante la cotización fijada y autorizada por la administración del comercio.

#### Thin Shell Satellite Architecture (Cascarón Satélite)
Arquitectura del módulo `workspace` en la cual la página principal actúa como un cascarón orquestador de componentes livianos y provee vistas satélite procedimentales (`module-placeholder-page.js`) para rutas secundarias del dock, garantizando una navegación unificada y fluida sin deuda técnica.
