/**
 * HTTP Client - Wrapper de Fetch para BUCA
 * =========================================================================
 * Proporciona una interfaz unificada para peticiones externas con manejo
 * automático de errores, cabeceras y timeouts.
 */
export class HttpClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const controller = new AbortController();
        const timeoutMs = options.timeout || 10000;
        const id = setTimeout(() => controller.abort(), timeoutMs);

        if (options.signal) {
            if (options.signal.aborted) controller.abort();
            else options.signal.addEventListener('abort', () => controller.abort(), { once: true });
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: controller.signal
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options, signal: controller.signal });
            clearTimeout(id);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const contentType = response.headers.get('content-type') || '';
            const rawText = await response.text();
            if (rawText && (contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('['))) {
                try {
                    return JSON.parse(rawText);
                } catch {
                    return rawText;
                }
            }
            return rawText;
        } catch (error) {
            clearTimeout(id);
            console.error(`[HttpClient] Request failed: ${url}`, error);
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

export const http = new HttpClient();
export default http;
