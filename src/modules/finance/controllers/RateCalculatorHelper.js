/**
 * RateCalculatorHelper - Asistente de Conversión y Presets Multidivisa
 * =========================================================================
 * Cálculos en caliente en el modal de finanzas: VES, USD, EUR, USDT.
 * =========================================================================
 */

export const RateCalculatorHelper = {
    bind(financialData, currentRate) {
        const amountInput = document.getElementById('calc-amount-input');
        const currencySelect = document.getElementById('calc-currency-select');
        const presets = document.querySelectorAll('.btn-calc-preset');

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

            const resVes = document.getElementById('res-ves');
            const resUsd = document.getElementById('res-usd');
            const resEur = document.getElementById('res-eur');
            const resUsdt = document.getElementById('res-usdt');

            if (resVes) resVes.textContent = `Bs. ${format(inVes)}`;
            if (resUsd) resUsd.textContent = `$ ${format(equivUsd)}`;
            if (resEur) resEur.textContent = `€ ${format(equivEur)}`;
            if (resUsdt) resUsdt.textContent = `₮ ${format(equivUsdt)}`;
        };

        if (amountInput) amountInput.oninput = calculate;
        if (currencySelect) currencySelect.onchange = calculate;

        presets.forEach(btn => {
            btn.onclick = () => {
                const val = btn.getAttribute('data-val');
                if (amountInput) {
                    amountInput.value = val;
                    calculate();
                }
            };
        });
    }
};

export default RateCalculatorHelper;
