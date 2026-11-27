import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default defineConfig({
    root: './',
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version)
    },
    resolve: {
        alias: [
            {
                find: '@',
                replacement: path.resolve(__dirname, 'src')
            }
        ]
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                silenceDeprecations: ['global-builtin', 'color-functions', 'import']
            }
        }
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
        allowedHosts: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
    },
    preview: {
        allowedHosts: true
    },
    build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('bootstrap')) return 'vendor-bootstrap';
                        return 'vendor';
                    }
                }
            }
        }
    }
});
