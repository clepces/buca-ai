# 🚀 Hoja de Ruta de Ingeniería Futura
## Evolución Arquitectónica hacia v2.0 y BENE v6.0 — B.U.C.A. AI

> **Módulo:** `docs/architecture/future-roadmap.md`  
> **Estado:** `[Hoja de Ruta / Investigación (new)]`

---

## 1. PWA con Service Worker y Navigation Preload

* **Objetivo:** Garantizar carga instantánea offline del esqueleto visual (`app shell`) y persistencia local de activos estáticos.
* **Navigation Preload:** Inicializar la petición de red en paralelo mientras el Service Worker despierta en segundo plano, recortando 80-120ms en cada navegación.

---

## 2. Aislamiento de Procesamiento en Web Workers

* **Objetivo:** Desplazar cálculos pesados de matemáticas financieras, reconciliación contable y cifrado criptográfico fuera del hilo principal (*Main Thread*).
* **Módulos Afectados:**
  - `RateCalculatorWorker`: Cálculo continuo de brechas cambiarias y proyecciones de divisas.
  - `CryptoStorageWorker`: Cifrado y descifrado de datos locales con AES-GCM en un hilo independiente.

---

## 3. Micro-Frontends Vanilla y Módulos Distribuidos

* **Objetivo:** Permitir que nuevos módulos de negocio (ej. Facturación Fiscal de un país específico) se desarrollen y desplieguen como paquetes ESM independientes sin necesidad de recompilar el núcleo del ERP.
* **Gobernanza:** Integración garantizada a través del estándar `UMCL` (*Universal Module Controller Lifecycle*).
