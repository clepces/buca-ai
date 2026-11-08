# 🛡️ INFORME DE AUDITORÍA Y REMEDIACIÓN DE SEGURIDAD — B.U.C.A. AI

**Fecha:** 5 de noviembre de 2026  
**Versión de Plataforma:** 1.0.0-Alpha  
**Estatus:** Auditoría ejecutada, vulnerabilidades críticas corregidas localmente y verificadas en emulador.  
**Autor:** Senior Application Security & Firebase Engineer

---

## 1. RESUMEN DE RIESGOS (ORDENADO POR SEVERIDAD)

A continuación se detallan los hallazgos confirmados en la auditoría inicial de código, ordenados desde el impacto más destructivo hasta el menor:

| ID | Nivel de Riesgo | Componente / Archivo | Vulnerabilidad Detectada | Estado Tras Remediación |
|---|---|---|---|---|
| **C1** | **CRÍTICO** | `firestore.rules` (L78-81) | **Acceso total a subcolecciones de negocios**: Comodín `{subcollection}/{docId}` permitía a cualquier usuario autenticado leer y alterar ventas, inventarios, transacciones y empleados de cualquier empresa. | **CORREGIDO** (Subcolecciones explícitas con validación estricta de Staff/Owner). |
| **C2** | **CRÍTICO** | `AuthService.js` (L83-104) / `LoginForm.js` | **Backdoor de contraseñas de prueba**: Credenciales demo (`admin123`, `soporte123`, `owner123`, `123456`, `Password123!`) permitían iniciar sesión simulando ser `super_admin` o `owner` sin pasar por Firebase Auth. | **CORREGIDO** (Bypass eliminado; autenticación obligatoria y real). |
| **C3** | **CRÍTICO** | `BusinessService.js` (L120) / `UserService.js` (L52) | **Sesión falsa con UID fijo**: Si no había sesión, el sistema creaba automáticamente una sesión autenticada con UID `QmojtAorrSORnIR652B2OQrLFnV2` y rol `owner`. | **CORREGIDO** (Fail-Closed: devuelve `null` si no hay sesión auténtica). |
| **C4** | **CRÍTICO** | `firestore.rules` (L29-38) | **Escritura irrestricta en configuración global y tasas**: Cualquier usuario autenticado podía sobreescribir `global_config` y `finance_rates` de otros inquilinos. | **CORREGIDO** (Restringido a Super Admin y dueños de negocio específicos). |
| **C5** | **ALTO** | `LoginPage.js` (L111) | **PIN Maestro de 2FA (`123456`)**: El formulario de doble factor aceptaba `123456` para cualquier cuenta, invalidando completamente el segundo factor de autenticación. | **CORREGIDO** (Eliminada la clave maestra de desarrollo). |
| **C6** | **ALTO** | `firestore.rules` (L62-64) | **Auto-elevación de privilegios**: Los usuarios podían actualizar su propio documento en `/users/{uid}` agregando `platform_role: 'super_admin'` o alterando planes de suscripción. | **CORREGIDO** (Reglas bloquean modificación de campos protegidos: `platform_role`, `role`, `subscription_master`, `is_admin`, `claims`). |
| **C7** | **ALTO** | `auth/index.js` (L39-41) | **Asignación masiva de rol 'owner'**: Todo usuario autenticado recibía por defecto el rol `owner` en el cliente, ignorando el principio de menor privilegio. | **CORREGIDO** (Se resuelven custom claims del token o perfil, asignando `user` por defecto). |
| **C8** | **ALTO** | `BusinessRepository.js` vs `firestore.rules` | **Discrepancia en campo de propietario (`ownerUid` vs `owner_id`)**: Al registrar negocios se guardaba `ownerUid`, impidiendo que las reglas de Firestore reconocieran la propiedad del usuario (`owner_id`). Además, el operador spread sobrescribía campos críticos de identidad. | **CORREGIDO** (Campo normalizado a `owner_id` y saneamiento estricto de entradas previas al guardado). |
| **C9** | **MEDIO** | `firestore.rules` (L63, L73) | **Enumeración de usuarios y empresas**: Cualquier usuario autenticado podía listar y leer los perfiles completos de todos los demás usuarios (incluyendo teléfonos, direcciones y secretos TOTP) y todas las empresas. | **CORREGIDO** (Perfiles solo legibles por el propio dueño o super admin; empresas legibles solo por su propio equipo). |
| **C10** | **MEDIO** | `public/sw.js` (L57-62) | **Falla del Service Worker sin conexión y caché indiscriminada**: Respuestas `undefined` provocaban excepciones en navegadores al perder conexión, e intentaba cachear llamadas a Firebase. | **CORREGIDO** (Ignora peticiones de APIs externas y responde `503 Service Unavailable` controlado). |

