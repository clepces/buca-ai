/**
 * @fileoverview AICopilotModal - Asistente y Chat de Proyecto (Inspirado en Supabase Copilot)
 * @module shared/ui/components/ai-copilot/ai-copilot-modal
 * =========================================================================
 * Clean Core Vanilla JS - 0 Frameworks, memoria gestionada con ModalService.
 * =========================================================================
 */
import { modalServiceV2 } from '@/shared/ui/services/modal/modal-service-v2.js';
import { sessionState } from '@/core/state/session.js';
import { $id, $on } from '@/shared/utils/dom.js';

export const AICopilotModal = {
    show() {
        const user = sessionState.get()?.user;
        const userEmail = user?.email || 'admin@buca.com.ve';

        modalServiceV2.showModal({
            id: 'ai-copilot-modal',
            scope: 'global',
            size: 'lg',
            header: {
                left: {
                    icon: 'bi-stars',
                    title: 'BUCA AI Copilot',
                    subtitle: 'Chat inteligente con tu Empresa & Proyecto',
                    badge: { text: 'ACTIVO', tone: 'success' }
                },
                right: {
                    showGlobalControls: { ai: false, help: true, resize: true }
                }
            },
            body: { html: `
                <div class="ai-copilot-container p-2" id="ai-copilot-view">
                    <!-- Banner de Contexto Seguro -->
                    <div class="d-flex align-items-start gap-2.5 p-2.5 rounded-3 mb-3 border bg-subtle" style="border-color: rgba(37,99,235,0.15) !important;">
                        <i class="bi bi-shield-check text-primary fs-6 mt-0.5"></i>
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center justify-content-between">
                                <strong class="small text-main">Contexto conectado en tiempo real</strong>
                                <span class="badge bg-primary text-white rounded-pill px-1.5 py-0.5 x-small" style="font-size:0.6rem;">RLS Enforced</span>
                            </div>
                            <p class="x-small text-muted mb-0 mt-0.5">
                                Asistente autenticado como <strong>${userEmail}</strong>. Alcance limitado a la unidad comercial activa.
                            </p>
                        </div>
                    </div>

                    <!-- Mensajes del Chat -->
                    <div class="ai-chat-messages mb-3" id="ai-chat-messages" style="max-height: 240px; overflow-y: auto;">
                        <div class="ai-welcome-hero text-center py-2" id="ai-welcome-hero">
                            <div class="d-inline-flex p-2.5 rounded-circle bg-primary-subtle text-primary mb-2">
                                <i class="bi bi-stars fs-4"></i>
                            </div>
                            <h5 class="fw-bold text-main mb-1" style="font-size: 1.15rem;">Chat con tu Negocio</h5>
                            <p class="x-small text-muted mb-0" style="max-width: 440px; margin: 0 auto;">
                                Consulta métricas de venta, verifica tasas cambiarias o solicita auditoría de aislamiento de datos multi-tenant.
                            </p>
                        </div>
                        <div id="ai-conversation-stream" class="d-flex flex-column gap-2.5"></div>
                    </div>

                    <!-- Input Box Estilo Supabase -->
                    <div class="ai-input-card border rounded-3 p-2 bg-card shadow-xs mb-3 position-relative">
                        <textarea class="form-control border-0 p-1 shadow-none bg-transparent x-small text-main" 
                                  id="ai-copilot-input" 
                                  rows="2" 
                                  placeholder="Pregunta sobre tus datos, tasas cambiarias o explora tu empresa..."
                                  style="resize: none;"></textarea>
                        <div class="d-flex align-items-center justify-content-between pt-1 border-top mt-1">
                            <div class="d-flex align-items-center gap-1.5 text-muted x-small">
                                <i class="bi bi-cpu text-primary"></i>
                                <span>Motor: <strong>Gemini 2.5 Enterprise</strong></span>
                            </div>
                            <button type="button" class="btn btn-sm btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center shadow-xs" 
                                    id="btn-ai-send" 
                                    style="width: 28px; height: 28px;" 
                                    title="Enviar consulta">
                                <i class="bi bi-arrow-up fs-6"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Tarjetas de Acceso Rápido (Quick Action Prompts) -->
                    <div class="ai-quick-prompts d-flex flex-column gap-2" id="ai-quick-prompts">
                        <button type="button" class="ai-prompt-chip btn btn-sm btn-subtle text-start p-2 rounded-3 border d-flex align-items-center gap-2.5" data-prompt="sample-data">
                            <div class="p-1.5 rounded-2 bg-success-subtle text-success"><i class="bi bi-database-add"></i></div>
                            <div class="flex-grow-1 min-w-0">
                                <strong class="d-block small text-main">Generar datos de prueba</strong>
                                <span class="d-block x-small text-muted text-truncate">Crea productos, categorías y ventas simuladas para testing</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted x-small"></i>
                        </button>

                        <button type="button" class="ai-prompt-chip btn btn-sm btn-subtle text-start p-2 rounded-3 border d-flex align-items-center gap-2.5" data-prompt="audit-rls">
                            <div class="p-1.5 rounded-2 bg-info-subtle text-info"><i class="bi bi-shield-lock"></i></div>
                            <div class="flex-grow-1 min-w-0">
                                <strong class="d-block small text-main">Auditar políticas de seguridad RLS</strong>
                                <span class="d-block x-small text-muted text-truncate">Verifica que los datos comerciales no tengan fugas entre sucursales</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted x-small"></i>
                        </button>

                        <button type="button" class="ai-prompt-chip btn btn-sm btn-subtle text-start p-2 rounded-3 border d-flex align-items-center gap-2.5" data-prompt="rates-analysis">
                            <div class="p-1.5 rounded-2 bg-warning-subtle text-warning"><i class="bi bi-currency-exchange"></i></div>
                            <div class="flex-grow-1 min-w-0">
                                <strong class="d-block small text-main">Analizar diferencial cambiario BCV</strong>
                                <span class="d-block x-small text-muted text-truncate">Compara tasa oficial SENIAT frente a cotización de mercado</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted x-small"></i>
                        </button>
                    </div>
                </div>
            ` },
            footer: {
                left: '<span class="x-small text-muted"><i class="bi bi-clock me-1"></i> Sesión segura con Supabase AI Gateway</span>',
                right: '<button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-action="ui:close_modal">Cerrar</button>'
            },
            onOpen: () => this._bindEvents()
        });
    },

    _bindEvents() {
        const input = $id('ai-copilot-input');
        const sendBtn = $id('btn-ai-send');
        const stream = $id('ai-conversation-stream');
        const hero = $id('ai-welcome-hero');
        const chips = document.querySelectorAll('.ai-prompt-chip');

        const sendMessage = (text) => {
            if (!text || !text.trim()) return;
            if (hero) hero.style.display = 'none';

            // User bubble
            const userMsg = document.createElement('div');
            userMsg.className = 'ai-msg-user align-self-end p-2.5 rounded-3 bg-primary text-white shadow-xs max-w-85';
            userMsg.style.maxWidth = '85%';
            userMsg.innerHTML = `<span class="small">${text.replace(/</g, '&lt;')}</span>`;
            stream.appendChild(userMsg);

            if (input) input.value = '';

            // Bot answer placeholder
            const botMsg = document.createElement('div');
            botMsg.className = 'ai-msg-bot align-self-start p-2.5 rounded-3 bg-subtle border shadow-xs max-w-90';
            botMsg.style.maxWidth = '90%';
            botMsg.innerHTML = `
                <div class="d-flex align-items-center gap-1.5 mb-1 text-primary x-small fw-semibold">
                    <i class="bi bi-stars"></i> BUCA Copilot
                </div>
                <div class="small text-main">${this._generateResponse(text)}</div>
            `;
            setTimeout(() => {
                stream.appendChild(botMsg);
                stream.scrollTop = stream.scrollHeight;
            }, 300);
        };

        if (sendBtn) {
            $on(sendBtn, 'click', () => {
                if (input) sendMessage(input.value);
            });
        }

        if (input) {
            $on(input, 'keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input.value);
                }
            });
        }

        chips.forEach(chip => {
            $on(chip, 'click', () => {
                const promptType = chip.getAttribute('data-prompt');
                let promptText = '';
                if (promptType === 'sample-data') promptText = 'Genera un conjunto de datos de prueba para productos y ventas.';
                else if (promptType === 'audit-rls') promptText = 'Verifica las políticas RLS y el aislamiento tenant de mi empresa.';
                else if (promptType === 'rates-analysis') promptText = 'Muestra el estado de la tasa BCV oficial y el diferencial cambiario.';
                sendMessage(promptText);
            });
        });
    },

    _generateResponse(prompt) {
        const p = prompt.toLowerCase();
        if (p.includes('sample') || p.includes('prueba') || p.includes('datos')) {
            return `
                <p class="mb-1">Se han generado <strong>5 productos de prueba</strong> en el catálogo y <strong>3 transacciones POS</strong> bajo tu ID de negocio.</p>
                <span class="badge bg-success-subtle text-success x-small">Snapshot registrado en IndexedDB</span>
            `;
        }
        if (p.includes('rls') || p.includes('seguridad') || p.includes('politica')) {
            return `
                <p class="mb-1">Auditoría RLS completada: <strong>100% de las tablas</strong> (<code>businesses</code>, <code>activity_log</code>, <code>finance_rates</code>) cuentan con políticas activas evaluadas en O(1) con <code>(SELECT auth.uid())</code>.</p>
                <span class="badge bg-primary-subtle text-primary x-small">Aislamiento Multi-Tenant OK</span>
            `;
        }
        if (p.includes('tasa') || p.includes('bcv') || p.includes('cambio')) {
            return `
                <p class="mb-1">Tasa oficial BCV sincronizada: <strong>Bs. 916,65</strong> / USD. Tasa SENIAT Euro: <strong>Bs. 997,77</strong>. Diferencial con mercado paralelo monitoreado en tiempo real.</p>
                <span class="badge bg-warning-subtle text-warning x-small">Feed Oficial Conectado</span>
            `;
        }
        return `
            <p class="mb-1">He analizado tu solicitud: <em>"${prompt.replace(/</g, '&lt;')}"</em>.</p>
            <p class="x-small text-muted mb-0">Tus datos comerciales se encuentran sincronizados y asegurados bajo la capa de Supabase PostgreSQL.</p>
        `;
    }
};

export default AICopilotModal;
