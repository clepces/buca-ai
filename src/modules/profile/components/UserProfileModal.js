import React, { useState, useEffect } from 'react';
import { ProfileService } from '../services/ProfileService.js';

export function UserProfileModal({ user, isOpen, onClose }) {
  const [profile, setProfile] = useState({
    displayName: '',
    role: 'operator',
    level: 1,
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadUserData();
    }
  }, [isOpen, user]);

  async function loadUserData() {
    setLoading(true);
    try {
      const data = await ProfileService.getProfile(user.uid);
      if (data) {
        setProfile(data);
      } else {
        setProfile({
          displayName: user.displayName || user.email || 'Operador BUSA',
          role: 'operator',
          level: 1,
          bio: 'Operador activo del sistema BUSA-I'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setMessage('');
    try {
      await ProfileService.createProfile(user.uid, profile);
      setMessage('¡Perfil actualizado con éxito!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setMessage('Error al guardar el perfil.');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i className="bi bi-person-badge text-cyan-400"></i> Perfil de Operador BUSA-I
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-2"></div>
            <p>Cargando datos del perfil...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de Operador</label>
              <input 
                type="text" 
                value={profile.displayName || ''} 
                onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rol Operativo</label>
                <select 
                  value={profile.role || 'operator'}
                  onChange={(e) => setProfile({...profile, role: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="operator">Operador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador OS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nivel de Autorización</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5"
                  value={profile.level || 1}
                  onChange={(e) => setProfile({...profile, level: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Biografía / Notas Operativas</label>
              <textarea 
                rows="3"
                value={profile.bio || ''}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              ></textarea>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm text-center ${message.includes('éxito') ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-300' : 'bg-red-900/50 border border-red-700 text-red-300'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg transition-all flex items-center gap-2"
              >
                {saving && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                Guardar Cambios
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
