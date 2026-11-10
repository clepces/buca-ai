
# 🛡️ INFORME DE AUDITORÍA DE SEGURIDAD Y EVALUACIÓN DEL PLAN MFA — B.U.C.A. AI

---

### 1. Veredicto sobre el documento MFA (`docs/plan-implementacion-firebase-mfa.md`)

**Veredicto:** **APTO CON CAMBIOS SUSTANCIALES (No implementar todavía)**.

#### Justificación en lenguaje sencillo:
El documento identifica con precisión el problema de raíz: el 2FA casero actual (`TOTPService.js`) es una ilusión de seguridad porque el navegador genera, valida y guarda los secretos por su cuenta. Sin embargo, el plan todavía no se puede ejecutar tal como está redactado porque:
1. **Confunde capacidades:** Asume que `TotpSecret.generateQrCodeUrl()` genera una imagen QR lista para usar, cuando en realidad solo entrega una cadena de texto en formato `otpauth://`. Además, omite que para enrolar TOTP en Google Identity Platform es un requisito obligatorio que el usuario tenga su correo electrónico verificado (`emailVerified: true`).
2. **Ignora la reautenticación y la recuperación:** No contempla el error `auth/requires-recent-login` (exigido por Firebase antes de tocar factores de seguridad) ni define qué ocurre si el usuario extravía su teléfono (riesgo inminente de bloqueo total de cuenta).
3. **Mantiene código contradictorio en el cliente:** La aplicación actual marca al usuario como autenticado antes de presentar el PIN, permite autocompletar el código en pantalla y guarda secretos y roles en `localStorage` y Firestore. Implementar MFA encima de esta base dejaría puertas falsas abiertas.

---

### 2. Tabla de Afirmaciones del Documento MFA vs. Código Real

| # | Afirmación en el Documento | Evidencia en Código / Configuración | Estado | Acción Necesaria |
|---|---|---|---|---|
| **A1** | Firebase Auth MFA es compatible con el SDK instalado en el proyecto. | `package.json` (L39): `"firebase": "^11.0.2"`. El SDK modular v11 exporta `getMultiFactorResolver`, `TotpMultiFactorGenerator` y `multiFactor`. | **Correcto** | Mantener imports modulares desde `firebase/auth`. |
| **A2** | El enrolamiento TOTP genera el QR directamente con `totpSecret.generateQrCodeUrl()`. | La API de Firebase SDK solo retorna un string URI `otpauth://...`. En `TOTPService.js` (L84) se usaba un servicio externo (`api.qrserver.com`) que filtraba el secreto por HTTP GET. | **Incompleto y Riesgoso** | Incorporar una librería local de renderizado de QR (canvas/SVG) que dibuje la URI en el cliente sin enviar datos a servidores externos. |
| **A3** | El enrolamiento se puede iniciar directamente con `multiFactor(auth.currentUser).getSession()`. | Firebase Identity Platform exige que el usuario tenga correo verificado (`user.emailVerified === true`) y una sesión reciente (`auth/requires-recent-login`). | **Incompleto** | Exigir flujo previo de verificación de email y reautenticación con contraseña antes de solicitar la sesión de enrolamiento. |
| **A4** | Al ocurrir `auth/multi-factor-auth-required`, Google no emite tokens y el cliente captura el `resolver`. | En `AuthService.js` (L40-71), el login actual captura errores genéricos y marca `sessionState.isAuthenticated = true` antes de cualquier validación. | **Correcto en teoría, Incorrecto en código actual** | Reestructurar `AuthService.login` para interceptar `auth/multi-factor-auth-required`, congelar la sesión como "no autenticada" y entregar el `resolver` a un controlador en memoria. |
| **A5** | Las reglas de Firestore pueden comprobar MFA mediante `request.auth.token.firebase.sign_in_second_factor != null`. | `firestore.rules` (L73-100) no tiene actualmente ninguna regla o función que inspeccione `sign_in_second_factor`. En tokens de Firebase Identity Platform con TOTP, este claim efectivamente contiene `'totp'`. | **Correcto en Firebase, Pendiente en Reglas** | Agregar la función helper en `firestore.rules` y condicionar operaciones de alto impacto (modificar staff, borrar negocios, tasas maestras). |
| **A6** | El plan Blaze e Identity Platform se pueden activar a coste \$0.00. | `firebase-applet-config.json` apunta a `buca-scdbs`. Identity Platform tiene cuotas gratuitas de usuarios activos mensuales (MAU), pero exige tarjeta de crédito y vinculación de cuenta de facturación. | **Verificación Pendiente en Consola** | Consultar la documentación y la consola oficial de Google Cloud para confirmar la cuota gratuita vigente antes de activar Identity Platform. |
| **A7** | No se almacenan secretos ni códigos en el cliente ni en la base de datos. | `ProfileController.js` (L200, L204) guarda `totp_secret` en Firestore y en `localStorage`. `PINForm.js` (L34) imprime el PIN en pantalla con botón "Autocompletar". | **Contradicción Crítica** | Purgar inmediatamente todo guardado de secretos locales y eliminar el generador de PIN falso. |

