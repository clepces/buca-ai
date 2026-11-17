import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ForexManager } from '../src/core/services/forex/forex-manager.js';
import { BaseForexAdapter } from '../src/core/services/forex/adapters/base-forex-adapter.js';
import { FallbackAdapter } from '../src/core/services/forex/adapters/fallback-adapter.js';
import { DolarApiAdapter } from '../src/core/services/forex/adapters/dolar-api-adapter.js';
import { DolarVzlaService } from '../src/core/services/DolarVzlaService.js';
import { safeRound2, safeRound4 } from '../src/core/services/forex/forex-types.js';

describe('Forex Multi-Adapter Architecture Suite', () => {
    it('Utilidades numéricas deben redondear de forma determinista', () => {
        assert.equal(safeRound2(914.0218), 914.02);
        assert.equal(safeRound2('1050.559'), 1050.56);
        assert.equal(safeRound2(NaN), 0);
        assert.equal(safeRound4(0.123456), 0.1235);
    });

    it('FallbackAdapter debe suministrar cotizaciones válidas ante contingencias de red', async () => {
        const fallback = new FallbackAdapter(99);
        assert.equal(fallback.isAvailable(), true);

        const bcv = await fallback.fetchBCV();
        assert.ok(bcv.current.usd > 0);
        assert.ok(bcv.current.eur > 0);
        assert.equal(typeof bcv.current.date, 'string');

        const parallel = await fallback.fetchParallel();
        assert.ok(parallel.current.average > 0);
        assert.ok(parallel.current.buy > 0);

        const interv = await fallback.fetchInterventions();
        assert.ok(interv.list.length > 0);
    });

    it('BaseForexAdapter debe requerir implementación en subclases', async () => {
        const base = new BaseForexAdapter('dummy');
        await assert.rejects(async () => base.fetchBCV(), /no implementado/);
        await assert.rejects(async () => base.fetchParallel(), /no implementado/);
    });

    it('ForexManager debe permitir registrar nuevos adaptadores de divisas extensiblemente', () => {
        class CustomBankAdapter extends BaseForexAdapter {
            constructor() {
                super('custom-bank', 5);
            }
            async fetchBCV() {
                return { current: { usd: 950.00, eur: 1045.00, date: '2026-11-16' } };
            }
        }

        const custom = new CustomBankAdapter();
        ForexManager.registerAdapter(custom, 5);

        const found = ForexManager._adapters.find(a => a.name === 'custom-bank');
        assert.ok(found);
        assert.equal(found.priority, 5);
    });

    it('ForexManager y DolarVzlaService fachada deben resolver cotizaciones consolidadas', async () => {
        const allData = await DolarVzlaService.loadAllFinancialData();
        assert.ok(allData);
        assert.ok(allData.bcv);
        assert.ok(allData.bcv.current.usd > 0);
        assert.ok(allData.usdt);
        assert.ok(allData.usdt.current.average > 0);
        assert.ok(Array.isArray(allData.history));
    });
});
