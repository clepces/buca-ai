# 👁️ Accesibilidad Universal y Contraste Dinámico (WCAG AAA)
## Directivas de Inclusión, Navegación por Teclado y Contraste

> **Módulo:** `docs/ui/accessibility-wcag.md`  
> **Estándar:** WCAG 2.2 Nivel AAA / WAI-ARIA 1.2  
> **Estado:** `[Especificación de Ingeniería (new)]`

---

## 1. Contraste Dinámico sobre Superficies Translúcidas

Uno de los mayores retos del diseño *Glassmorphism* es garantizar la legibilidad del texto cuando el fondo cambia dinámicamente. B.U.C.A. AI implementa las siguientes reglas:

1. **Relación de Contraste Mínima:** `7:1` para texto estándar y `4.5:1` para texto grande (18px+ en negrita).
2. **Evaluación de Luminancia:** Si un fondo translúcido se ubica sobre una imagen o degradado brillante en modo oscuro, el motor BENE inyecta automáticamente una máscara protectora opaca:
   ```css
   [data-contrast-guard="true"] {
       background: rgba(15, 23, 42, 0.92) !important;
   }
   ```

---

## 2. Compatibilidad Multi-Navegador

* **Selección de Texto en Safari e iOS:** Inclusión obligatoria del prefijo propietario `-webkit-user-select: none;` junto a `user-select: none;` en todos los controles interactivos y modales.
* **Metadatos de Color de Tema (`theme-color`):** Uso de media queries para adaptar la barra de estado de navegadores móviles:
  ```html
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#2563eb">
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a">
  ```

---

## 3. Navegación por Teclado y Focus Rings

* **Indicador de Foco Visible:** Todo elemento interactivo (`button`, `input`, `a`) posee un contorno de foco de alto contraste:
  ```css
  :focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
  }
  ```
* **Atajos de Teclado Globales:**
  - `Escape`: Cierre de modales y menús desplegables.
  - `Tab` / `Shift+Tab`: Navegación cíclica dentro de modales (*Focus Trap*).
