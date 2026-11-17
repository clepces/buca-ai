# 🎨 Tokens SCSS y Mixins del BNE v5.3.0
## Especificación de Estilos de Cristal y Degradación L0

> **Módulo:** `docs/bene/5.3.0/scss-tokens.md`  
> **Directiva:** `BNE-RULE-001`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Mixin Canónico de Superficie de Cristal

```scss
@mixin buca-surface-glass {
    background: var(--surface-glass);
    border: 1px solid var(--border-glass);
    backdrop-filter: blur(var(--blur-intensity));
    -webkit-backdrop-filter: blur(var(--blur-intensity));

    // Degradación obligatoria L0 para hardware modesto
    // Legacy: [data-buca-perf="L0"] — Nuevo: [bne-perf="L0"]
    [bne-perf="L0"] & {
        background: var(--surface-solid) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border-color: var(--border-solid) !important;
    }
}
```

---

## 2. Variables Dinámicas de Rendimiento

* `--blur-intensity`: `0px` en L0, `6px` en L1, `14px` en L2, `22px` en L3.
* `--surface-glass`: Fondo translúcido con transparencia calculada por tema.
* `--border-glass`: Borde translúcido para definir aristas de cristal.
