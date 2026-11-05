# Estrategia de Migración a TypeScript y Análisis de Arquitectura (B.U.C.A. AI)

> **Documento:** Roadmap de Transición Tecnológica e Inspiración en DeepSeek-Harness  
> **Versión:** 1.0.0  
> **Estado:** Propuesta de Ingeniería

---

## 1. Análisis de Referencia: DeepSeek-Harness (DSH)

El proyecto [DeepSeek-Harness](https://github.com/deepseek-ai/deepseek-harness) representa un estándar de oro en cuanto a **modularización extrema** y **seguridad de tipos** en entornos de agentes y herramientas.

### 1.1. Pilares de DSH Aplicables a B.U.C.A. AI
1. **Arquitectura de Plugins (Cordis):** DSH utiliza el framework Cordis donde "todo es un plugin". En B.U.C.A. AI, esto se traduce en que cada módulo de negocio (`auth`, `inventory`, `pos`) debe ser una unidad autónoma con su propio ciclo de vida (mount/unmount) gestionado por el `LifecycleManager`.
2. **Tipado Nominal y Branded Types:** Para evitar confusiones entre `business_id`, `user_id` y `product_id`, DSH utiliza tipos de marca. Migraremos a:
   ```typescript
   type BusinessId = string & { readonly __brand: 'BusinessId' };
   ```
3. **Esquemas de Configuración Declarativos:** DSH define sus configuraciones mediante esquemas que generan interfaces de TypeScript. Implementaremos esto para los `display_cache` de los negocios.
4. **Scripts de Análisis de AST:** DSH usa scripts para analizar el árbol de sintaxis de TypeScript y asegurar la integridad del proyecto. Usaremos `ts-morph` o similares para validar que ningún módulo viole el límite de 300 líneas.

---

## 2. Lógica de Roles BUCA: El Modelo Híbrido Dual

A diferencia de sistemas ERP tradicionales donde un usuario tiene un rol estático, en BUCA AI la identidad es **fluida y multi-tenant**.

### 2.1. El Usuario Híbrido (Owner/Worker)
Un usuario no "es" un cajero; un usuario **ejerce** como cajero en un contexto específico.
* **Owner Mode:** Gestión de suscripción, creación de negocios, definición de tasas y auditoría total.
* **Worker Mode (Modo Espejo):** Ejecución operativa. El sistema restringe la UI a los `claims` otorgados por el Owner del negocio contratante.

### 2.2. Aislamiento Multi-Tenant
La migración a TypeScript permitirá definir interfaces estrictas para los contextos de ejecución:
```typescript
interface ExecutionContext {
  userId: UserId;
  activeBusinessId: BusinessId;
  role: 'owner' | 'manager' | 'cashier' | 'inventory';
  claims: PermissionClaim[];
}
```

---

## 3. Hoja de Ruta de Migración (Roadmap)

La transición se realizará en fases incrementales para no interrumpir el desarrollo de funcionalidades:

### Fase 1: Infraestructura y Tipos Globales (En Progreso)
* Instalar `typescript`, `tsx`, `vite-plugin-dts`.
* Definir `src/types/` con los modelos de datos de `docs/database.md`.
* Configurar `tsconfig.json` con `strict: true`.

### Fase 2: Core Kernel (Prioridad Alta)
* Migrar `src/core/eventBus/` y `src/core/state/` a `.ts`.
* Tipar los eventos del Bus para evitar errores de payload en tiempo de desarrollo.

### Fase 3: Capa de Servicios y Firebase
* Migrar `FirebaseProvider.js` a `FirebaseProvider.ts`.
* Implementar validación de esquemas mediante `Zod` o `TypeBox` en las entradas/salidas de Firestore.

### Fase 4: Módulos de Negocio y UI
* Conversión gradual de componentes de `index.js` a `index.tsx` (usando JSX para mayor legibilidad aunque sea Vanilla).
* Implementar Web Components nativos tipados para la UI "Corporate Hybrid Glass".

---

## 4. Conclusión Técnica

La migración a TypeScript no es solo un cambio de extensión de archivo; es la adopción de una **disciplina de ingeniería** que permitirá a BUCA AI escalar a cientos de módulos sin degradar la calidad ni la seguridad de los datos financieros. La inspiración en DeepSeek-Harness nos empuja hacia un sistema basado en contratos claros y una orquestación centralizada robusta.
