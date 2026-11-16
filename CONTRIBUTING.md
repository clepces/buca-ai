# 🤝 Guía de Contribución y Estándares de Ingeniería — B.U.C.A. AI

Agradecemos tu interés en colaborar con **B.U.C.A. AI**. Este proyecto opera bajo estándares de ingeniería de software rigurosos para garantizar estabilidad corporativa, alto rendimiento gráfico y soberanía operativa. Tanto los desarrolladores humanos como los agentes de inteligencia artificial (Google AI Studio, Antigravity, Copilot, Cursor) deben cumplir estrictamente las directivas de este documento.

---

## 🚨 1. Directivas Arquitectónicas Inmutables (No Negociables)

### 1.1. CERO FRAMEWORKS (Strict Vanilla JS Modular)
* **Queda estrictamente prohibido** instalar, compilar o introducir dependencias de **React, Vue, Angular, Svelte o JSX/TSX**.
* No se permiten capas de abstracción de DOM Virtual ni librerías de UI invasivas.
* Todo componente se construye exclusivamente mediante:
  - **JavaScript ES6+ nativo**.
  - **Template Literals** para plantillas HTML declarativas.
  - **Web Components nativos** y manipulación directa y segura del DOM (`document.createElement`, `insertAdjacentHTML`).

### 1.2. Límite Estricto de 300 Líneas por Archivo
* **Ningún archivo de código fuente (`.js`, `.scss`) puede superar las 300 líneas de código.**
* Si una vista, controlador o servicio se aproxima a dicho límite, **debe subdividirse** de inmediato en controladores auxiliares, repositorios, plantillas o helpers dedicados (ejemplo: particionar un modal en `components/rate-modal/rate-calculator-tab.js`).

### 1.3. Nomenclatura Kebab-Case Obligatoria
* **Archivos y Directorios:** Estrictamente en minúsculas separados por guiones (ej. `rate-controller.js`, `module-placeholder-page.js`, `business-repository.js`).
* **Clases y Constructores:** `PascalCase` (ej. `BusinessRepository`, `RateController`).
* **Métodos y Variables:** `camelCase` (ej. `calculateGap`, `syncGlobalRate`).
* **Acciones en el DOM:** Atributos de datos con prefijo de dominio `data-action="modulo:accion"` (ej. `data-action="workspace:scroll_carousel"`).
* **Nivel de Rendimiento:** Atributo unificado `data-buca-perf="L0|L1|L2|L3"`.

### 1.4. Arquitectura Clean Core de Tres Capas
Toda nueva funcionalidad debe ubicarse en la capa correspondiente:
1. **`src/core/`**: Exclusivamente servicios transversales del Kernel (motor de eventos, router, seguridad, adapters de almacenamiento, drivers, estado base). Prohibido ubicar vistas comerciales aquí.
2. **`src/modules/`**: Dominios de negocio desacoplados (`auth`, `workspace`, `business`, `finance`, `profile`). Cada módulo debe mantener su estructura canónica de 8 carpetas/archivos.
3. **`src/shared/`**: Layouts globales, modales de sistema, hojas de estilo maestras (`src/shared/styles/neural/`) y utilidades reutilizables.

---

## 🌿 2. Flujo de Trabajo en Git y Versionado Semántico (SemVer)

### 2.1. Estrategia de Ramas en "Y" (Branching Model)
* **Prohibido trabajar o hacer commits directamente en la rama principal (`main` o `master`).**
* Para cualquier cambio funcional o refactorización:
  1. Crear una rama aislada desde `main`:
     ```bash
     git checkout -b feature/nombre-de-la-funcionalidad
     # o
     git checkout -b fix/nombre-del-parche
     ```
  2. Implementar los cambios asegurando que las pruebas locales se ejecuten con éxito.
  3. Fusionar hacia la rama principal mediante Pull Request revisado o integración controlada.

### 2.2. Convención Estándar de Commits (Conventional Commits)
Los mensajes de confirmación deben seguir estrictamente el estándar corporativo:

| Tipo | Propósito | Ejemplo |
|---|---|---|
| `feat(scope)` | Nueva funcionalidad modular | `feat(finance): add bcv and parallel rate gap calculation` |
| `fix(scope)` | Corrección de un fallo o bug | `fix(auth): resolve session token refresh timeout` |
| `refactor(scope)` | Reestructuración de código sin alterar comportamiento | `refactor(workspace): split telemetry into modular component` |
| `docs(scope)` | Actualización o creación de documentación | `docs(database): update postgresql schema and rls rules` |
| `test(scope)` | Inclusión o ajuste de suites de prueba | `test(mfa): add unit tests for canvas qr generation` |
| `chore(version)` | Incremento de versión semántica | `chore(version): bump version to v1.1.9-alpha` |

### 2.3. Gestión del Ciclo de Vida SemVer
El incremento de versión en `package.json` responde a la siguiente jerarquía:
* **PATCH (`x.x.+1`):** Correcciones menores, ajustes de estilos o parches sin impacto estructural.
* **MINOR (`x.+1.0`):** Nuevos módulos de negocio, servicios o integraciones que preservan compatibilidad hacia atrás.
* **MAJOR (`+1.0.0`):** Cambios estructurales mayores que rompen contratos previos.
* **Fases Pre-release:** `-alpha` (desarrollo activo), `-beta` (estabilización), `-rc` (candidato a producción). **Nunca cambiar de fase sin aprobación explícita del usuario.**

---

## 🛡️ 3. Reglas de Integridad del Motor Gráfico (BNE-RULE-001)

1. **Tokens Dinámicos:** Prohibido el uso de valores hexadecimales o filtros de desenfoque fijos en selectores CSS. Emplear las variables de diseño:
   ```scss
   // Correcto:
   background: var(--surface-glass);
   border: 1px solid var(--border-glass);
   backdrop-filter: blur(var(--blur-intensity));

   // Incorrecto:
   background: rgba(255, 255, 255, 0.7);
   backdrop-filter: blur(12px);
   ```
2. **Variante L0 Eco Obligatoria:** Todo componente que utilice desenfoque (`backdrop-filter`) **debe incluir obligatoriamente** la variante para `[data-buca-perf="L0"]` con fondo sólido opaco (`background: var(--surface-solid)`).
3. **Cero Layout Thrashing:** Agrupar lecturas del DOM antes de escrituras; apoyarse en `ReflowGuard` y `GhostSanitizer` del Kernel.

---

## 🧪 4. Verificación de Calidad Pre-Commit

Antes de emitir cualquier commit o proponer cambios, es obligatorio ejecutar localmente:

```bash
# 1. Pruebas de integración, RLS y contratos
npm test

# 2. Análisis estático de sintaxis y buenas prácticas
npm run lint

# 3. Verificación de tipos de JavaScript
npm run type-check

# 4. Prueba de compilación de producción con Vite
npm run build
```

---

## 🚫 5. Qué NO Hacer Bajo Ninguna Circunstancia

- ❌ **NO** agregues dependencias externas innecesarias al `package.json` sin justificación de costo/peso.
- ❌ **NO** expongas secretos ni credenciales sensibles en código cliente.
- ❌ **NO** edites directamente la carpeta `/dist`.
- ❌ **NO** desactives las políticas de Row Level Security (RLS) en Supabase para "simplificar" una consulta.
- ❌ **NO** uses métodos de I/O bloqueantes síncronos en Node.js.
