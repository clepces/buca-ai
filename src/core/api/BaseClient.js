/**
 * BaseClient - Corazón de la Comunicación Externa BNE
 * =========================================================================
 * Evolución del HttpClient con soporte para Interceptores, Timeouts
 * y Resiliencia Nativa.
 * =========================================================================
 */
import { storage } from '../storage/StorageAdapter.js';

export class BaseClient {
    constructor(baseURL = '', timeout = 10000) {
        this.baseURL = baseURL;
        this.timeout = timeout;
        this.interceptors = {
            request: [],
            response: []
        };
    }

    /**
     * Registra un interceptor de petición.
     */
    addRequestInterceptor(fn) {
        this.interceptors.request.push(fn);
    }

    /**
     * Ejecuta una petición con control total del ciclo de vida.
     */
    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutMs = options.timeout || this.timeout;
        const id = setTimeout(() => controller.abort(), timeoutMs);

        if (options.signal) {
            if (options.signal.aborted) {
                controller.abort();
            } else {
                options.signal.addEventListener('abort', () => controller.abort(), { once: true });
            }
        }

        // 1. Aplicar Interceptores de Petición (Inyección de Tokens, etc)
        let config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: controller.signal
        };

        for (const interceptor of this.interceptors.request) {
            config = await interceptor(config);
        }

        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, config);
            clearTimeout(id);

            // 2. Manejo de Errores HTTP
            if (!response.ok) {
                let errorBody = {};
                try {
                    const rawError = await response.text();
                    errorBody = rawError ? JSON.parse(rawError) : {};
                } catch {
                    errorBody = { message: `HTTP Error: ${response.status}` };
                }
                throw {
                    status: response.status,
                    message: errorBody.message || 'Error en la comunicación API',
                    data: errorBody
                };
            }

            // Manejo flexible y seguro del cuerpo de la respuesta (JSON, Texto plano o Vacío)
            const contentType = response.headers.get('content-type') || '';
            const rawText = await response.text();
            let data = null;

            if (rawText && rawText.trim().length > 0) {
                const trimmed = rawText.trim();
                if (contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
                    try {
                        data = JSON.parse(rawText);
                    } catch {
                        data = rawText;
                    }
                } else {
                    // Texto plano como "OK" de EmailJS u otros servicios
                    data = rawText;
                }
            } else {
                data = { status: response.status, ok: true };
            }

            // 3. Aplicar Interceptores de Respuesta
            let finalData = data;
            for (const interceptor of this.interceptors.response) {
                finalData = await interceptor(finalData);
            }

            return finalData;

        } catch (error) {
            clearTimeout(id);
            const { eventBus } = await import('@/core/eventBus/index.js');

            if (error.name === 'AbortError') {
                console.warn(`[API] -> Timeout alcanzado en: ${url}`);
                if (!options.silent && options.notifyOnError !== false) {
                    eventBus.emit('notifications:push', {
                        title: 'Error de Red',
                        message: 'La petición ha tardado demasiado tiempo.',
                        type: 'error'
                    });
                }
                throw new Error('La petición ha tardado demasiado tiempo.', { cause: error });
            }

            if (!options.silent && options.notifyOnError !== false) {
                eventBus.emit('notifications:push', {
                    title: 'Error de Comunicación',
                    message: error.message || 'No se pudo contactar con el servidor.',
                    type: 'error'
                });
            }
            throw error;
        }
    }

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    }
}

export const api = new BaseClient();

// --- CONFIGURACIÓN DE INTERCEPTORES POR DEFECTO ---

// Inyección automática del Token de Auth
api.addRequestInterceptor(async (config) => {
    const authStorage = storage.forModule('auth');
    const token = await authStorage.get('token');
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;
