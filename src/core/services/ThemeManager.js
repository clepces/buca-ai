/**
 * @fileoverview ThemeManager - Gestiona los temas visuales (Light/Dark) y persistencia
 * @module core/services/ThemeManager
 */

import { storage } from '@/core/storage/StorageAdapter.js';
import { uiState } from '@/core/state/ui.js';

export const ThemeManager = {
    async init() {
        const saved = await storage.get('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        this.updateThemeUI(saved);
    },

    async toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', next);
        await storage.set('theme', next);
        uiState.update({ theme: next });
        this.updateThemeUI(next);
        return next;
    },

    updateThemeUI(theme) {
        const isDark = theme === 'dark';
        const logoImg = document.getElementById('app-logo');
        if (logoImg) logoImg.src = `/assets/icons/logo-${isDark ? 'light' : 'dark'}.svg`;

        document.querySelectorAll('.theme-icon').forEach(icon => {
            icon.classList.toggle('bi-sun-fill', isDark);
            icon.classList.toggle('bi-moon-stars-fill', !isDark);
        });
    }
};