---

## 2. EXPLICACIÓN DE LAS CORRECCIONES IMPLEMENTADAS (PARA PRINCIPIANTES)

1. **Aislamiento Total entre Negocios (Multi-Tenant):**
   * *El problema:* Si Juan entraba a su cuenta, podía ver y borrar las ventas y productos de la empresa de María simplemente consultando la base de datos con el ID de María.
   * *La solución:* Las nuevas reglas de Firestore verifican en cada lectura y escritura si el usuario que hace la petición es el dueño registrado (`owner_id`) o si está dado de alta en la lista de empleados (`staff`) de esa empresa. Si no pertenece a ella, la base de datos rechaza la operación inmediatamente.

2. **Cierre de Brechas de Acceso (Sin "Puertas Traseras"):**
   * *El problema:* Existían contraseñas fijas escritas en el código (`admin123`, PIN `123456`) y un UID de respaldo (`QmojtAorr...`) que permitían acceder con máximos permisos sin ingresar credenciales reales.
   * *La solución:* Se eliminaron todos los bypasses y cuentas fijas. Ahora, si no existe una sesión legítima y comprobada contra los servidores de Firebase Auth, el sistema bloquea el paso ("Fail-Closed").

3. **Imposibilidad de Convertirse en Administrador desde el Navegador:**
   * *El problema:* Un usuario podía abrir las herramientas de desarrollador (F12) en Chrome, editar su propio perfil en Firestore y escribir `platform_role = "super_admin"`. Al recargar, la aplicación lo trataba como dueño de todo el sistema.
   * *La solución:* Las reglas de seguridad de Firestore ahora examinan las claves que el usuario intenta cambiar (`affectedKeys()`). Si el usuario intenta modificar `platform_role`, `subscription_master`, `role` o `is_admin`, la base de datos rechaza el cambio. Solo un proceso de servidor con permisos especiales puede asignar estos roles.

4. **Sincronización Canónica de Datos (`owner_id`):**
   * *El problema:* Parte del código buscaba `ownerUid` y otra parte guardaba `owner_id`. Esto hacía que los negocios recién creados quedaran "huérfanos", impidiendo que su creador pudiera administrarlos bajo las reglas de seguridad.
   * *La solución:* Se estandarizó el campo oficial en todo el proyecto a `owner_id`. Para proteger datos ya existentes, se mantiene compatibilidad retroactiva sin romper las reglas de acceso.

---

## 3. LISTA DE ARCHIVOS MODIFICADOS Y CREADOS

