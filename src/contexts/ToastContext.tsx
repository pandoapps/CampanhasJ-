import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const colors = {
    success: 'border-green-500/30 bg-green-500/10 text-green-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border glass text-sm font-medium shadow-xl pointer-events-auto ${colors[t.type]}`}
            >
              <span>{icons[t.type]}</span>
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx.toast;
}
