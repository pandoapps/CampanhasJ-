import { useEffect } from 'react';
import { motion } from 'motion/react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  icon?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title, message, confirmLabel = 'Confirmar', icon = '🗑️',
  danger = true, loading, onConfirm, onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm glass-dark p-10 relative z-10 text-center"
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 border ${
          danger ? 'bg-red-500/20 border-red-500/30' : 'bg-primary/20 border-primary/30'
        }`}>
          {icon}
        </div>
        <h2 className="text-xl font-display font-bold mb-2">{title}</h2>
        <p className="text-white/50 text-sm mb-8">{message}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-bold transition-all text-sm">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} disabled={loading}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm disabled:opacity-50 hover:scale-105 active:scale-95 ${
              danger
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-primary text-white shadow-lg shadow-primary/20'
            }`}>
            {loading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
