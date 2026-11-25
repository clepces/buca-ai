/**
 * @fileoverview Node.js ESM Loader Hook — resolves @/ alias to src/ for tests.
 * Usage: node --import ./tests/loader-alias.js --test tests/kernel-lifecycle.test.js
 *
 * This hook intercepts import specifiers starting with '@/' and rewrites them
 * to file:// URLs pointing at the src/ directory, mirroring Vite's resolve.alias.
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1')), '..');
const SRC_DIR = pathToFileURL(path.join(PROJECT_ROOT, 'src')).href;

register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
        const rewritten = '${SRC_DIR}/' + specifier.slice(2);
        return nextResolve(rewritten, context);
    }
    return nextResolve(specifier, context);
}
`), import.meta.url);
