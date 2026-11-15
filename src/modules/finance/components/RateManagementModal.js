/**
 * @fileoverview RateManagementModal Component - Template de Gestión de Divisas & Tasas (Módulo Finanzas)
 * @module modules/finance/components/RateManagementModal
 */

import { renderRateTabsNav } from './rate-modal/rate-tabs-nav.js';
import { renderRateOverviewTab } from './rate-modal/rate-overview-tab.js';
import { renderRateCalculatorTab } from './rate-modal/rate-calculator-tab.js';
import { renderRateInterventionsTab, renderRateHistoryTab } from './rate-modal/rate-tables-tab.js';
import { renderRateConfigTab } from './rate-modal/rate-config-tab.js';

export const rateManagementTemplate = ({ 
    currentRate = 889.58, 
    lastUpdate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
    bcvData = null, 
    usdtData = null, 
    interventionsData = null, 
    history = [],
    historyPage = 1,
    historyPerPage = 6,
    interventionsPage = 1,
    interventionsPerPage = 5,
    apiConfig = null
} = {}) => {
    const usdVal = bcvData?.current?.usd || currentRate;
    const eurVal = bcvData?.current?.eur || (usdVal * 1.15);
    const rawUsdVar = bcvData?.changePercentage?.usd ?? 0.61;
    const rawEurVar = bcvData?.changePercentage?.eur ?? 0.17;
    const usdVar = Number(rawUsdVar || 0).toFixed(2);
    const eurVar = Number(rawEurVar || 0).toFixed(2);
    const usdVarNum = Number(usdVar);
    const eurVarNum = Number(eurVar);
    const bcvDate = bcvData?.current?.date ? String(bcvData.current.date).split('T')[0] : new Date().toISOString().split('T')[0];

    const usdtBuy = usdtData?.current?.buy || (usdVal * 1.03);
    const usdtSell = usdtData?.current?.sell || (usdVal * 1.05);
    const usdtAvg = usdtData?.current?.average || ((usdtBuy + usdtSell) / 2);

    const defaultHistory = (history && history.length > 0) ? history : [
        { date: bcvDate, usd: usdVal, eur: eurVal, variation: 0.04 },
        { date: '2026-10-30', usd: (usdVal - 0.32), eur: (eurVal + 1.55), variation: 0.12 },
        { date: '2026-10-29', usd: (usdVal - 1.10), eur: (eurVal - 0.25), variation: -0.08 },
        { date: '2026-10-28', usd: (usdVal - 1.45), eur: (eurVal + 0.85), variation: 0.15 },
        { date: '2026-10-27', usd: (usdVal - 2.80), eur: (eurVal - 0.85), variation: 0.05 }
    ];

    const processedHistory = defaultHistory.map((item, idx, arr) => {
        let varVal = item.variation;
        if (varVal === undefined || varVal === null || isNaN(varVal)) {
            if (idx < arr.length - 1) {
                const nextItem = arr[idx + 1];
                const prevUsd = Number(nextItem.usd || nextItem.rate || 0);
                const currUsd = Number(item.usd || item.rate || 0);
                varVal = prevUsd > 0 ? Number(((currUsd - prevUsd) / prevUsd * 100).toFixed(2)) : 0;
            } else {
                varVal = 0;
            }
        }
        const formattedDate = item.date ? String(item.date).split('T')[0] : '';
        return { ...item, date: formattedDate, calculatedVariation: Number(Number(varVal || 0).toFixed(2)) };
    });

    const historyTotalPages = Math.ceil(processedHistory.length / historyPerPage) || 1;
    const historySafePage = Math.min(Math.max(1, historyPage), historyTotalPages);
    const historyStartIndex = (historySafePage - 1) * historyPerPage;
    const paginatedHistory = processedHistory.slice(historyStartIndex, historyStartIndex + historyPerPage);

    const lastInterventionRaw = interventionsData?.current || { id: 'INT-2026-42', date: bcvDate, rate: usdVal, usdAmount: '$ 75,000,000 USD' };
    const lastIntervention = {
        ...lastInterventionRaw,
        date: lastInterventionRaw.date ? String(lastInterventionRaw.date).split('T')[0] : bcvDate
    };

    const rawInterventionsList = interventionsData?.list || [
        { id: 'INT-2026-42', date: bcvDate, rate: usdVal, usdAmount: '$ 75M USD' },
        { id: 'INT-2026-41', date: '2026-10-27', rate: (usdVal - 4.38), usdAmount: '$ 60M USD' },
        { id: 'INT-2026-40', date: '2026-10-20', rate: (usdVal - 9.43), usdAmount: '$ 80M USD' },
        { id: 'INT-2026-39', date: '2026-10-13', rate: (usdVal - 14.18), usdAmount: '$ 50M USD' },
        { id: 'INT-2026-38', date: '2026-10-06', rate: (usdVal - 19.48), usdAmount: '$ 65M USD' }
    ];

    const interventionList = rawInterventionsList.map(item => ({
        ...item,
        date: item.date ? String(item.date).split('T')[0] : ''
    }));

    const interventionsTotalPages = Math.ceil(interventionList.length / interventionsPerPage) || 1;
    const interventionsSafePage = Math.min(Math.max(1, interventionsPage), interventionsTotalPages);
    const interventionsStartIndex = (interventionsSafePage - 1) * interventionsPerPage;
    const paginatedInterventions = interventionList.slice(interventionsStartIndex, interventionsStartIndex + interventionsPerPage);

    const formatMoney = (val) => Number(val || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return `
        <div class="rate-update-container">
            ${renderRateTabsNav()}
            ${renderRateOverviewTab({ usdVal, eurVal, usdVar, eurVar, usdVarNum, eurVarNum, bcvDate, bcvData, usdtBuy, usdtSell, usdtAvg, formatMoney, lastUpdate })}
            ${renderRateCalculatorTab({ usdVal, eurVal, usdtAvg, formatMoney })}
            ${renderRateInterventionsTab({ lastIntervention, paginatedInterventions, interventionsSafePage, interventionsTotalPages, usdVal, formatMoney })}
            ${renderRateHistoryTab({ paginatedHistory, historySafePage, historyTotalPages, usdVal, formatMoney })}
            ${renderRateConfigTab(apiConfig)}
        </div>
    `;
};

export default rateManagementTemplate;