* **`firestore.rules`** *(Modificado)*: Reemplazo completo por arquitectura de reglas de mínimo privilegio con delegación al subagente especialista.
* **`firebase.json`** *(Creado)*: Configuración local de emuladores (Firestore en puerto 8080, Auth en puerto 9099 y UI en puerto 4000).
* **`tests/firestore-rules.test.js`** *(Creado)*: Suite de 12 pruebas unitarias automatizadas con `@firebase/rules-unit-testing`.
* **`package.json` & `package-lock.json`** *(Modificados)*: Inclusión de scripts `"test:rules"`, dependencias seguras de emulador.
* **`src/modules/business/services/BusinessRepository.js`** *(Modificado)*: Normalización a `owner_id` y saneamiento de inyección de parámetros.
* **`src/modules/workspace/services/BusinessService.js`** *(Modificado)*: Eliminación del usuario fallback con UID fijo.
* **`src/modules/auth/services/UserService.js`** *(Modificado)*: Eliminación del usuario fallback con UID fijo.
* **`src/modules/auth/services/AuthService.js`** *(Modificado)*: Eliminación de contraseñas de prueba y resolución segura de roles.
* **`src/modules/auth/index.js`** *(Modificado)*: Asignación de rol seguro por defecto (`user`), sincronización de claims y limpieza de sesión al salir.
* **`src/modules/auth/pages/LoginPage.js`** *(Modificado)*: Eliminación del PIN maestro `123456` y blindaje del flujo de login.
* **`src/modules/auth/components/LoginForm.js`** *(Modificado)*: Eliminación de atributos con contraseñas en claro (`data-pwd`).
* **`src/core/config/environment.js`** *(Modificado)*: Corrección de detección de emuladores para evitar desvíos accidentales de tráfico en redes locales.
* **`public/sw.js`** *(Modificado)*: Manejo de errores offline y exclusión de peticiones de APIs externas.

---

## 4. RESULTADOS DE LAS PRUEBAS DE SEGURIDAD (EMULADOR)

Se ejecutó la suite completa contra el emulador oficial de Cloud Firestore (`cloud-firestore-emulator-v1.21.0.jar`):

```bash
> npx firebase-tools emulators:exec --only firestore "node --test tests/firestore-rules.test.js"

TAP version 13
# Subtest: B.U.C.A. AI - Firestore Security Rules Tests
    # Subtest: 1. Control de Acceso no Autenticado
        ok 1 - Debe rechazar lectura no autenticada de negocios
        ok 2 - Debe rechazar escritura no autenticada de usuarios
    ok 1 - 1. Control de Acceso no Autenticado
    # Subtest: 2. Aislamiento Multi-Tenant (Negocios)
        ok 1 - Usuario A puede crear y leer su propio negocio
        ok 2 - Usuario B NO puede leer ni modificar el negocio del Usuario A
        ok 3 - Usuario B NO puede acceder a subcolecciones del negocio de Usuario A
    ok 2 - 2. Aislamiento Multi-Tenant (Negocios)
    # Subtest: 3. Protección contra Elevación de Privilegios
        ok 1 - Usuario no puede auto-asignarse platform_role "super_admin" al crear perfil
        ok 2 - Usuario no puede modificar campos protegidos como platform_role o subscription_master
        ok 3 - Usuario A no puede leer el perfil del Usuario B
    ok 3 - 3. Protección contra Elevación de Privilegios
    # Subtest: 4. Protección de Configuración Global y Tasas
        ok 1 - Usuario regular NO puede escribir en global_config
        ok 2 - Usuario no owner NO puede escribir en finance_rates de otro negocio
        ok 3 - Owner de biz_A SÍ puede actualizar sus tasas en finance_rates/biz_A
    ok 4 - 4. Protección de Configuración Global y Tasas
    # Subtest: 5. Auditoría y Registro de Actividad
        ok 1 - Usuario no puede falsificar el user_id en activity_log
    ok 5 - 5. Auditoría y Registro de Actividad

# tests 12
# suites 6
# pass 12
# fail 0
# duration_ms 5943
+  Script exited successfully (code 0)
```

**Verificación adicional de compilación y tipos:**
* `npm run build`: **EXITOSO (0 errores, 5.33s)**.
* `npm run type-check`: **EXITOSO (0 errores de tipado estático)**.

---