---

### 3. Flujo MFA Propuesto (Paso a Paso con Recuperación y Cero Bloqueos)

```
[Inicio de Sesión]
  1. Usuario ingresa correo y contraseña.
  2. Firebase Provider ejecuta signInWithEmailAndPassword().
  3. Firebase responde con error: auth/multi-factor-auth-required + resolver.
  4. La sesión NO se marca como autenticada (currentUser es null).
  5. Se muestra la vista PINForm vinculada estrictamente al resolver en memoria.
  6. Usuario ingresa 6 dígitos de su app (Google Authenticator).
  7. Se crea assertion: TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code).
  8. resolver.resolveSignIn(assertion) finaliza exitosamente.
  9. Firebase emite el ID Token con claim { sign_in_second_factor: 'totp' }.
 10. Se activa sessionState.isAuthenticated = true y se permite el paso al ERP.

[Enrolamiento Seguro]
  1. Usuario autenticado entra a Seguridad de Perfil.
  2. El sistema verifica: ¿Email verificado? Si no, se exige verificar correo.
  3. Se solicita contraseña actual para reautenticar (reauthenticateWithCredential).
  4. Se solicita sesión MFA: multiFactor(user).getSession().
  5. Google genera el secreto: TotpMultiFactorGenerator.generateSecret(session).
  6. Se dibuja el QR en un <canvas> local mediante librería empaquetada (sin URLs externas).
  7. Usuario ingresa el primer código de 6 dígitos para probar sincronización.
  8. multiFactor(user).enroll(assertion, 'Dispositivo Principal').
  9. Se emite un conjunto de Códigos de Respaldo de Emergencia (imprimibles/descargables).

[Prevención de Bloqueo y Pérdida de Dispositivo]
  - Si el usuario pierde el móvil:
    a) Factor secundario alternativo (SMS o segundo autenticador si está configurado).
    b) Mecanismo administrativo de emergencia: Super Admin autenticado con MFA invoca una Cloud Function administrativa que valida identidad y desenrola el factor perdido (admin.auth().updateUser).
```

---

### 4. Hallazgos de Seguridad del Resto del Repositorio

#### 🔴 CRÍTICOS (Vulnerabilidades inmediatas de bypass y escalación)

