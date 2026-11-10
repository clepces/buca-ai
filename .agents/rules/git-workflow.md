---
trigger: always_on
description: "Protocolo universal obligatorio para control de versiones en Git, control SemVer, flujos en ramas Y (Feature Branches) y autocorrección de errores para la inteligencia artificial."
---

# 🚨 UNIVERSAL PROTOCOL: GIT WORKFLOW, SEMVER & AI SELF-CORRECTION
# PRIORIDAD: MÁXIMA / OBLIGATORIA (MUST READ FIRST BEFORE ANY OPERATION)

Este documento define el estándar profesional obligatorio para la gestión de control de versiones (Git), versionado semántico (SemVer) y el protocolo de seguridad de la inteligencia artificial en cualquier repositorio.

---

### 1. GESTIÓN DINÁMICA DEL CICLO DE VIDA Y SEMVER (Semantic Versioning)
El agente debe analizar el impacto de los cambios para determinar automáticamente el incremento de versión en `package.json` o metadatos equivalentes, respetando rigurosamente el ciclo de vida del software:

* **Estructura base:** `MAJOR.MINOR.PATCH-PHASE` (Ej: `v1.1.0-alpha`)
* **PATCH (x.x.+1):** Corrección de bugs menores, parches de estilo, ajustes de sintaxis o refactorizaciones aisladas que no alteran la arquitectura.
* **MINOR (x.+1.0):** Nuevas funcionalidades modulares, incorporación de nuevos servicios/drivers o cambios intermedios de arquitectura.
* **MAJOR (+1.0.0):** Cambios estructurales masivos, reescritura total o modificaciones que rompen la compatibilidad con versiones anteriores.

#### Transición de Fases (Pre-release Stages):
El agente **nunca** debe cambiar de fase por iniciativa propia; requiere la confirmación explícita del usuario mediante comandos o instrucciones directas:
1. **`-alpha` (Alfa):** Fase de desarrollo activo, pruebas locales y estructuración base.
2. **`-beta` (Beta):** Fase donde las características principales están completas y se estabiliza el sistema para validación externa.
3. **`-rc` (Release Candidate):** Candidato a producción; solo admite correcciones críticas de última hora.
4. **Estable (Sin sufijo):** Versión oficial liberada a producción.

---

### 2. ESTRATEGIA DE RAMAS EN "Y" (FEATURE / MIGRATION BRANCHES)
Para cualquier cambio de categoría **MINOR**, **MAJOR** o tareas de alto riesgo:
1. **PROHIBIDO** trabajar directamente sobre la rama principal (`main` o `master`).
2. El agente debe crear y cambiar automáticamente a una rama aislada de tipo feature o fix:
   `git checkout -b feature/nombre-descriptivo` o `fix/nombre-descriptivo`
3. Validar de forma local que el proyecto compile y supere las pruebas de integración.
4. Al completar con éxito, fusionar de regreso a la rama principal y etiquetar el hito (`git tag -a vX.X.X-Phase -m "Release notes"`).

---

### 3. PROTOCOLO DE AUTOCORRECCIÓN Y TRANSPARENCIA ANTE ERRORES
El agente actúa bajo el principio de **"Cero Ceguera Operativa"**:
* **Si ocurre un conflicto de fusión (*merge conflict*), un fallo de compilación o un error inesperado:**
  1. **Detener la ejecución** inmediatamente antes de aplicar cambios destructivos o sobrescribir código.
  2. **Analizar la causa raíz** utilizando su conocimiento técnico.
  3. **Informar al usuario en lenguaje claro y humano**, detallando exactamente *qué falló*, *por qué ocurrió* y *cuál es la solución propuesta*.
  4. **Esperar la confirmación explícita del usuario** antes de proceder (ej: aplicar un `git stash`, abortar el merge o aplicar un parche de corrección).
* El agente **nunca** debe ocultar un error ni asumir un riesgo crítico sin que el humano supervise la decisión de respaldo.

---

### 4. CONVENCIÓN ESTÁNDAR DE COMMITS (Conventional Commits)
Los mensajes de commit seguirán estrictamente el formato estándar de la industria:
- `feat(scope): ...` (Nuevas características)
- `fix(scope): ...` (Corrección de errores)
- `refactor(scope): ...` (Mejoras de código sin cambiar funcionalidad)
- `chore(version): bump version to vX.X.X-Phase` (Actualizaciones de versión)
- `docs(scope): ...` (Actualización de documentación)