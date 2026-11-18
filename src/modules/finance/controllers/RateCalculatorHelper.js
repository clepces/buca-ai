/**
 * RateCalculatorHelper - Asistente de Conversión y Presets Multidivisa
 * =========================================================================
 * Cálculos en caliente en el modal de finanzas: VES, USD, EUR, USDT.
 * =========================================================================
 */
import { $id, $$, $on, $text, $attr } from '@/shared/utils/dom.js';

export const RateCalculatorHelper = {
    bind(financialData, currentRate) {
        const amountInput = $id('calc-amount-input');
        const currencySelect = $id('calc-currency-select');
        const presets = $$('.btn-calc-preset');

        const calculate = () => {
            if (!amountInput || !currencySelect) return;
            const amount = parseFloat(amountInput.value) || 0;
            const currency = currencySelect.value;

            const bcvUsd = financialData?.bcv?.current?.usd || currentRate || 0;
            const bcvEur = financialData?.bcv?.current?.eur || 0;
            const usdtAvg = financialData?.usdt?.current?.average || 0;

            let inVes = 0;
            if (currency === 'VES') inVes = amount;
            else if (currency === 'USD') inVes = amount * bcvUsd;
            else if (currency === 'EUR') inVes = amount * bcvEur;
            else if (currency === 'USDT') inVes = amount * usdtAvg;

            const equivUsd = inVes / bcvUsd;
            const equivEur = inVes / bcvEur;
            const equivUsdt = inVes / usdtAvg;

            const format = (v) => Number(v || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            $text('res-ves', `Bs. ${format(inVes)}`);
            $text('res-usd', `$ ${format(equivUsd)}`);
            $text('res-eur', `€ ${format(equivEur)}`);
            $text('res-usdt', `₮ ${format(equivUsdt)}`);
        };

        if (amountInput) $on(amountInput, 'input', calculate);
        if (currencySelect) $on(currencySelect, 'change', calculate);

        presets.forEach(btn => {
            $on(btn, 'click', () => {
                const val = $attr(btn, 'data-val');
                if (amountInput) {
                    amountInput.value = val;
                    calculate();
                }
            });
        });
    }
};

export default RateCalculatorHelper;
