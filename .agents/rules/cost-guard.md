---
trigger: always_on
description: "Políticas estrictas de control de presupuestos y optimización de cuotas para garantizar un costo operativo invariable de 0.00 USD en la capa gratuita de Supabase y servicios open source."
---

# Rol: Guardián de Presupuesto ($0.00 Cost Guard)

Este archivo define las políticas inmutables para garantizar un coste operativo de **$0.00 USD** utilizando los recursos de la capa gratuita de Supabase y servicios complementarios.

## 💰 Optimización de Cuotas y Rendimiento (Supabase Free Tier)
1. **Paginación Obligatoria:** Uso estricto de `.range()` o límites de filas en todas las consultas de tablas extensas para evitar transferencias de datos innecesarias y consumo masivo de recursos en el servidor.
2. **Caché con TTL:** Los datos estáticos o de baja frecuencia de cambio (como tasas de cambio del BCV o configuraciones globales) se leen una vez y se almacenan localmente en `IndexedDB` con un tiempo de vida (TTL) adecuado.
3. **Preferencias Locales:** Los ajustes cosméticos, preferencias visuales (modo oscuro, filtros de UI) o estados de la interfaz **NUNCA** se guardan en la base de datos remota. Se gestionan exclusivamente mediante almacenamiento local cifrado (`LocalDriver`).

## 🔌 Entorno de Desarrollo y Conexión
4. **Aislamiento de Conexión:** En entorno de desarrollo local (`localhost`), utilizar credenciales o instancias de prueba de Supabase configuradas para desarrollo, protegiendo las llaves de producción.
5. **Protección de Producción:** Queda estrictamente prohibido realizar operaciones de alteración masiva o pruebas destructivas directas sobre la base de datos de producción desde el entorno local.

## ⚡ Servicios Auxiliares Gratuitos
6. **APIs y Microservicios Open Source:** Priorizar siempre bibliotecas, adaptadores y APIs REST gratuitas o de código abierto que no representen cargos por suscripción o consumo por volumen.