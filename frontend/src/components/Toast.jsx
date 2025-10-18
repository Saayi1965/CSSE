import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2,9);
    const t = { id, message, type: opts.type || 'info', timeout: opts.timeout || 3500 };
    setToasts(prev => [...prev, t]);
    if (t.timeout > 0) setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), t.timeout);
    return id;
  }, []);

  const dismiss = useCallback((id) => setToasts(prev => prev.filter(x => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ marginBottom: 8, minWidth: 200 }}>
            <div className={`toast ${t.type === 'error' ? 'toast-error' : 'toast-info'}`} style={{ padding: '8px 12px', borderRadius: 6, background: t.type === 'error' ? '#fdecea' : '#e6f4ea', color: '#111', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

export default ToastContext;