1. **Bypass del Doble Factor y PIN expuesto en pantalla**
   - **Archivo:** [`src/modules/auth/pages/LoginPage.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/auth/pages/LoginPage.js#L76-L113) y [`src/modules/auth/components/PINForm.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/auth/components/PINForm.js#L28-L39).
   - **Detalle:** `LoginPage.js` genera un número aleatorio de 6 dígitos en JavaScript cliente (`Math.random()`), lo envía a `PINForm.js` y este componente lo imprime textualmente en pantalla con un botón "Autocompletar". Si el usuario presiona ese botón, el sistema da el 2FA por aprobado (`enteredPin === currentOtpCode`), saltándose por completo cualquier autenticación real.
2. **Sesión marcada como autenticada antes de resolver el segundo factor**
   - **Archivo:** [`src/modules/auth/services/AuthService.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/auth/services/AuthService.js#L60-L71) y [`src/modules/auth/components/LoginForm.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/auth/components/LoginForm.js#L87-L106).
   - **Detalle:** En cuanto la contraseña es válida, `AuthService.login` guarda `sessionState.set({ isAuthenticated: true })` y dispara `auth:login-success`. El formulario de PIN se muestra después como un adorno visual; si el usuario navega directamente a otra URL en el navegador, el router lo deja entrar porque ya tiene la sesión activa.
3. **Filtración de secreto TOTP a servidor externo no confiable**
   - **Archivo:** [`src/core/security/TOTPService.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/core/security/TOTPService.js#L84).
   - **Detalle:** La URL del QR apunta a `https://api.qrserver.com/v1/create-qr-code/?data=...`, enviando la clave secreta privada del usuario en texto plano a través de una petición HTTP GET a un tercero desconocido en internet.
4. **Almacenamiento de secretos TOTP y PIN en texto plano**
   - **Archivos:** [`src/modules/profile/ProfileController.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/profile/ProfileController.js#L197-L205), [`src/modules/auth/services/UserService.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/auth/services/UserService.js#L205-L298).
   - **Detalle:** La clave secreta de autenticación se guarda en `users/{uid}.security.totp_secret` de Firestore y en `localStorage.setItem('buca_totp_...')`. Además, el PIN universal del negocio se guarda en texto claro en `profile.pin_code`. Cualquier script en el cliente o extensión del navegador puede leerlos.

#### 🟠 ALTOS (Control de acceso deficiente y privilegios manipulables)

5. **Asignación de roles basada en correo y campos de cliente**
   - **Archivos:** [`src/modules/auth/services/AuthService.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/auth/services/AuthService.js#L14-L18,L58) y [`src/modules/auth/services/UserService.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/auth/services/UserService.js#L96).
   - **Detalle:** Existe una lista estática `DEMO_ROLES` con correos que otorgan `super_admin`. Si falla el token, el sistema busca el rol en `profile.platform_role` dentro de Firestore, o le asigna `super_admin` a `asicodia@gmail.com`. Los Custom Claims del token nunca son emitidos por una Cloud Function o backend administrativo.
6. **Brecha en Reglas de Firestore al crear usuario (`subscription_master`)**
   - **Archivo:** [`firestore.rules`](file:///c:/wamp64/www/Clepces/projects/buca-ai/firestore.rules#L145-L150) vs [`src/modules/auth/services/UserService.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/auth/services/UserService.js#L136-L142).
   - **Detalle:** La regla `create` en `/users/{userId}` solo valida que `platform_role` sea `user`. No bloquea `subscription_master`. Al inicializar perfil, `UserService` se autootorga el plan `ENTERPRISE MASTER UNLIMITED` con negocios y usuarios ilimitados directamente desde el cliente.
7. **Permisos de escritura excesivos en subcolecciones de negocios**
   - **Archivo:** [`firestore.rules`](file:///c:/wamp64/www/Clepces/projects/buca-ai/firestore.rules#L170-L206).
   - **Detalle:** En `/products`, `/inventory_lots`, `/cash_shifts` y `/customers`, la regla es `allow write: if isBusinessStaff(bizId)`. Esto significa que cualquier empleado básico (como un cajero o pasante) tiene permisos completos para **borrar** el catálogo de productos, alterar inventarios o borrar clientes.
8. **Lecturas globales no aisladas en colecciones compartidas**
   - **Archivo:** [`firestore.rules`](file:///c:/wamp64/www/Clepces/projects/buca-ai/firestore.rules#L120-L133).
   - **Detalle:** 
     - `/activity_log/{logId}`: `allow read: if isAuthenticated();`. Cualquier usuario registrado puede leer toda la bitácora de auditoría de todas las empresas de la plataforma.
     - `/finance_rates/{tenantId}`: `allow read: if isAuthenticated();`. Lectura irrestricta de tasas internas de cualquier empresa.
     - `/notifications/{notifId}`: `allow read: if isAuthenticated();`. Cualquier usuario puede leer alertas dirigidas específicamente a otros negocios.

#### 🟡 MEDIOS (Vulnerabilidades de inyección, riesgos de conexión y suplantación)

9. **Vulnerabilidad de XSS Almacenado en Notificaciones**
   - **Archivo:** [`src/shared/ui/components/notifications/NotificationTray.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/shared/ui/components/notifications/NotificationTray.js#L87-L90) y [`src/shared/ui/layouts/components/TopBar.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/shared/ui/layouts/components/TopBar.js#L131-L133).
   - **Detalle:** Los campos `notification.title` y `notification.message` se concatenan directamente dentro de un template literal e ingresan al DOM mediante `innerHTML` sin pasar por `escapeHTML()`. Una notificación maliciosa ejecutaría scripts en el navegador de los usuarios.
10. **Conexión a Firestore real antes de inicializar Emuladores y riesgo de fallback**
    - **Archivo:** [`src/core/config/firebase.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/core/config/firebase.js#L23-L40,L65-L128).
    - **Detalle:** En la primera llamada a `initFirebase()`, `db` se crea y se ejecuta `getDocFromServer('_internal_/connection_test')` contra la base de datos de producción antes de llegar a la línea que conecta el emulador. Además, si `VITE_USE_EMULATOR` no es exactamente `'true'`, el código intenta escribir y leer contra el proyecto real en la nube `buca-scdbs`.
11. **Uso de `DeviceFingerprint` como mecanismo de seguridad**
    - **Archivos:** [`src/core/security/DeviceFingerprint.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/core/security/DeviceFingerprint.js#L13-L26) y [`src/modules/auth/components/DeviceChallenge.js`](file:///c:/wamp64/www/Clepces/projects/buca-ai/src/modules/auth/components/DeviceChallenge.js#L1-L24).
    - **Detalle:** Se presenta una huella de Canvas/WebGL como si fuera un factor de autorización de hardware ("Fase 2 BNE"). Una huella de navegador no es una credencial criptográfica: puede ser falsificada o variar con una actualización de controladores de video.

#### 🟢 BAJOS (Higiene de código y deuda técnica)

12. **Tokens y configuración de proyecto cableados en el código**
    - **Archivo:** [`firebase-applet-config.json`](file:///c:/wamp64/www/Clepces/projects/buca-ai/firebase-applet-config.json#L1-L12).
    - **Detalle:** Contiene identificadores de proyecto y base de datos cableados en un archivo estático en lugar de depender únicamente de variables de entorno controladas.

---

### 5. Diferencia Conceptual: MFA vs. Autorización por Roles vs. Aislamiento Multi-Negocio

Para tener absoluta claridad sobre qué resuelve cada herramienta y no pedirle a una lo que debe resolver otra:

```
+-----------------------------------------------------------------------------------+
| 1. AUTENTICACIÓN MULTIFACTOR (MFA)                                                 |
| ¿Quién eres y qué tan seguro estoy de tu identidad?                               |
| -> Comprueba que quien tiene la contraseña también posee el dispositivo físico.    |
| -> NO decide a qué pantallas puedes entrar ni qué puedes modificar.                |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 2. AUTORIZACIÓN POR ROLES (RBAC)                                                  |
| ¿Qué puesto o nivel de responsabilidad tienes en la organización?                 |
| -> Decide si puedes emitir facturas, consultar reportes o administrar usuarios.   |
| -> Debe validarse mediante Custom Claims confiables o en reglas de base de datos.  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 3. AISLAMIENTO MULTI-NEGOCIO (Multi-Tenant Scoping)                               |
| ¿A cuál empresa le pertenecen los datos que estás intentando tocar?               |
| -> Garantiza que un Administrador de la Empresa "A" jamás pueda ver ni alterar    |
|    las ventas, clientes o inventarios de la Empresa "B", aunque ambos sean Admin. |
+-----------------------------------------------------------------------------------+
```

> **Principio Clave:** El hecho de que un usuario inicie sesión con Google Authenticator (MFA) no le da derecho a ver datos de otra empresa, ni tampoco reemplaza la necesidad de verificar si es cajero o dueño. Son tres capas independientes y complementarias.

---

### 6. Plan de Trabajo Priorizado en Etapas Pequeñas

Para avanzar con seguridad pedagógica y sin generar disrupciones:

- **Etapa 0: Aislamiento estricto de Entorno Local (Fail-Safe)**
  - Blindar `src/core/config/firebase.js` para que si se está en desarrollo/pruebas, se conecte obligatoriamente a los emuladores locales sin intentar tocar jamás la base de datos real en la nube.
- **Etapa 1: Retiro de Código Inseguro y Desarme del 2FA Simulado**
  - Desactivar la generación aleatoria de PIN en `LoginPage.js` y el botón de autocompletado en `PINForm.js`.
  - Retirar la llamada a `api.qrserver.com` en `TOTPService.js`.
  - Detener el almacenamiento de `totp_secret` y `pin_code` en Firestore y `localStorage`.
- **Etapa 2: Cierre de Brechas en Reglas de Firestore y Protección Multi-Tenant**
  - Ajustar `firestore.rules` para bloquear asignación de `subscription_master` y roles en creación de usuarios.
  - Restringir la visibilidad de `/activity_log`, `/notifications` y `/finance_rates` para evitar lecturas globales.
  - Diferenciar permisos de borrado y modificación en catálogo e inventario (`staff` solo crea/edita; borrado exclusivo del `owner`).
- **Etapa 3: Preparación del Flujo MFA Nativo en Firebase Auth**
  - Adaptar `FirebaseProvider.js` y `AuthService.js` para atrapar `auth/multi-factor-auth-required` y preservar el `resolver` en memoria sin marcar sesión activa.
  - Implementar la vista modal de desafío MFA vinculada al `resolver`.
- **Etapa 4: Enrolamiento de MFA y Recuperación**
  - Diseñar el flujo de enrolamiento en el perfil con verificación previa de correo electrónico y reautenticación de contraseña.
  - Renderizado de QR 100% local en canvas.
- **Etapa 5: Condicionar Acciones Sensibles en Reglas**
  - Agregar la verificación de `request.auth.token.firebase.sign_in_second_factor` en las operaciones más críticas del sistema.

---

### 7. Pruebas Necesarias y Qué Depende de Configuración Manual

#### A. Pruebas que SÍ se pueden ejecutar de forma 100% automatizada y local (con Emuladores):
1. **Pruebas de Reglas de Firestore (`@firebase/rules-unit-testing`):**
   - Un usuario con token sin MFA intenta borrar un negocio o editar tasas maestras $\rightarrow$ Rechazado.
   - Un usuario con token simulado con MFA (`{ firebase: { sign_in_second_factor: 'totp' } }`) $\rightarrow$ Aprobado.
   - Un usuario de la Empresa A intenta leer facturas o inventario de la Empresa B $\rightarrow$ Rechazado.
   - Un usuario intenta crearse a sí mismo con `platform_role: 'super_admin'` o `subscription_master` $\rightarrow$ Rechazado.
   - Un empleado no dueño intenta borrar un producto o lote de inventario $\rightarrow$ Rechazado.

#### B. Pruebas que dependen de configuración manual en Firebase Console:
1. **Facturación y habilitación de Identity Platform:** El proyecto real debe vincularse a facturación (Blaze) y activarse la opción de MFA por TOTP en la consola.
2. **Escaneo físico con aplicación móvil:** El escaneo con Google Authenticator o Microsoft Authenticator en un teléfono real contra los servidores de autenticación de Google requiere un proyecto de pruebas en la nube.
3. **Comportamiento del Emulador de Auth:** El emulador local de Firebase Auth soporta emulación de tokens y pruebas de reglas, pero el soporte completo del protocolo de intercambio TOTP en el emulador local puede presentar discrepancias frente a los servidores de producción de Google Identity Platform.

---

### 8. Riesgos que Impiden Usar Datos Reales o Desplegar en Producción

1. **Riesgo de Exposición de Secretos:** Cualquier credencial o clave TOTP guardada en `localStorage` o en el documento del usuario puede ser leída si se comparte la computadora o mediante scripts no autorizados.
2. **Riesgo de Destrucción de Inventario por Empleados:** Las reglas actuales permiten que cualquier empleado borre registros contables, clientes e inventarios completos.
3. **Riesgo de Elevación de Privilegios:** El cliente sigue confiando en `profile.platform_role` guardado en Firestore. Un atacante con acceso a la consola del navegador puede intentar manipular campos para presentarse como administrador.
4. **Riesgo de Bloqueo de Usuarios:** Implementar MFA sin un plan de respaldo dejaría fuera permanentemente a cualquier usuario que dañe, pierda o formatee su teléfono inteligente.

---

### 9. Preguntas Concretas que Necesitas Decidir Antes de Implementar

1. **¿Dispones de un Proyecto de Firebase secundario (de prueba/sandbox) con tarjeta de crédito para activar el plan Blaze sin arriesgar producción?**  
   *(No recomendamos bajo ninguna circunstancia activar Identity Platform o hacer pruebas directas en el proyecto `buca-scdbs` de producción).*
2. **¿Quién tendrá la autoridad para recuperar una cuenta si el usuario pierde su teléfono?**  
   *(¿Deseas que exista un panel de Super Admin con Cloud Functions para desenrolar factores tras validar la identidad de la persona, o se exigirá SMS de respaldo?)*
3. **¿Qué nivel de permisos debe tener un empleado regular (`staff`) en cada negocio?**  
   *(¿Debe poder borrar productos y cancelar turnos de caja, o esas acciones deben ser exclusivas del Propietario / Owner?)*
4. **¿Deseas que procedamos primero con la Etapa 0 y Etapa 1 (asegurar el entorno de emuladores y purgar el 2FA simulado) antes de tocar el flujo de Firebase Auth?**

---

> 🛑 **AUDITORÍA FINALIZADA — CONTROL DE DETENCIÓN ACTIVO**  
> No se ha modificado ningún archivo del repositorio ni se han realizado operaciones contra servidores remotos.  
> **Espero tu revisión y aprobación explícita para saber con cuál etapa deseas comenzar.**