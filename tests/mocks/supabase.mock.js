/**
 * SupabaseMock - Cliente en Memoria para Aislamiento Absoluto de Pruebas
 * =========================================================================
 * Evita cualquier llamada a la API remota de Supabase durante npm test.
 * Implementa almacenamiento en memoria, query builders y autenticación mock.
 * =========================================================================
 */

export class MockTableQueryBuilder {
    constructor(tableName, store) {
        this.tableName = tableName;
        this.store = store;
        if (!this.store.has(tableName)) {
            this.store.set(tableName, []);
        }
        this._filters = [];
        this._selectCols = '*';
        this._limitCount = null;
        this._pendingAction = 'select'; // 'select', 'insert', 'upsert', 'update', 'delete'
        this._actionPayload = null;
        this._onConflict = null;
    }

    select(cols = '*') {
        this._selectCols = cols;
        return this;
    }

    eq(column, value) {
        this._filters.push(row => row[column] === value);
        return this;
    }

    like(column, pattern) {
        const regexStr = '^' + pattern.replace(/%/g, '.*') + '$';
        const regex = new RegExp(regexStr);
        this._filters.push(row => regex.test(String(row[column] || '')));
        return this;
    }

    or(filterExp) {
        // Soporta formatos simples como "owner_id.eq.USER,owner_id.is.null"
        const parts = filterExp.split(',');
        this._filters.push(row => {
            return parts.some(p => {
                if (p.includes('.is.null')) {
                    const col = p.split('.is.null')[0];
                    return row[col] == null;
                }
                if (p.includes('.eq.')) {
                    const [col, val] = p.split('.eq.');
                    return String(row[col]) === String(val);
                }
                return false;
            });
        });
        return this;
    }

    order() {
        return this;
    }

    limit(n) {
        this._limitCount = n;
        return this;
    }

    insert(data) {
        this._pendingAction = 'insert';
        this._actionPayload = Array.isArray(data) ? data : [data];
        return this;
    }

    upsert(data, opts = {}) {
        this._pendingAction = 'upsert';
        this._actionPayload = Array.isArray(data) ? data : [data];
        this._onConflict = opts.onConflict || 'id';
        return this;
    }

    update(data) {
        this._pendingAction = 'update';
        this._actionPayload = data;
        return this;
    }

    delete() {
        this._pendingAction = 'delete';
        return this;
    }

    _applyFilters(rows) {
        let result = rows;
        for (const f of this._filters) {
            result = result.filter(f);
        }
        return result;
    }

    async then(resolve) {
        const tableRows = this.store.get(this.tableName) || [];

        if (this._pendingAction === 'insert') {
            const newRows = this._actionPayload.map(item => ({
                id: item.id || `mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                created_at: new Date().toISOString(),
                ...item
            }));
            tableRows.push(...newRows);
            return resolve({ data: newRows, error: null });
        }

        if (this._pendingAction === 'upsert') {
            const conflictKey = this._onConflict || 'key';
            const inserted = [];
            for (const item of this._actionPayload) {
                const idx = tableRows.findIndex(r => r[conflictKey] === item[conflictKey]);
                if (idx >= 0) {
                    tableRows[idx] = { ...tableRows[idx], ...item };
                    inserted.push(tableRows[idx]);
                } else {
                    const newRow = {
                        id: item.id || `mock_${Date.now()}`,
                        created_at: new Date().toISOString(),
                        ...item
                    };
                    tableRows.push(newRow);
                    inserted.push(newRow);
                }
            }
            return resolve({ data: inserted, error: null });
        }

        if (this._pendingAction === 'update') {
            let count = 0;
            for (let i = 0; i < tableRows.length; i++) {
                if (this._filters.every(f => f(tableRows[i]))) {
                    tableRows[i] = { ...tableRows[i], ...this._actionPayload };
                    count++;
                }
            }
            return resolve({ data: count, error: null });
        }

        if (this._pendingAction === 'delete') {
            const initialLen = tableRows.length;
            const remaining = tableRows.filter(r => !this._filters.every(f => f(r)));
            this.store.set(this.tableName, remaining);
            return resolve({ data: initialLen - remaining.length, error: null });
        }

        // SELECT por defecto
        let matching = this._applyFilters(tableRows);
        if (this._limitCount != null) {
            matching = matching.slice(0, this._limitCount);
        }

        return resolve({ data: matching, error: null });
    }

    async single() {
        const res = await new Promise(r => this.then(r));
        const item = res.data?.[0] || null;
        return { data: item, error: item ? null : { message: 'Row not found' } };
    }

    async maybeSingle() {
        const res = await new Promise(r => this.then(r));
        const item = res.data?.[0] || null;
        return { data: item, error: null };
    }
}

export function createMockSupabaseClient() {
    const memoryStore = new Map();

    return {
        _store: memoryStore,
        from(tableName) {
            return new MockTableQueryBuilder(tableName, memoryStore);
        },
        auth: {
            async getSession() {
                return { data: { session: null }, error: null };
            },
            async getUser() {
                return { data: { user: null }, error: null };
            },
            async signInWithPassword({ email }) {
                return {
                    data: { user: { id: 'mock_uid_1', email } },
                    error: null
                };
            },
            async signOut() {
                return { error: null };
            },
            onAuthStateChange(cb) {
                return { data: { subscription: { unsubscribe: () => {} } } };
            },
            mfa: {
                async getAuthenticatorAssuranceLevel() {
                    return { data: { currentLevel: 'aal1', nextLevel: 'aal1' }, error: null };
                },
                async listFactors() {
                    return { data: { totp: [], all: [] }, error: null };
                },
                async enroll() {
                    return {
                        data: {
                            id: 'mock_factor_1',
                            totp: { secret: 'JBSWY3DPEHPK3PXP', qr_code: 'mock_qr', uri: 'otpauth://...' }
                        },
                        error: null
                    };
                },
                async challenge({ factorId }) {
                    return { data: { id: `mock_chal_${factorId}` }, error: null };
                },
                async verify({ factorId, code }) {
                    if (code === '000000' || code?.length !== 6) {
                        return { data: null, error: { message: 'Código TOTP incorrecto.' } };
                    }
                    return { data: { user: { id: 'mock_uid_1' } }, error: null };
                }
            }
        }
    };
}

export default createMockSupabaseClient;
