import React, { useState } from 'react';
import { BusinessRepository } from '../services/BusinessRepository.js';

export function BusinessWizardModal({ user, isOpen, onClose, onRegistered }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    sector: 'Tecnología',
    rif: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user?.uid) return;
    setLoading(true);
    setError('');
    try {
      const created = await BusinessRepository.registerBusiness(user.uid, form);
      if (onRegistered) onRegistered(created);
      onClose();
    } catch (err) {
      setError('Error al registrar el negocio en Firestore.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i className="bi bi-building text-emerald-400"></i> Wizard de Registro Comercial BUSA-I
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-400">
          <span className={`flex items-center gap-1 ${step === 1 ? 'text-cyan-400 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">1</span> Datos Básicos
          </span>
          <div className="flex-1 h-px bg-slate-800 mx-2"></div>
          <span className={`flex items-center gap-1 ${step === 2 ? 'text-cyan-400 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">2</span> Ubicación y Contacto
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Comercial</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="Ej. BUSA Soluciones C.A."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Sector Económico</label>
                  <select 
                    value={form.sector}
                    onChange={(e) => setForm({...form, sector: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Tecnología">Tecnología / Software</option>
                    <option value="Comercio">Comercio General</option>
                    <option value="Servicios">Servicios Profesionales</option>
                    <option value="Fintech">Fintech & Cripto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">RIF / Identificación Fiscal</label>
                  <input 
                    type="text" 
                    value={form.rif}
                    onChange={(e) => setForm({...form, rif: e.target.value})}
                    placeholder="J-12345678-9"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => { if(form.name && form.rif) setStep(2); else setError('Complete los campos obligatorios'); }}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all"
                >
                  Siguiente <i className="bi bi-arrow-right ml-1"></i>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dirección Fiscal / Operativa</label>
                <input 
                  type="text" 
                  value={form.address}
                  onChange={(e) => setForm({...form, address: e.target.value})}
                  placeholder="Av. Principal, Torre BUSA, Piso 4"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono de Contacto</label>
                <input 
                  type="text" 
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  placeholder="+58 412 0000000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  <i className="bi bi-arrow-left mr-1"></i> Anterior
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg shadow-lg transition-all flex items-center gap-2"
                >
                  {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  Registrar Negocio
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
