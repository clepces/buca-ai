# 🔌 Especificación de API, Conectividad de Red y Servicios Externos — B.U.C.A. AI

> **Documento:** Contratos de Red, Protocolo de Comunicación, SDK de Supabase y Manejo de Errores  
> **Versión:** 1.1.8 — Enterprise Grade  
> **Ámbito:** Comunicación Frontend-Backend, Supabase Client, DolarVzla API y Pasarelas de Notificación

---

## 1. Estándar de Comunicación y Envoltorio Canónico (Envelope)

Toda comunicación asíncrona entre el cliente frontend (`src/core/api/`) y los servicios externos o funciones RPC implementa el sobre canónico estandarizado.

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
  "timestamp": "2026-11-15T18:00:00.000Z"
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
  "timestamp": "2026-11-15T18:00:00.000Z"
}
```

---

## 2. Catálogo de Servicios y Endpoints

### 2.1. Módulo de Autenticación y Cuentas (`auth` / Supabase Auth)

#### `POST /auth/v1/token` (Supabase Auth Session)
* **Descripción:** Autentica credenciales del usuario vía SDK oficial `@supabase/supabase-js`, generando tokens JWT con claims seguros.
* **Payload:**
  ```json
  {
    "email": "owner@buca.com.ve",
    "password": "PasswordSeguro123!"
  }
  ```
* **MFA AAL2 Challenge:** Si el usuario tiene habilitado el segundo factor, se exige verificación TOTP (RFC 6238) para elevar el nivel de garantía a AAL2.

---

### 2.2. Módulo de Negocios y Espacio de Trabajo (`workspace` & `business`)

#### `SELECT FROM public.businesses`
* **Descripción:** Obtiene las unidades de negocio asociadas al usuario autenticado, filtradas automáticamente por `owner_id = (SELECT auth.uid())` mediante Row Level Security (RLS).
* **Paginación:** Paginación obligatoria mediante `.range(from, to)` o `.limit(20)`.

---

### 2.3. Módulo de Tasas y Economía Multi-Moneda (`finance` & `DolarVzlaService`)

#### `SELECT FROM public.finance_rates`
* **Descripción:** Retorna la tasa oficial del Banco Central de Venezuela (BCV), la tasa de referencia de mercado (Paralelo / USDT) y la brecha cambiaria calculada para el tenant.
* **Estrategia de Caché:** Los datos se persisten en `StorageAdapter` (IndexedDB / LocalStorage) con un TTL configurable, revalidándose al inicio de sesión o bajo demanda mediante el `RateManagementModal`.

#### Integración Externa DolarVzla (`src/core/services/DolarVzlaService.js`)
* **Fuentes Oficiales:** CDN Base (`https://rates.dolarvzla.com`) y API Base (`https://api.dolarvzla.com`).
* **Indicadores Sincronizados:**
  1. `getBCVRates()`: Tasas oficiales BCV (USD, EUR), variación porcentual e historial.
  2. `getBinanceP2P()`: Cotización USDT P2P (compra, venta, promedio, spread).
  3. `getIntervenciones()`: Intervenciones cambiarias del BCV.
* **Validación de Esquema:** Tipado y parseo defensivo mediante contratos estrictos de Zod v4.
* **Aritmética Segura:** Redondeo con `safeRound2` y `safeRound4` previniendo errores de coma flotante IEEE 754.

---

### 2.4. Integración Externa con EmailJS API

Para garantizar que el sistema opere con coste de **$0.00 USD** sin desplegar servidores de correo dedicados:
* **Servicio:** EmailJS REST API (`https://api.emailjs.com/api/v1.0/email/send`).
* **Plantillas Configuradas:**
  1. `template_auth_2fa`: Envío de código de verificación temporal.
  2. `template_stock_alert`: Alerta al Owner cuando un producto alcanza su umbral mínimo de stock.
  3. `template_hire_notice`: Notificación a un Worker cuando ha sido vinculado al equipo de un negocio.

---

## 3. Resiliencia de Red y Timeouts (`AbortController`)

Todas las peticiones ejecutadas a través de `BaseClient.js` y `http.js` implementan obligatoriamente:
1. **Timeout Defensivo:** 10,000 ms por defecto para evitar conexiones colgadas en conexiones lentas o inestables.
2. **Propagación de Señal:** Si el usuario abandona una página durante una petición asíncrona, el enrutador SPA dispara la cancelación automática de la señal mediante `controller.abort()`, liberando sockets y memoria.