## 5. PASOS MANUALES OBLIGATORIOS EN FIREBASE CONSOLE ANTES DE DESPLEGAR

Dado que no se debe tocar la base de datos de producción desde el código ni simular accesos administrativos privilegiados, el administrador debe ejecutar los siguientes pasos en la consola web de Firebase:

1. **Creación / Asignación del Super Admin:**
   * Las reglas exigen que `request.auth.token.role == 'super_admin'`.
   * En la consola de Firebase o mediante un script con el Firebase Admin SDK (Node.js backend), asigne los Custom Claims a la cuenta del administrador:
     ```javascript
     // Ejecutar en script administrativo de servidor (NO en el frontend):
     await admin.auth().setCustomUserClaims(superAdminUid, { role: 'super_admin' });
     ```
2. **Índices Compuestos de Firestore:**
   * La consulta de negocios por propietario (`where('owner_id', '==', uid)`) y ordenamiento requerirá índices compuestos si se agrega orden por fecha (`orderBy('createdAt', 'desc')`). Si Firebase arroja error de índice faltante en la consola, haga clic en el enlace provisto para crearlo automáticamente.
3. **Reglas de Firebase Storage:**
   * La aplicación actualmente no utiliza Firebase Storage (`getStorage` no tiene llamadas activas). Si a futuro se habilita la carga de facturas, recibos o logotipos, se deberán crear reglas para Storage antes de abrir el módulo.
4. **Verificación de la Base de Datos Personalizada:**
   * El archivo `firebase-applet-config.json` define una base de datos con nombre personalizado (`ai-studio-b6f68ff5-24ea-407f-bfea-e87eb66b9104`). Asegúrese de que en el despliegue final (`firebase deploy --only firestore:rules`) se despliegue a la instancia de base de datos correspondiente si el proyecto usa bases de datos nombradas.

---

## 6. RIESGOS ABIERTOS Y LIMITACIONES ACTUALES

1. **Verificación de 2FA en el Navegador:**
   * La lógica de validación de TOTP (`TOTPService.js`) se procesa localmente en JavaScript del lado del cliente. Aunque se removió la clave maestra `123456`, cualquier verificación en el navegador puede ser manipulada por un atacante local con DevTools. Para que el doble factor sea una barrera de seguridad infranqueable, debe implementarse Firebase Authentication MFA (Multi-Factor Authentication) en el backend.
2. **Uso de Secretos en LocalStorage:**
   * Si el usuario guarda el secreto TOTP en su propio `localStorage`, cualquier script malicioso (XSS) en la misma pestaña podría leerlo. Se recomienda no persistir secretos en texto plano en el navegador.
3. **Módulo de Notificaciones:**
   * Las notificaciones globales solo pueden ser creadas por `super_admin`. Si la aplicación necesita que los usuarios regulares se envíen mensajes entre sí, se requerirá crear una subcolección de notificaciones por usuario (`/users/{uid}/notifications`) o por negocio.

---

## 7. QUÉ NO DEBE DESPLEGARSE AÚN A PRODUCCIÓN

* 🚫 **NO desplegar sin haber asignado los Custom Claims de `super_admin`** a la cuenta maestra en Firebase Auth; de lo contrario, ninguna cuenta podrá escribir en `global_config` ni crear notificaciones broadcast.
* 🚫 **NO desplegar sin verificar si existen documentos antiguos de negocios creados con el nombre de campo viejo (`ownerUid`)**. Si existen negocios previos en producción que solo tienen `ownerUid` y no `owner_id`, sus dueños no podrán editarlos hasta que se ejecute una migración de datos que copie `owner_id = ownerUid`.
* 🚫 **NO desplegar código con credenciales de prueba pre-rellenadas** en ambientes accesibles al público general.
* 🚫 **NO activar `VITE_USE_EMULATOR=true`** en los archivos `.env.production`.

---
*Reporte generado y certificado localmente sin conexión ni alteraciones a entornos de producción.*
