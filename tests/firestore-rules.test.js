import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFile } from 'node:fs/promises';
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'buca-scdbs-test';
let testEnv;

describe('B.U.C.A. AI - Firestore Security Rules Tests', () => {
    before(async () => {
        const rulesContent = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
        testEnv = await initializeTestEnvironment({
            projectId: PROJECT_ID,
            firestore: {
                rules: rulesContent,
                host: '127.0.0.1',
                port: 8080
            }
        });
    });

    after(async () => {
        if (testEnv) {
            await testEnv.cleanup();
        }
    });

    beforeEach(async () => {
        if (testEnv) {
            await testEnv.clearFirestore();
        }
    });

    describe('1. Control de Acceso no Autenticado', () => {
        it('Debe rechazar lectura no autenticada de negocios', async () => {
            const unauthedCtx = testEnv.unauthenticatedContext();
            const db = unauthedCtx.firestore();
            const docRef = doc(db, 'businesses', 'biz_123');
            await assertFails(getDoc(docRef));
        });

        it('Debe rechazar escritura no autenticada de usuarios', async () => {
            const unauthedCtx = testEnv.unauthenticatedContext();
            const db = unauthedCtx.firestore();
            const docRef = doc(db, 'users', 'user_123');
            await assertFails(setDoc(docRef, { name: 'Intruder' }));
        });
    });

    describe('2. Aislamiento Multi-Tenant (Negocios)', () => {
        it('Usuario A puede crear y leer su propio negocio', async () => {
            const userA = testEnv.authenticatedContext('user_A');
            const dbA = userA.firestore();
            const bizRefA = doc(dbA, 'businesses', 'biz_A');

            await assertSucceeds(setDoc(bizRefA, {
                owner_id: 'user_A',
                name: 'Negocio A',
                status: 'active'
            }));

            await assertSucceeds(getDoc(bizRefA));
        });

        it('Usuario B NO puede leer ni modificar el negocio del Usuario A', async () => {
            // Setup como admin
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'businesses', 'biz_A'), {
                    owner_id: 'user_A',
                    name: 'Negocio A',
                    status: 'active'
                });
            });

            const userB = testEnv.authenticatedContext('user_B');
            const dbB = userB.firestore();
            const bizRefA = doc(dbB, 'businesses', 'biz_A');

            // Intento de lectura prohibido
            await assertFails(getDoc(bizRefA));

            // Intento de actualización prohibido
            await assertFails(updateDoc(bizRefA, { name: 'Negocio Hackeado' }));
        });

        it('Usuario B NO puede acceder a subcolecciones del negocio de Usuario A', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'businesses', 'biz_A'), {
                    owner_id: 'user_A',
                    name: 'Negocio A'
                });
                await setDoc(doc(adminDb, 'businesses', 'biz_A', 'sales', 'sale_001'), {
                    amount: 500,
                    client: 'Cliente VIP'
                });
            });

            const userB = testEnv.authenticatedContext('user_B');
            const dbB = userB.firestore();
            const saleRef = doc(dbB, 'businesses', 'biz_A', 'sales', 'sale_001');

            await assertFails(getDoc(saleRef));
            await assertFails(setDoc(saleRef, { amount: 0 }));
        });
    });

    describe('3. Protección contra Elevación de Privilegios', () => {
        it('Usuario no puede auto-asignarse platform_role "super_admin" al crear perfil', async () => {
            const userA = testEnv.authenticatedContext('user_A');
            const dbA = userA.firestore();
            const userRef = doc(dbA, 'users', 'user_A');

            await assertFails(setDoc(userRef, {
                email: 'user_a@empresa.com',
                platform_role: 'super_admin'
            }));
        });

        it('Usuario no puede modificar campos protegidos como platform_role o subscription_master', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', 'user_A'), {
                    email: 'user_a@empresa.com',
                    platform_role: 'user',
                    profile: { firstName: 'Carlos' }
                });
            });

            const userA = testEnv.authenticatedContext('user_A');
            const dbA = userA.firestore();
            const userRef = doc(dbA, 'users', 'user_A');

            // Intentar elevarse rol
            await assertFails(updateDoc(userRef, { platform_role: 'super_admin' }));
            // Actualizar datos de perfil permitidos debe ser exitoso
            await assertSucceeds(updateDoc(userRef, { 'profile.firstName': 'Carlos Alberto' }));
        });

        it('Usuario A no puede leer el perfil del Usuario B', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'users', 'user_B'), {
                    email: 'user_b@empresa.com',
                    security: { totp_secret: 'SECRET123' }
                });
            });

            const userA = testEnv.authenticatedContext('user_A');
            const dbA = userA.firestore();
            const userBRef = doc(dbA, 'users', 'user_B');

            await assertFails(getDoc(userBRef));
        });
    });

    describe('4. Protección de Configuración Global y Tasas', () => {
        it('Usuario regular NO puede escribir en global_config', async () => {
            const userA = testEnv.authenticatedContext('user_A');
            const dbA = userA.firestore();
            const configRef = doc(dbA, 'global_config', 'rates');

            await assertFails(setDoc(configRef, { bcv_usd: 100 }));
        });

        it('Usuario no owner NO puede escribir en finance_rates de otro negocio', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'businesses', 'biz_A'), {
                    owner_id: 'user_A'
                });
            });

            const userB = testEnv.authenticatedContext('user_B');
            const dbB = userB.firestore();
            const ratesRef = doc(dbB, 'finance_rates', 'biz_A');

            await assertFails(setDoc(ratesRef, { rate: 99.9, currency: 'USD' }));
        });

        it('Owner de biz_A SÍ puede actualizar sus tasas en finance_rates/biz_A', async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const adminDb = context.firestore();
                await setDoc(doc(adminDb, 'businesses', 'biz_A'), {
                    owner_id: 'user_A'
                });
            });

            const userA = testEnv.authenticatedContext('user_A');
            const dbA = userA.firestore();
            const ratesRef = doc(dbA, 'finance_rates', 'biz_A');

            await assertSucceeds(setDoc(ratesRef, { rate: 65.5, currency: 'USD' }));
        });
    });

    describe('5. Auditoría y Registro de Actividad', () => {
        it('Usuario no puede falsificar el user_id en activity_log', async () => {
            const userA = testEnv.authenticatedContext('user_A');
            const dbA = userA.firestore();
            const logRef = doc(dbA, 'activity_log', 'log_001');

            // Intenta loguear con UID ajeno
            await assertFails(setDoc(logRef, {
                user_id: 'user_B',
                action: 'DELETE_DATABASE'
            }));

            // Loguear con su propio UID sí es válido
            await assertSucceeds(setDoc(logRef, {
                user_id: 'user_A',
                action: 'LOGIN'
            }));
        });
    });
});
