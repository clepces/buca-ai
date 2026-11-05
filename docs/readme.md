# B.U.C.A. AI — Business Under Control Access

> **"Inteligencia, Resiliencia y Control Total para Negocios en Expansión"**  
> *Plataforma Modular Anti-Crisis para la Autonomía Económica y la Gestión Empresarial Descentralizada*

---

## 1. Ficha Técnica del Proyecto

* **Nombre Oficial:** B.U.C.A. AI (Business Under Control Access)
* **Slogan Corporativo:** *"Inteligencia, Resiliencia y Control Total para Negocios en Expansión"*
* **Arquitectura de Software:** Single Page Application (SPA) Progresiva (PWA) Modular
* **Tecnología Frontend:** Vanilla JavaScript Puro (ES6+ Moderno), HTML5 Semántico, SASS (SCSS) Modular
* **Regla de Oro Tecnológica:** **CERO FRAMEWORKS** (Prohibido React, Vue, Angular o Svelte)
* **Persistencia & Nube:** Firebase Firestore & Firebase Authentication (Optimizada para Plan Spark $0.00 USD)
* **Comunicaciones Transaccionales:** EmailJS API (Verificación 2FA, Alertas de Seguridad y Notificaciones)
* **Build Tool:** Vite con empaquetado optimizado por chunks dinámicos
* **Versión del Sistema:** 1.0.0 (Master de Producción)
* **Contexto:** Multi-Tenant | Multi-Moneda (VES, USD, EUR, USDT) | Multi-Económico | Sistema de Control de Crisis

---

## 2. Introducción y Visión General

**B.U.C.A. AI** nace con la misión fundamental de enfrentar la volatilidad económica y evitar el colapso operativo de los comercios y emprendimientos causado por factores internos (descontrol de inventario, fugas de caja, mala asignación de precios) o externos (inflación descontrolada, brecha cambiaria, cortes de conectividad).

Es una plataforma global diseñada para empoderar a quienes desean iniciar un negocio propio o consolidar empresas activas, revolucionando su gestión cotidiana y brindándoles la capacidad de expandirse exponencialmente. Su ventaja competitiva decisiva radica en su **arquitectura modular de alta disponibilidad**, su diseño ultraligero que opera con fluidez en hardware estándar o de bajos recursos, y su capacidad de funcionamiento con persistencia local resistente a fallos de red.

Tradicionalmente, los emprendedores enfrentan tres barreras críticas:
1. **Falta de capital e inversión inaccesible.**
2. **Proveedores fragmentados y cálculo de reposición distorsionado.**
3. **Escasez de personal de confianza y software rígido con licencias costosas.**

B.U.C.A. AI rompe estos paradigmas ofreciendo un entorno empresarial todo-en-uno que unifica punto de venta (POS), inventario multi-almacén, facturación bi-monetaria, directorio comercial y un ecosistema de colaboración laboral dinámico.

---

## 3. Arquitectura de Cuentas y Entorno Visual Híbrido (UX)

En **B.U.C.A. AI**, el registro de usuario no crea un perfil estático; otorga acceso inmediato a un modelo híbrido de identidades estructurado en base de datos como:

$$\text{USUARIO} \Longleftrightarrow [\text{OWNER}] \;\Big|\; [\text{WORKER}]$$

Al iniciar sesión, la interfaz no encasilla al usuario en un rol único ni requiere cuentas separadas. El espacio de trabajo (*Workspace*) divide sus capacidades en dos entornos interactivos conmutables con un solo clic:

```
                  ┌──────────────────────────────────────────────┐
                  │          USUARIO AUTENTICADO B.U.C.A.        │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    SECCIÓN "MIS PROPIEDADES"│                   │ SECCIÓN "MIS COLABORACIONES"│
   │       (Modo Owner)        │                   │       (Modo Worker)       │
   ├───────────────────────────┤                   ├───────────────────────────┤
   │ • Control total del ERP   │                   │ • Modo Espejo visual      │
   │ • Gestión de inventario   │                   │ • Tareas operativas POS   │
   │ • Precios y finanzas      │                   │ • Permisos por claims     │
   │ • Contratación de personal│                   │ • Horarios y turnos       │
   │ • Solicitud de inversión  │                   │ • Reputación bilateral   │
   └───────────────────────────┘                   └───────────────────────────┘
```

