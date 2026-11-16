# 🧩 Guía de Desarrollo de Módulos Plug-and-Play — B.U.C.A. AI

> **Documento:** Estándar de Anatomía Canónica, Ciclo de Vida y Ensamblaje Modular  
> **Ubicación en Código:** `src/modules/[nombre-modulo]/`  
> **Directiva Fundamental:** Modularidad Estricta, Límite de 300 Líneas por Archivo y Nomenclatura Kebab-Case

---

## 1. Filosofía del Ecosistema Modular

En B.U.C.A. AI, cada dominio de negocio (compras, ventas, inventarios, finanzas, usuarios) se concibe como un **módulo autónomo e intercambiable (Plug-and-Play)**. Un módulo no debe depender directamente de los archivos internos de otro módulo; toda interacción transversal se realiza mediante el `EventBus` central o mediante repositorios y servicios expuestos en su interfaz pública (`index.js`).

---

## 2. Anatomía Canónica de un Módulo (Estructura de 8 Partes)

Todo módulo nuevo en `src/modules/` debe estructurarse conforme a la siguiente disposición de directorios y archivos:

```text
src/modules/[nombre-modulo]/
  ├── index.js          # Punto de entrada, bootstrap, registro y ciclo de vida (init / destroy)
  ├── routes.js         # Definición de rutas específicas para el SPA Router
  ├── components/       # Componentes visuales UI nativos (Template Literals / Web Components)
  ├── logic/            # Reglas de negocio puras, controladores y orquestadores
  ├── pages/            # Vistas principales de página completa montadas por el Router
  ├── styles/           # Hojas de estilo locales en SCSS vinculadas a Corporate Hybrid Glass
  ├── services/         # Servicios de persistencia, Repositorios Supabase y APIs
  └── constants/        # Constantes locales, enumeradores, códigos de error y acciones
```

---

## 3. Especificación Técnica de los Componentes del Módulo

### 3.1. Punto de Entrada: `index.js`
Es la interfaz pública del módulo. Debe exportar un objeto o clase singleton que implemente el ciclo de vida estándar:

```javascript
/**
 * src/modules/ejemplo/index.js
 */
import { EjemploRepository } from './services/EjemploRepository.js';
import { eventBus } from '@/core/eventBus/index.js';

export const EjemploModule = {
    name: 'ejemplo',
    isLoaded: false,

    async init() {
        if (this.isLoaded) return;
        console.log('[EjemploModule] Inicializando...');
        
        // 1. Suscribir listeners en el EventBus
        eventBus.on('ejemplo:accion_critica', this.handleAccionCritica.bind(this));

        // 2. Precargar datos iniciales del repositorio
        await EjemploRepository.init();

        this.isLoaded = true;
    },

    async destroy() {
        console.log('[EjemploModule] Desmontando recursos...');
        eventBus.off('ejemplo:accion_critica');
        this.isLoaded = false;
    },

    handleAccionCritica(payload) {
        // Lógica de reacción ante eventos del sistema
    }
};

export default EjemploModule;
```

### 3.2. Definición de Rutas: `routes.js`
Define las rutas que el `router.js` del Kernel mapeará hacia las vistas principales:

```javascript
/**
 * src/modules/ejemplo/routes.js
 */
import EjemploPage from './pages/EjemploPage.js';

export const ejemploRoutes = [
    {
        path: '/ejemplo',
        component: EjemploPage,
        title: 'Gestión de Ejemplo',
        requiresAuth: true,
        permission: 'ejemplo.view'
    }
];

export default ejemploRoutes;
```

### 3.3. Componentes Visuales: `components/`
Los componentes se crean mediante manipulación nativa del DOM y plantillas literales (ES6 Template Literals), exportando funciones o clases con métodos `render()`, `init()` y `destroy()`:

```javascript
/**
 * src/modules/ejemplo/components/EjemploCard.js
 */
export const EjemploCard = {
    render(data) {
        return `
            <div class="buca-card p-3 mb-3" data-id="${data.id}">
                <h5 class="buca-card-title">${data.title}</h5>
                <p class="text-muted">${data.description}</p>
                <button type="button" class="btn btn-primary" 
                        data-action="ejemplo:ejecutar" 
                        data-id="${data.id}">
                    Procesar
                </button>
            </div>
        `;
    },
    init(containerEl) {
        // Vinculación de eventos locales si es necesario
    }
};
```

### 3.4. Servicios y Persistencia: `services/`
Se encargan del acceso a datos mediante el SDK de Supabase o `StorageAdapter`. Deben aplicar límites en las consultas (`.range()` o `.limit()`) y encapsular las llamadas a la base de datos:

```javascript
/**
 * src/modules/ejemplo/services/EjemploRepository.js
 */
import { getSupabase } from '@/core/config/supabase.js';

export class EjemploRepository {
    static async listItems(page = 0, limit = 20) {
        const supabase = getSupabase();
        const from = page * limit;
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from('ejemplo_items')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        return data || [];
    }
}
```

---

## 4. Paso a Paso para Registrar un Nuevo Módulo en el Sistema

1. **Crear la Estructura Canónica:** Crear la carpeta del módulo dentro de `src/modules/[nombre-modulo]/` con sus 8 componentes.
2. **Registrar en el `ModuleLoader`:** Agregar la importación dinámica en `src/core/ModuleLoader.js`:
   ```javascript
   const DYNAMIC_REGISTRY = {
       // ...
       'nuevo-modulo': () => import('@/modules/nuevo-modulo/index.js')
   };
   ```
3. **Registrar Rutas en el Router:** Importar sus rutas en `src/core/router/routes.js`:
   ```javascript
   import { nuevoModuloRoutes } from '@/modules/nuevo-modulo/routes.js';
   export const routes = [
       // ...
       ...nuevoModuloRoutes
   ];
   ```
4. **Verificar Límites y Estilo:** Asegurarse de que ningún archivo supere las 300 líneas y que los estilos sigan el mixin `buca-surface-glass` con degradación L0.
