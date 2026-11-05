/**
 * BannerComponent - Branded Enterprise Banner with Fan-out (Abanico) Interactive Cards
 * =========================================================================
 * Refactorización Phase 5: Robustez de eventos y delegación.
 * =========================================================================
 */
export const BannerComponent = {
    render(displayName = 'Usuario') {
        return `
            <div class="ws-branded-banner p-4 p-md-5 rounded-4 mb-4 position-relative text-white shadow-lg overflow-visible" id="banner-container">
                <div class="banner-glow-effect"></div>
                
                <div class="row align-items-center g-5 position-relative z-1">
                    <!-- Left Column: Brand & Greeting -->
                    <div class="col-12 col-lg-5 d-flex flex-column gap-3">
                        <div class="animate__animated animate__fadeInLeft">
                            <h1 class="h2 fw-bold text-white mb-1 banner-title-hero">
                                BUCA <span class="banner-ai-accent">AI</span>
                            </h1>
                            <p class="text-white text-opacity-75 text-uppercase fw-semibold mb-2 banner-tagline-hero">
                                Inteligencia Empresarial Aplicada
                            </p>
                            <p class="text-white text-opacity-95 mb-0 small banner-desc-hero">
                                Bienvenido, <strong class="text-white fw-bold">${displayName}</strong>. Su ecosistema de gestión corporativa está sincronizado y operando bajo el motor BNE v5.4.
                            </p>
                        </div>
                        
                        <div class="border-top border-white border-opacity-15 my-1"></div>

                        <div class="d-flex align-items-center gap-2 flex-wrap">
                            <span class="badge px-2.5 py-1.5 rounded-2 shadow-sm d-flex align-items-center gap-1.5 banner-badge-dark">
                                <i class="bi bi-shield-fill-check text-primary"></i> <span>BUCA AI</span>
                            </span>
                            <span class="badge px-2.5 py-1.5 rounded-2 shadow-sm d-flex align-items-center gap-1.5 banner-badge-sync">
                                <i class="bi bi-circle-fill text-white dot-sync-micro"></i> <span>SYNC EN VIVO</span>
                            </span>
                        </div>
                    </div>

                    <!-- Right Column: Fan-out 3D Stacked Cards (5 Cards with 3D Flip) -->
                    <div class="col-12 col-lg-7 d-flex justify-content-center py-4">
                        <div class="banner-fan-stack" id="banner-fan-stack">
                            
                            <!-- Card 1: Motor BNE -->
                            <div class="fan-card fan-theme-blue" data-fan-index="0">
                                <div class="card-flipper">
                                    <div class="card-front">
                                        <div class="card-icon-box">
                                            <i class="bi bi-cpu-fill fs-5"></i>
                                        </div>
                                        <div class="card-content">
                                            <div class="card-title">Motor BNE</div>
                                            <div class="card-status">60 FPS OK</div>
                                        </div>
                                    </div>
                                    <div class="card-back">
                                        <div class="card-expanded-info">
                                            <h6 class="small fw-bold mb-1 text-white"><i class="bi bi-cpu me-1 text-info"></i> Motor BNE v5.4</h6>
                                            <p class="x-small text-white-50 mb-2">Aceleración por hardware con latencia de 1.2ms.</p>
                                            <div class="badge bg-success bg-opacity-25 text-success w-100 py-1 fan-badge-micro">ESTADO: ÓPTIMO</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card 2: IA Predictiva -->
                            <div class="fan-card fan-theme-purple" data-fan-index="1">
                                <div class="card-flipper">
                                    <div class="card-front">
                                        <div class="card-icon-box">
                                            <i class="bi bi-stars fs-5"></i>
                                        </div>
                                        <div class="card-content">
                                            <div class="card-title">IA Predictiva</div>
                                            <div class="card-status">3 Agentes</div>
                                        </div>
                                    </div>
                                    <div class="card-back">
                                        <div class="card-expanded-info">
                                            <h6 class="small fw-bold mb-1 text-white"><i class="bi bi-stars me-1 text-purple"></i> IA Autónoma</h6>
                                            <p class="x-small text-white-50 mb-2">Predicción de demanda y flujo de caja diario.</p>
                                            <div class="badge bg-primary bg-opacity-25 text-primary w-100 py-1 fan-badge-micro">PRECISIÓN: 98.4%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card 3: Cloud Secure -->
                            <div class="fan-card fan-theme-green" data-fan-index="2">
                                <div class="card-flipper">
                                    <div class="card-front">
                                        <div class="card-icon-box">
                                            <i class="bi bi-shield-lock-fill fs-5"></i>
                                        </div>
                                        <div class="card-content">
                                            <div class="card-title">Cloud Secure</div>
                                            <div class="card-status">AES-256</div>
                                        </div>
                                    </div>
                                    <div class="card-back">
                                        <div class="card-expanded-info">
                                            <h6 class="small fw-bold mb-1 text-white"><i class="bi bi-shield-lock-fill me-1 text-success"></i> Cifrado AES-256</h6>
                                            <p class="x-small text-white-50 mb-2">Aislamiento multitenant y backup continuo.</p>
                                            <div class="badge bg-info bg-opacity-25 text-info w-100 py-1 fan-badge-micro">99.98% SLA</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card 4: Tasa Multi-Divisa -->
                            <div class="fan-card fan-theme-amber" data-fan-index="3">
                                <div class="card-flipper">
                                    <div class="card-front">
                                        <div class="card-icon-box">
                                            <i class="bi bi-currency-exchange fs-5"></i>
                                        </div>
                                        <div class="card-content">
                                            <div class="card-title">Tasa Multi-Divisa</div>
                                            <div class="card-status">BCV + USDT</div>
                                        </div>
                                    </div>
                                    <div class="card-back">
                                        <div class="card-expanded-info">
                                            <h6 class="small fw-bold mb-1 text-white"><i class="bi bi-currency-exchange me-1 text-warning"></i> Sincro en Vivo</h6>
                                            <p class="x-small text-white-50 mb-2">BCV USD/EUR y Binance P2P actualizados.</p>
                                            <div class="badge bg-warning bg-opacity-25 text-warning w-100 py-1 fan-badge-micro">EN VIVO</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card 5: Audit Trail -->
                            <div class="fan-card fan-theme-pink" data-fan-index="4">
                                <div class="card-flipper">
                                    <div class="card-front">
                                        <div class="card-icon-box">
                                            <i class="bi bi-journal-check fs-5"></i>
                                        </div>
                                        <div class="card-content">
                                            <div class="card-title">Audit Trail</div>
                                            <div class="card-status">ISO 27001</div>
                                        </div>
                                    </div>
                                    <div class="card-back">
                                        <div class="card-expanded-info">
                                            <h6 class="small fw-bold mb-1 text-white"><i class="bi bi-journal-check me-1 text-danger"></i> Auditoría ISO</h6>
                                            <p class="x-small text-white-50 mb-2">Trazabilidad inalterable de cada transacción.</p>
                                            <div class="badge bg-danger bg-opacity-25 text-danger w-100 py-1 fan-badge-micro">VERIFICADO</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const container = document.getElementById('banner-container');
        if (!container || container._bucaInit) return;
        container._bucaInit = true;

        const stack = container.querySelector('#banner-fan-stack');
        if (!stack) return;

        stack.addEventListener('click', (e) => {
            const card = e.target.closest('.fan-card');
            if (!card) return;

            e.stopPropagation();
            const isFlipped = card.classList.contains('flipped');
            
            // Cerrar otras
            stack.querySelectorAll('.fan-card').forEach(c => c.classList.remove('flipped', 'active'));
            
            if (!isFlipped) {
                card.classList.add('flipped', 'active');
            }
        });

        // Cerrar al hacer clic fuera con referencia desmontable
        this._outsideClickHandler = (e) => {
            if (!stack.contains(e.target)) {
                stack.querySelectorAll('.fan-card').forEach(c => c.classList.remove('flipped', 'active'));
            }
        };
        document.addEventListener('click', this._outsideClickHandler);
    },

    destroy() {
        if (this._outsideClickHandler) {
            document.removeEventListener('click', this._outsideClickHandler);
            this._outsideClickHandler = null;
        }
        const container = document.getElementById('banner-container');
        if (container) container._bucaInit = false;
    }
};

export default BannerComponent;
