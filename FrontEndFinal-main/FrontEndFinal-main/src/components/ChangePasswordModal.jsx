import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
// --- CORRECCIÓN DE IMPORTACIÓN: Usamos tu FinancialContext unificado ---
import { useFinancial } from '../context/FinancialContext';
import { changePassword } from '../services/authService'; 

export default function ChangePasswordModal({ isOpen, onClose }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState(null);
    const [isSaving, setIsSaving] = useState(false); 
    
    // Consumimos las cabeceras de autorización Bearer de Kyzen
    const { getAuthHeader } = useFinancial(); 

    if (!isOpen) return null;

    const handleSave = async (e) => { 
        e.preventDefault();
        setError('');
        setStatusMessage(null);

        if (newPassword !== confirmPassword) {
            setError('Las nuevas contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsSaving(true); 

        try {
            const passwords = { oldPassword, newPassword };
            const result = await changePassword(passwords, getAuthHeader());
            
            setStatusMessage(result.message || 'Contraseña cambiada exitosamente.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            setTimeout(onClose, 1500);
            
        } catch (err) {
            setError(err.message || 'Error al cambiar la contraseña.');
        } finally {
            setIsSaving(false); 
        }
    };

    // Mantenemos tus mismos estilos limpios de superposición móvil
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl relative animate-fadeIn">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSaving}
                >
                    <X size={22} />
                </button>
                
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Lock size={20} className="text-emerald-600" /> Cambiar Contraseña
                </h2>

                {error && <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold mb-4">{error}</div>}
                {statusMessage && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-semibold mb-4">{statusMessage}</div>}

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contraseña Antigua</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                            required
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                            required
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                            required
                            disabled={isSaving}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-gray-100 text-gray-500 font-bold rounded-xl text-xs"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md hover:bg-emerald-700 disabled:opacity-50"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}