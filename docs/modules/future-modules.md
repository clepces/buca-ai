# 🚀 Módulos Futuros y Hoja de Ruta Modular
## Nuevos Dominios en Planificación — B.U.C.A. AI

> **Módulo:** `docs/modules/future-modules.md`  
> **Estado:** `[Hoja de Ruta / En Diseño (new)]`

---

## 1. Módulo `pos` (Punto de Venta de Alta Resiliencia)
* **Serial Propuesto:** `buca:mod:pos:alpha`
* **Ruta Asignada:** `/pos`
* **Capacidades Planificadas:**
  - Facturación ultra-rápida y cobro bi-monetario (USD / VES / EUR).
  - Emisión offline con encolamiento en `OfflineReplayQueue` e idempotencia estricta.
  - Consumo de herramienta modular de `finance`: `calculateRateGap` para anclaje de precios al instante.
  - Modo táctil simplificado para terminales de caja L0.

---

## 2. Módulo `inventory` (Control de Existencias y Almacenes)
* **Serial Propuesto:** `buca:mod:inventory:alpha`
* **Ruta Asignada:** `/inventory`
* **Capacidades Planificadas:**
  - Control de existencias multi-almacén con trazabilidad por lotes y vencimiento.
  - Alertas automáticas de stock mínimo despachadas al sistema de notificaciones dual.
  - Lectura de códigos de barra mediante Web Optical Barcode API nativa (sin librerías externas).

---

## 3. Módulo `ai-copilot` (Asistente de Inteligencia Empresarial)
* **Serial Propuesto:** `buca:mod:ai-copilot:alpha`
* **Ruta Asignada:** `/ai` (o HUD flotante)
* **Capacidades Planificadas:**
  - Asistente de consultas financieras y comerciales integrado en lenguaje natural.
  - Detección proactiva de desvíos en márgenes por volatilidad cambiaria.
  - Generación de reportes de rentabilidad y auditoría de inventario automatizada.
  - Ejecución mediante agentes locales de bajo consumo de tokens.
