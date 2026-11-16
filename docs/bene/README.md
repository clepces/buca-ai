# 🧠 BENE (Balanced Effect Neural Engine)
## Motor Neuronal de Efecto Equilibrado

> **Ecosistema:** B.U.C.A. AI  
> **Área:** Motor Gráfico, Telemetría de Hardware y Orquestación de Efectos Visuales  
> **Estado:** Transición de Versión 5.3.0 (Producción) a Versión 6.0.0 (Investigación & Refactorización)

---

## 🌟 Visión y Filosofía

El nombre **BENE (Balanced Effect Neural Engine) — Motor neuronal de efecto equilibrado** — encarna la filosofía y el salto arquitectónico de la plataforma: deja de ser un motor meramente reactivo y acoplado a un único estilo de diseño visual para convertirse en un **orquestador de efectos agnóstico y equilibrado**, capaz de gobernar múltiples lenguajes de diseño visual sin sacrificar ciclos de rendimiento en el dispositivo del usuario.

```mermaid
flowchart LR
    A["Hardware & Telemetría<br/>(FPS / Batería / Memoria / CPU)"] --> B["BENE Orquestador<br/>(Cálculo Paramétrico)"]
    B --> C["Atributos Declarativos<br/>(bne-perf / bne-effect)"]
    C --> D["Renderizado Nativo GPU<br/>(CSS Puro / Cero Overhead JS)"]
```

---

## 📚 Índice de Versiones Documentadas

| Versión | Denominación | Estado | Documentación |
|---|---|:---:|---|
| **v5.3.0** | **BNE Legacy (Production Core)** | 🟢 Activa en `/src/core/engine` | [Documentación v5.3.0](./5.3.0/README.md) |
| **v6.0.0** | **BENE Next-Gen (Agnostic Orchestrator)** | 🧪 Etapa de Investigación | [Documentación v6.0.0](./6.0.0/README.md) |

---

## 🔑 Pilares Fundamentales de la Evolución a BENE v6.0.0

1. **Motor Agnóstico de Múltiples Efectos (`bne-effect`):** Soporte declarativo para alternar entre *Glassmorphism*, *Neumorphism*, *Neubrutalism*, *Claymorphism*, *Bento Grid*, etc., sin alterar la lógica de negocio.
2. **Desacoplamiento Radical:** Separación estricta entre el CSS Base estructural y las hojas de efectos modulares.
3. **Cero Carga de JavaScript en Degradación:** JavaScript se limita exclusivamente a calcular la telemetría y emitir atributos semánticos en el nodo raíz; el motor CSS nativo se encarga de la degradación a 60 FPS estables.
4. **Inteligencia Ambiental y Contraste Automático:** Evaluación dinámica de contraste y legibilidad con transiciones suaves en todos los perfiles, incluido el perfil de supervivencia `L0 Eco`.
