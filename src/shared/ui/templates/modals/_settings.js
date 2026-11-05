/**
 * Settings Modal Template - Configuración de Rendimiento y D3
 * =========================================================================
 */
import { PerformanceD3Dashboard } from '@/modules/workspace/components/PerformanceD3Dashboard.js';

export const settingsTemplate = ({ currentTheme, currentTier }) => `
    <div class="settings-modal-wrapper animate__animated animate__fadeIn">
        <div class="modal-setting-card">
            <div class="card-title-group">
                <i class="bi bi-palette-fill"></i>
                <h5>Entorno Visual y Tema</h5>
            </div>
            <div class="setting-item-row">
                <div>
                    <div class="setting-label">Tema de Interfaz</div>
                    <div class="setting-desc">Alterna entre paleta clara u oscura según la iluminación</div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="badge ${currentTheme === 'dark' ? 'bg-secondary' : 'bg-primary-subtle text-primary'} px-2 py-1" id="settings-theme-badge">
                        ${currentTheme === 'dark' ? 'Oscuro' : 'Claro'}
                    </span>
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" data-action="ui:toggle_theme">
                        <i class="bi bi-circle-half me-1"></i> Cambiar
                    </button>
                </div>
            </div>
            <div class="setting-item-row">
                <div>
                    <div class="setting-label">Efectos de Cristal (Glassmorphism)</div>
                    <div class="setting-desc">Desenfoque de fondo dinámico y sombreado neural</div>
                </div>
                <label class="glass-switch">
                    <input type="checkbox" id="settings-glass-toggle" checked onchange="document.body.classList.toggle('disable-glass', !this.checked)">
                    <span class="slider round"></span>
                </label>
            </div>
        </div>

        ${PerformanceD3Dashboard.renderHTML(currentTier)}
    </div>
`;
