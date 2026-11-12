/**
 * SupabaseMock - Cliente en Memoria para Aislamiento Absoluto de Pruebas
 * =========================================================================
 * Evita cualquier llamada a la API remota de Supabase durante npm test.
 * Implementa almacenamiento en memoria, query builders y validación RLS mock.
 * =========================================================================
 */

export class MockTableQueryBuilder {
    constructor(tableName, store, auth) {
        this.tableName = tableName;
        this.store = store;
        this.auth = auth;
        if (!this.store.has(tableName)) {
            this.store.set(tableName, []);
        }
        this._filters = [];
        this._selectCols = '*';
        this._limitCount = null;
        this._pendingAction = 'select';
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

    order() { return this; }
    limit(n) { this._limitCount = n; return this; }

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
        const sessionUser = this.auth?._session?.user || null;

        // RLS Mock: profiles update - bloquear cambio de platform_role si no es super_admin
        if (this.tableName === 'profiles' && this._pendingAction === 'update') {
            if (this._actionPayload?.platform_role && sessionUser?.platform_role !== 'super_admin') {
                return resolve({ data: null, error: { message: 'No está autorizado para modificar platform_role.' } });
            }
        }

        // RLS Mock: profiles insert - bloquear autoasignación de platform_role si no es super_admin
        if (this.tableName === 'profiles' && this._pendingAction === 'insert') {
            const hasUnauthorizedRole = this._actionPayload.some(r => r.platform_role && r.platform_role !== 'user');
            if (hasUnauthorizedRole && sessionUser?.platform_role !== 'super_admin') {
                return resolve({ data: null, error: { message: 'Violación RLS: platform_role en inserción debe ser user.' } });
            }
        }

        // RLS Mock: activity_log insert - prohibir anónimos
        if (this.tableName === 'activity_log' && this._pendingAction === 'insert') {
            const hasAnonymous = this._actionPayload.some(r => !r.user_id || !sessionUser);
            if (hasAnonymous) {
                return resolve({ data: null, error: { message: 'Violación RLS: activity_log exige user_id autenticado.' } });
            }
        }

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

        // SELECT con RLS Mock
        let matching = this._applyFilters(tableRows);

        if (this.tableName === 'profiles') {
            matching = sessionUser ? matching.filter(r => r.id === sessionUser.id) : [];
        } else if (this.tableName === 'businesses') {
            matching = sessionUser ? matching.filter(r => r.owner_id === sessionUser.id) : [];
        } else if (this.tableName === 'app_storage') {
            matching = sessionUser ? matching.filter(r => r.owner_id === sessionUser.id) : [];
        }

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
    const authState = {
        _session: { user: { id: 'mock_uid_1', email: 'tester@buca.com', platform_role: 'super_admin' } },
        setSession(s) { this._session = s; },
        async getSession() {
            return { data: { session: this._session }, error: null };
        },
        async getUser() {
            return { data: { user: this._session?.user || null }, error: null };
        },
        async signInWithPassword({ email }) {
            this._session = { user: { id: 'mock_uid_1', email, platform_role: 'super_admin' } };
            return { data: { user: this._session.user }, error: null };
        },
        async signOut() {
            this._session = null;
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
    };

    return {
        _store: memoryStore,
        auth: authState,
        from(tableName) {
            return new MockTableQueryBuilder(tableName, memoryStore, authState);
        }
    };
}

export default createMockSupabaseClient;
