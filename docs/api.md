# Especificación de API REST, Cloud Functions y Servicios Externos

> **Documento:** Contratos de Red, Protocolo de Comunicación y Manejo de Errores  
> **Versión:** 1.0.0  
> **Ámbito:** Comunicación Frontend-Backend, Firebase SDK y Pasarelas de Notificación

---

## 1. Estándar de Comunicación y Envoltorio Canónico (Envelope)

Toda comunicación asíncrona entre el cliente frontend (`src/core/api/`) y las Cloud Functions o APIs REST debe implementar el sobre canónico estandarizado.

### 1.1. Respuesta Exitosa (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "biz_8a7b6c5d4e",
    "name": "Inversiones del Centro C.A.",
    "status": "active"
  },
  "meta": {
    "total": 45,
    "page": 1,
    "per_page": 20,
    "has_more": true
  },
  "uuid": "7f8b3c12-68bb-4e6f-9cc1-5a3d0f7b11a2",
  "timestamp": "2026-10-29T18:00:00.000Z"
}
```

### 1.2. Respuesta de Error Seguro (Protocolo Cero Stack Traces)
Bajo ninguna circunstancia se expondrán rutas físicas del servidor, archivos internos o trazas de ejecución en la respuesta HTTP:
```json
{
  "success": false,
  "error": "No posee autorización para modificar el inventario de esta sucursal.",
  "code": "permission-denied",
  "uuid": "e47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-10-29T18:00:00.000Z"
}
```

---

## 2. Catálogo de Servicios y Endpoints

### 2.1. Módulo de Autenticación y Cuentas (`auth`)

#### `POST /api/v1/auth/login` (Firebase Auth + Custom Claims)
* **Descripción:** Autentica credenciales de usuario y valida dispositivos confiables.
* **Payload:**
  ```json
  {
    "email": "owner@buca.com.ve",
    "password": "PasswordSeguro123!",
    "device_fingerprint": "hash_sha256_browser_identity"
  }
  ```
* **Respuesta Exitosa:** Retorna token JWT, claims de usuario (`role`, `workspaces`) y perfil básico.
* **Control de 2FA:** Si el dispositivo no es reconocido, retorna código `requires-2fa` y despacha un desafío temporal a través de EmailJS.

#### `POST /api/v1/auth/verify-device` (2FA Challenge)
* **Descripción:** Valida el código numérico de 6 dígitos enviado al correo del usuario para autorizar un nuevo dispositivo.
* **Payload:**
  ```json
  {
    "user_id": "usr_99887766",
    "challenge_code": "785233",
    "device_name": "Laptop HP - Administración"
  }
  ```

---

### 2.2. Módulo de Negocios y Espacio de Trabajo (`workspace`)

#### `GET /api/v1/businesses`
* **Descripción:** Obtiene las unidades de negocio asociadas al usuario autenticado (separadas por propiedades en modo Owner y colaboraciones en modo Worker).
* **Parámetros Query:** `mode` (`owner` | `worker`), `limit` (int, default 10), `cursor` (string opcional para paginación `startAfter`).

#### `POST /api/v1/businesses`
* **Descripción:** Registra una nueva unidad de negocio (creación de empresa ERP).
* **Payload:**
  ```json
  {
    "name": "Panadería La Espiga Dorada",
    "commercial_name": "La Espiga C.A.",
    "rif": "J-50123456-7",
    "category": "food_retail",
    "currency_base": "USD",
    "fiscal_address": {
      "city": "Valencia",
      "state": "Carabobo",
      "line1": "Av. Bolívar Norte, CC Camoruco"
    }
  }
  ```

---

### 2.3. Módulo de Tasas y Economía Multi-Moneda (`rates` & `DolarVzlaService`)

#### `GET /api/v1/rates/current`
* **Descripción:** Retorna la tasa oficial del Banco Central de Venezuela (BCV), la tasa de referencia de mercado y la tasa de reposición pesimista calculada.
* **Estrategia de Caché:** La llamada lee del documento `/global_config/main` en Firestore. Se almacena localmente y solo se revalida si expira el TTL de 4 horas o si el usuario solicita sincronización forzada en el `RateManagementModal`.

#### Integración Externa DolarVzla (`src/core/services/DolarVzlaService.js`)
* **Fuentes Oficiales:** CDN Base (`https://rates.dolarvzla.com`) y API Base (`https://api.dolarvzla.com`).
* **Indicadores Sincronizados:**
  1. `getBCVRates()`: Tasas oficiales BCV (USD, EUR), variación porcentual e historial.
  2. `getBinanceP2P()`: Cotización USDT P2P (compra, venta, promedio, spread).
  3. `getIntervenciones()`: Intervenciones cambiarias del BCV.
* **Validación de Esquema:** Tipado y parseo defensivo mediante contratos estrictos de Zod (`BCVRateSchema`, `BinanceP2PSchema`, etc.).
* **Aritmética Segura:** Redondeo puro con `safeRound2` y `safeRound4` previniendo errores de precisión IEEE 754.

---

### 2.4. Integración Externa con EmailJS API

Para garantizar que el sistema opere con coste de **$0.00 USD** sin desplegar servidores de correo dedicados:
* **Servicio:** EmailJS REST API (`https://api.emailjs.com/api/v1.0/email/send`).
* **Plantillas Configuradas:**
  1. `template_auth_2fa`: Envío de código de verificación de 6 dígitos con expiración de 10 minutos.
  2. `template_stock_alert`: Alerta al Owner cuando un producto alcanza su umbral mínimo de stock.
  3. `template_hire_notice`: Notificación a un Worker cuando ha sido vinculado al equipo de un negocio.

---

## 3. Resiliencia de Red y Timeouts (`AbortController`)

Todas las peticiones ejecutadas a través de `BaseClient.js` y `http.js` implementan obligatoriamente:
1. **Timeout Defensivo:** 10,000 ms por defecto para evitar conexiones colgadas en conexiones lentas o inestables.
2. **Propagación de Señal:** Si el usuario abandona una página durante una petición asíncrona, el enrutador SPA dispara la cancelación automática de la señal mediante `controller.abort()`, liberando sockets y memoria.
