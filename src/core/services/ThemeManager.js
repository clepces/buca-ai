/**
 * @fileoverview ThemeManager - Gestiona los temas visuales (Light/Dark) y persistencia
 * @module core/services/ThemeManager
 */

import { storage } from '@/core/storage/StorageAdapter.js';
import { uiState } from '@/core/state/ui.js';
import { $id, $attr, $$ } from '@/shared/utils/dom.js';

export const ThemeManager = {
    async init() {
        const saved = await storage.get('theme') || 'light';
        $attr(document.documentElement, 'data-theme', saved);
        this.updateThemeUI(saved);
    },

    async toggle() {
        const current = $attr(document.documentElement, 'data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';

        $attr(document.documentElement, 'data-theme', next);
        await storage.set('theme', next);
        uiState.update({ theme: next });
        this.updateThemeUI(next);
        return next;
    },

    updateThemeUI(theme) {
        const isDark = theme === 'dark';
        const logoImg = $id('app-logo');
        if (logoImg) logoImg.src = `/assets/icons/logo-${isDark ? 'light' : 'dark'}.svg`;

        $$('.theme-icon').forEach(icon => {
            icon.classList.toggle('bi-sun-fill', isDark);
            icon.classList.toggle('bi-moon-stars-fill', !isDark);
        });
    }
};
