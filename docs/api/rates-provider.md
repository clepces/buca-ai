# 📈 Integración del Proveedor de Divisas DolarVzla
## Captura en Tiempo Real, Fallbacks y Cálculo de Brecha — B.U.C.A. AI

> **Módulo:** `docs/api/rates-provider.md`  
> **Servicio:** `src/modules/finance/services/FinanceRepository.js`  
> **Evidencias Gráficas:** `docs/api/assets/page-*-api.png`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. El Feed de Cotizaciones Multi-Moneda

B.U.C.A. AI consume cotizaciones continuas a través de los endpoints de alta velocidad de **DolarVzla**:

* **Endpoint CDN (Baja Latencia):** `VITE_DOLAR_VZLA_CDN=https://rates.dolarvzla.com`
* **Endpoint API de Respaldo:** `VITE_DOLAR_VZLA_API=https://api.dolarvzla.com`
* **Monedas Monitoreadas:** USD Oficial (BCV), USD Paralelo (Mercado Alternativo), EUR (Euro Oficial) y USDT (Tether P2P).

---

## 2. Cálculo Algorítmico de la Brecha Cambiaria

La brecha cambiaria representa el porcentaje de desvío entre la tasa de cambio oficial y la tasa de reposición en el mercado paralelo:

$$\text{Brecha Cambiaria } (\%) = \left( \frac{\text{Tasa Paralelo} - \text{Tasa BCV}}{\text{Tasa BCV}} \right) \times 100$$

* Si la brecha supera el **15%**, el sistema despacha una alerta preventiva al comerciante para recomendar ajustes de costos y protección contra descapitalización.
* Los registros se capturan de forma inmutable mediante el **Snapshot Pattern** en `public.finance_rates`.

---

## 3. Evidencias de la Especificación de la API

Las especificaciones completas de los payloads y respuestas del proveedor se encuentran archivadas en la carpeta de activos:
- [Página 1: Especificación General de la API](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/api/assets/page-1-api.png)
- [Páginas 2 a 14: Endpoints de Tasas, Bancos y Criptomonedas](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/api/assets/)
