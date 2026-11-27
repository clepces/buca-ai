/**
 * @fileoverview ThemeManager - Gestiona los temas visuales (Light/Dark) y persistencia
 * @module core/services/ThemeManager
 */

import { storage } from '@/core/storage/StorageAdapter.js';
import { uiState } from '@/core/state/ui.js';
import { eventBus } from '@/core/eventBus/index.js';
import { $id, $attr, $$ } from '@/shared/utils/dom.js';

export const ThemeManager = {
    _unlisten: null,

    async init() {
        const saved = await storage.get('theme') || 'light';
        $attr(document.documentElement, 'data-theme', saved);
        this.updateThemeUI(saved);
        if (typeof this._unlisten === 'function') this._unlisten();
        this._unlisten = eventBus.on('ui:set_theme', (p) => {
            if (p?.theme) this.setTheme(p.theme);
        });
    },

    destroy() {
        if (typeof this._unlisten === 'function') {
            this._unlisten();
            this._unlisten = null;
        }
    },

    async toggle() {
        const current = $attr(document.documentElement, 'data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        return this.setTheme(next);
    },

    async setTheme(targetTheme) {
        if (!['light', 'dark'].includes(targetTheme)) return;
        $attr(document.documentElement, 'data-theme', targetTheme);
        await storage.set('theme', targetTheme);
        uiState.update({ theme: targetTheme });
        this.updateThemeUI(targetTheme);
        return targetTheme;
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
