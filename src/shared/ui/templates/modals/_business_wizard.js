/**
 * Business Wizard Template - Asistente de Registro de Empresas (3 Pasos)
 * Estilo unificado Dark Theme Neural (BUSA-I / BUCA OS)
 * =========================================================================
 */
export const createBusinessWizardTemplate = () => `
    <div id="wizard-create-business" class="business-wizard-modal space-y-6 p-1">
        <div id="wizard-biz-feedback" class="hidden p-3 rounded-xl text-sm border"></div>

        {/* Step Indicator / Progress */}
        <div class="flex items-center justify-between mb-4 px-2">
            <button type="button" class="wizard-step-tab flex items-center gap-2 text-xs font-bold text-cyan-400 pb-2 border-b-2 border-cyan-400 transition-all" data-step="1">
                <span class="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-300">1</span> 
                <span>Identidad Fiscal</span>
            </button>
            <div class="flex-1 h-px bg-slate-800 mx-3"></div>
            <button type="button" class="wizard-step-tab flex items-center gap-2 text-xs font-semibold text-slate-400 pb-2 border-b-2 border-transparent transition-all" data-step="2">
                <span class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">2</span> 
                <span>Ubicación & Sede</span>
            </button>
            <div class="flex-1 h-px bg-slate-800 mx-3"></div>
            <button type="button" class="wizard-step-tab flex items-center gap-2 text-xs font-semibold text-slate-400 pb-2 border-b-2 border-transparent transition-all" data-step="3">
                <span class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">3</span> 
                <span>Finanzas & POS</span>
            </button>
        </div>

        <!-- PASO 1: Identidad Fiscal & Comercial -->
        <div class="wizard-step-pane active space-y-4" id="wizard-step-1-pane">
            <div class="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl mb-4">
                <div class="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <i class="bi bi-file-earmark-person-fill text-lg"></i>
                </div>
                <div>
                    <h6 class="text-sm font-bold text-white mb-0">Paso 1: Identidad Fiscal & Comercial</h6>
                    <span class="text-xs text-slate-400">Defina la razón jurídica y datos de registro del comercio.</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div class="md:col-span-8">
                    <label for="wizard-biz-name" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Razón Social Jurídica *</label>
                    <input type="text" id="wizard-biz-name" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all shadow-inner" placeholder="Ej: Inversiones Los Samanes C.A." required>
                </div>
                <div class="md:col-span-4">
                    <label for="wizard-biz-rif-num" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">RIF / Cédula Fiscal *</label>
                    <div class="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                        <select id="wizard-biz-rif-prefix" class="bg-slate-900 text-cyan-400 font-semibold border-r border-slate-700 px-3 py-2.5 text-sm focus:outline-none">
                            <option value="J-" selected>J-</option>
                            <option value="G-">G-</option>
                            <option value="V-">V-</option>
                            <option value="E-">E-</option>
                        </select>
                        <input type="text" id="wizard-biz-rif-num" class="w-full bg-slate-800 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="12345678-9" required>
                    </div>
                </div>

                <div class="md:col-span-6">
                    <label for="wizard-biz-commercial-name" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre Comercial / Sucursal</label>
                    <input type="text" id="wizard-biz-commercial-name" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all" placeholder="Ej: Mini Market Los Samanes">
                </div>
                <div class="md:col-span-6">
                    <label for="wizard-biz-category" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Rubro / Categoría Principal *</label>
                    <select id="wizard-biz-category" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm transition-all">
                        <option value="Retail / Alimentos" selected>Retail / Alimentos y Bebidas</option>
                        <option value="Farmacia & Salud">Farmacia & Artículos de Salud</option>
                        <option value="Mayorista & Distribución">Mayorista & Distribución</option>
                        <option value="Manufactura & Taller">Manufactura & Transformación</option>
                        <option value="Gastronomía & Restaurante">Gastronomía, Café & Restaurante</option>
                        <option value="Servicios Profesionales">Servicios Profesionales & Asesoría</option>
                        <option value="Tecnología & Ferretería">Tecnología, Repuestos & Ferretería</option>
                        <option value="Transporte & Logística">Transporte & Envíos</option>
                    </select>
                </div>

                <div class="md:col-span-12">
                    <label for="wizard-biz-description" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Objeto o Descripción Comercial</label>
                    <textarea id="wizard-biz-description" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all" rows="2" placeholder="Breve descripción de actividades, productos estrella o servicios ofrecidos..."></textarea>
                </div>
            </div>

            <div class="flex justify-end pt-4 border-t border-slate-800">
                <button type="button" id="wizard-next-1" class="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-cyan-900/30 transition-all flex items-center gap-2">
                    Siguiente <i class="bi bi-arrow-right"></i>
                </button>
            </div>
        </div>

        <!-- PASO 2: Sede, Ubicación & Contacto -->
        <div class="wizard-step-pane space-y-4 hidden" id="wizard-step-2-pane">
            <div class="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl mb-4">
                <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <i class="bi bi-geo-alt-fill text-lg"></i>
                </div>
                <div>
                    <h6 class="text-sm font-bold text-white mb-0">Paso 2: Sede, Ubicación & Contacto</h6>
                    <span class="text-xs text-slate-400">Indique la ubicación física para control territorial e inventario multialmacén.</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div class="md:col-span-6">
                    <label for="wizard-biz-state" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estado Federal *</label>
                    <select id="wizard-biz-state" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm transition-all">
                        <option value="Carabobo" selected>Carabobo</option>
                        <option value="Distrito Capital">Distrito Capital (Caracas)</option>
                        <option value="Miranda">Miranda</option>
                        <option value="Zulia">Zulia</option>
                        <option value="Aragua">Aragua</option>
                        <option value="Lara">Lara</option>
                        <option value="Anzoátegui">Anzoátegui</option>
                        <option value="Bolívar">Bolívar</option>
                        <option value="Táchira">Táchira</option>
                        <option value="Nueva Esparta">Nueva Esparta</option>
                    </select>
                </div>
                <div class="md:col-span-6">
                    <label for="wizard-biz-city" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ciudad o Municipio *</label>
                    <input type="text" id="wizard-biz-city" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all" value="Valencia" required>
                </div>

                <div class="md:col-span-12">
                    <label for="wizard-biz-line1" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dirección de Sede (Línea 1) *</label>
                    <input type="text" id="wizard-biz-line1" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all" placeholder="Ej: Av. Bolívar Norte, CC Cristal, Nivel 1, Local 4" required>
                </div>

                <div class="md:col-span-6">
                    <label for="wizard-biz-reference" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Punto de Referencia</label>
                    <input type="text" id="wizard-biz-reference" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all" placeholder="Ej: Frente a estación del metro">
                </div>
                <div class="md:col-span-6">
                    <label for="wizard-biz-zip" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Código Postal</label>
                    <input type="text" id="wizard-biz-zip" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all" value="2001">
                </div>

                <div class="md:col-span-6">
                    <label for="wizard-biz-phone" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Teléfono / WhatsApp</label>
                    <input type="text" id="wizard-biz-phone" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all" placeholder="+58 412-1234567">
                </div>
                <div class="md:col-span-6">
                    <label for="wizard-biz-email" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Correo de Facturación</label>
                    <input type="email" id="wizard-biz-email" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all" placeholder="facturacion@empresa.com">
                </div>
            </div>

            <div class="flex justify-between pt-4 border-t border-slate-800">
                <button type="button" id="wizard-prev-2" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-all flex items-center gap-2">
                    <i class="bi bi-arrow-left"></i> Anterior
                </button>
                <button type="button" id="wizard-next-2" class="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-cyan-900/30 transition-all flex items-center gap-2">
                    Siguiente <i class="bi bi-arrow-right"></i>
                </button>
            </div>
        </div>

        <!-- PASO 3: Régimen Cambiario, Impuestos & Finanzas -->
        <div class="wizard-step-pane space-y-4 hidden" id="wizard-step-3-pane">
            <div class="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl mb-4">
                <div class="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <i class="bi bi-cash-coin text-lg"></i>
                </div>
                <div>
                    <h6 class="text-sm font-bold text-white mb-0">Paso 3: Operación, Impuestos & Medios de Pago</h6>
                    <span class="text-xs text-slate-400">Configure las monedas oficiales, retenciones tributarias y canales POS.</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                    <span class="block text-xs font-bold text-slate-400 uppercase mb-2">Moneda Base Contable</span>
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1.5 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded-lg text-xs font-bold">USD ($)</span>
                        <span class="text-xs text-slate-300">Dólar Estadounidense</span>
                    </div>
                </div>
                <div class="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                    <span class="block text-xs font-bold text-slate-400 uppercase mb-2">Moneda Transacción POS</span>
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-bold">VES (Bs.)</span>
                        <span class="text-xs text-slate-300">Tasa Oficial BCV</span>
                    </div>
                </div>

                <div class="p-4 bg-slate-800 border border-slate-700 rounded-xl space-y-3">
                    <label class="flex items-center justify-between cursor-pointer">
                        <span class="text-xs font-bold text-white uppercase">Aplicar IVA General (16%)</span>
                        <input type="checkbox" id="wizard-biz-iva-apply" class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0" checked>
                    </label>
                    <p class="text-xs text-slate-400 mb-0">Calcula automáticamente el 16% sobre bienes no exentos en cada factura.</p>
                </div>

                <div class="p-4 bg-slate-800 border border-slate-700 rounded-xl space-y-3">
                    <label class="flex items-center justify-between cursor-pointer">
                        <span class="text-xs font-bold text-white uppercase">Aplicar IGTF Divisas (3%)</span>
                        <input type="checkbox" id="wizard-biz-igtf-apply" class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0" checked>
                    </label>
                    <label class="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-700/60">
                        <span class="text-xs text-slate-400">Absorber 3% por el comercio</span>
                        <input type="checkbox" id="wizard-biz-igtf-absorb" class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0">
                    </label>
                </div>
            </div>

            <div class="flex justify-between pt-4 border-t border-slate-800">
                <button type="button" id="wizard-prev-3" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-all flex items-center gap-2">
                    <i class="bi bi-arrow-left"></i> Anterior
                </button>
            </div>
        </div>
    </div>
`;
