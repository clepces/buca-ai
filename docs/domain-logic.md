# Lógica del Dominio y Reglas de Negocio (B.U.C.A. AI)

> **Documento:** Algoritmos Financieros, Gestión Bi-Monetaria y Reglas Críticas  
> **Versión:** 1.0.0  
> **Ámbito:** Motores de Cálculo de Precios, Inventario, Arqueos de Caja y Aislamiento Multi-Tenant

---

## 1. Algoritmo de Precios y Tasa de Reposición Pesimista

### 1.1. El Problema de la Ilusión Monetaria
En economías con alta volatilidad o inflación acelerada, vender mercancía calculando márgenes sobre el costo histórico de adquisición genera descapitalización inmediata. Si un producto costó $10 y se vende con un 30% de ganancia en moneda local, pero al momento de reponerlo el proveedor exige $12 debido a devaluaciones intermedias, el negocio habrá incurrido en pérdidas reales a pesar de registrar utilidades nominales.

### 1.2. Fórmula del Costo de Reposición Inteligente (SMART Strategy)
El sistema calcula el precio de venta sugerido mediante:

$$P_{\text{venta (USD)}} = \max\Big(C_{\text{reposición}}, \; C_{\text{adquisición}} \times (1 + \Delta_{\text{brecha}})\Big) \times \frac{1}{1 - M_{\text{utilidad}}}$$

Donde:
* $C_{\text{reposición}}$: Cotización más reciente del proveedor en moneda dura.
* $\Delta_{\text{brecha}}$: Factor de dispersión cambiaria entre la tasa oficial (BCV) y la tasa paralela/P2P de referencia.
* $M_{\text{utilidad}}$: Margen comercial neto deseado por el Owner (ej. `0.30` para 30%).

### 1.3. Conversión Bi-Monetaria en Tiempo de Venta (POS)
Al momento de emitir un ticket o factura:
* El precio base en **Dólares ($)** se congela en el registro de la venta.
* El equivalente en **Bolívares (VES)** se liquida al valor exacto de la tasa oficial vigente en ese segundo, respetando el marco legal cambiario.
* Los pagos combinados (ej. $10 en efectivo + saldo restante en Pago Móvil en Bolívares) se concilian con desglose de contravalor exacto.

---

## 2. Gestión de Inventarios y Valoración FIFO

1. **Método PEPS / FIFO (First-In, First-Out):**
   * Las existencias más antiguas adquiridas son las primeras en descargarse contablemente.
   * Si un producto cuenta con 5 unidades a costo $2.00 y 10 unidades a costo $2.50, una venta de 6 unidades descargará 5 unidades a $2.00 y 1 unidad a $2.50, calculando el costo de venta exacto ponderado.
2. **Bloqueo de Inventario Negativo:**
   * En modo estándar, el Punto de Venta bloquea la facturación de artículos con existencias en cero para evitar inconsistencias en almacén.
   * El Owner puede habilitar la excepción *"Permitir sobreventa en mostrador"* únicamente con confirmación explícita para negocios de despacho diferido.

---

## 3. Control de Turnos y Arqueo Ciego de Caja (`cash_shifts`)

Para prevenir hurtos, desvíos o errores de digitación en los puestos de cobro:
1. **Apertura de Turno:** El cajero declara el fondo inicial de caja desglosado por moneda física (billetes en USD y bolívares en efectivo).
2. **Registro Silencioso:** Durante el turno, el sistema totaliza todas las operaciones de cobro y retiros de efectivo sin mostrar el total acumulado al cajero en pantalla.
3. **Arqueo Ciego de Cierre:**
   * Al cerrar el turno, el cajero debe ingresar físicamente cuánto dinero contó de cada divisa en la caja registradora.
   * El sistema compara el conteo físico con el total computado:
     $$\Delta_{\text{caja}} = \text{Efectivo Contado} - (\text{Fondo Inicial} + \text{Ventas Efectivo} - \text{Retiros Autorizados})$$
   * Si la diferencia excede el margen de tolerancia configurado (ej. $\pm \$1.00$), se genera un evento de alerta en el `activity_log` y se requiere el desbloqueo con PIN por parte de un supervisor u Owner.

---

## 4. Modo Espejo y Aislamiento Estricto de Datos (Multi-Tenant)

### 4.1. Principio de No Injerencia
Un usuario que posee el rol global de **Owner** puede ser contratado simultáneamente como **Worker** (ej. Cajero) en un comercio ajeno.

```text
Usuario: Daisy (owner_id: usr_001)
├── Propias (Modo Owner):
│   └── "Inversiones Daisy C.A." -> Acceso total: finanzas, costos, márgenes.
└── Colaboraciones (Modo Worker):
    └── "Supermercado El Sol"    -> Modo Espejo: Solo terminal POS asignado.
```

### 4.2. Reglas del Modo Espejo:
* Al conmutar hacia un negocio externo, el Kernel descarga las credenciales y claims asociados exclusivamente a ese `business_id`.
* Se ocultan automáticamente todas las tarjetas de métricas globales, balances bancarios y carruseles de negocios propios.
* El enrutador SPA restringe el acceso mediante `guards.js`: cualquier intento de acceder manualmente por URL a rutas no autorizadas (como `/roles` o `/finances`) redirige de inmediato a la vista de error `Error403 (Acceso Denegado)`.
* Las consultas a Firestore inyectan obligatoriamente el filtro de seguridad:
  `collection('businesses').doc(currentBusinessId)`
  impidiendo la lectura cruzada de datos entre inquilinos.
