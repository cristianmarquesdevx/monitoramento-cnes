import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const addToast = useCallback((msg, tipo = 'info', duracao = 3000) => {
    const id = Date.now() + Math.random();
    const icons = { success: <CheckCircle size={20} />, error: <XCircle size={20} />, warning: <AlertTriangle size={20} />, info: <Info size={20} /> };
    const colors = { success: 'bg-green-800 border-l-green-500', error: 'bg-red-800 border-l-red-500', warning: 'bg-yellow-800 border-l-yellow-400', info: 'bg-blue-800 border-l-blue-500' };
    setToasts(prev => [...prev, { id, msg, tipo, icon: icons[tipo] || icons.info, color: colors[tipo] || colors.info }]);
    if (duracao > 0) {
      setTimeout(() => removeToast(id), duracao);
    }
    return id;
  }, [removeToast]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removendo: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  const confirmDialog = useCallback((msg) => {
    return new Promise((resolve) => {
      setConfirm({ msg, resolve });
    });
  }, []);

  const handleConfirm = (value) => {
    if (confirm) {
      confirm.resolve(value);
      setConfirm(null);
    }
  };

  const toastApi = { success: (m, d) => addToast(m, 'success', d), error: (m, d) => addToast(m, 'error', d), warning: (m, d) => addToast(m, 'warning', d), info: (m, d) => addToast(m, 'info', d), confirm: confirmDialog };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-[420px] w-full">
        {toasts.map(t => (
          <div key={t.id}
            className={`pointer-events-auto px-4 py-3.5 rounded-lg text-white font-medium shadow-lg flex items-center gap-3 cursor-pointer transition-all duration-300 ${t.color} ${t.removendo ? 'opacity-0 translate-x-full' : 'animate-[toastSlideIn_0.35s_ease-out]'}`}
            onClick={() => removeToast(t.id)}>
            {t.icon}
            <span className="flex-1">{t.msg}</span>
          </div>
        ))}
      </div>
      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => handleConfirm(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden border-l-4 border-[var(--cor-primaria)]" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <HelpCircle size={24} className="text-[var(--cor-primaria)] flex-shrink-0 mt-0.5" />
                <p className="text-gray-800 font-medium text-sm">{confirm.msg}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 px-5 pb-4">
              <button onClick={() => handleConfirm(false)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-bold text-sm cursor-pointer transition-colors">Cancelar</button>
              <button onClick={() => handleConfirm(true)} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md font-bold text-sm cursor-pointer transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