### 3.1. Sección "Mis Propiedades" (Modo Owner)
Es el centro de mando y soberanía empresarial del usuario.
* **Autonomía Total:** El usuario visualiza, configura y administra las unidades de negocio que él mismo dio de alta en la plataforma.
* **Control Financiero:** Control de costos de reposición, tasas de cambio oficiales (BCV) y paralelas, márgenes de utilidad reales y arqueos de caja.
* **Seguridad y Privacidad Blindada:** Los datos de sus propiedades son estrictamente confidenciales. Ningún negocio externo donde el usuario preste servicios como empleado podrá visualizar la información comercial de sus propiedades privadas.

### 3.2. Sección "Mis Colaboraciones" (Modo Worker)
Es el espacio de monetización de talento y empleo flexible.
* **Anclaje Automático:** Cuando otro comercio contrata al usuario mediante su correo o identificador, el negocio aparece automáticamente en su panel de colaboraciones.
* **Activación de "Modo Espejo" Visual:** Al ingresar a un negocio ajeno, la interfaz muta de forma inmediata, limitando la navegación exclusivamente a los módulos concedidos por el dueño (por ejemplo: Terminal POS para un cajero, Recepción de Mercancía para un almacenista).
* **Multiempleo y Flexibilidad:** El usuario puede colaborar en múltiples negocios simultáneamente, gestionando sus turnos en la agenda integrada sin perder jamás su estatus de Owner en sus propios proyectos.

---

## 4. Filosofía de Roles: Libertad y Crecimiento Sin Límites

Los roles en B.U.C.A. AI no son jerarquías opresivas; son herramientas de crecimiento personal y económico.

### 4.1. Roles Globales de la Infraestructura
1. **`super_admin`:** Administrador global y desarrollador de la infraestructura. Posee acceso para supervisión técnica, configuración de pasarelas, monitoreo de emuladores y auditoría del sistema.
2. **`admin`:** Personal de soporte corporativo y mediación. Gestiona incidentes globales, verifica validaciones de seguridad y asiste a comercios en la configuración de sus entornos.

### 4.2. Identidades de Negocio
* **👑 Owner (Dueño/a de tu Vida y tu Negocio):** Identidad soberana. Crea comercios, define almacenes, fija precios, analiza la rentabilidad y evalúa solicitudes de inversión de otros miembros del ecosistema.
* **💼 Worker (Tu Talento en Acción):** Identidad operativa. Permite al usuario prestar servicios especializados (cajero, despachador, gerente de turno, auditor de inventario). Incluye un sistema de **Reputación Bilateral**, donde el empleado califica al empleador por puntualidad y condiciones laborales, y el empleador califica el desempeño técnico del trabajador.

---

## 5. Especificaciones de Entorno e Integración (Google AI Studio & Firebase)

Para garantizar la interoperabilidad con plataformas como Google AI Studio y el despliegue serverless en la capa Spark de Firebase:
1. **Puro Vanilla JS (ES6+):** Sin dependencias de runtime como React, Vue o bundlers monolíticos opacos. El código corre de forma nativa en cualquier navegador moderno.
2. **Base de Datos NoSQL Firestore:** Modelo desnormalizado optimizado para lecturas eficientes (máximo 50,000 lecturas/día y 20,000 escrituras/día bajo plan gratuito).
3. **Manejo Seguro de Secretos:** Integración con emuladores locales (`localhost:9099` para Auth y `localhost:8080` para Firestore) durante desarrollo, evitando consumir cuotas de producción.
4. **Notificaciones por EmailJS:** Validación de dispositivos confiables (2FA) y confirmación de accesos mediante plantillas transaccionales seguras sin necesidad de servidores SMTP dedicados.
