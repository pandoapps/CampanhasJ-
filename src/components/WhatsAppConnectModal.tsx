import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { whatsappService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export function WhatsAppConnectModal({ open, onClose, onConnected }: Props) {
  const toast = useToast();
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'qrcode' | 'connected'>('connecting');

  const startConnect = useCallback(async () => {
    setLoading(true);
    setStatus('connecting');
    setQrcode(null);
    try {
      const res = await whatsappService.connect();
      if (res.data.status === 'connected') {
        setStatus('connected');
        onConnected();
        onClose();
      } else {
        setQrcode(res.data.qrcode ?? null);
        setStatus('qrcode');
      }
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao iniciar conexão com WhatsApp.', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [onConnected, onClose, toast]);

  useEffect(() => {
    if (open) startConnect();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling de status a cada 10s
  useEffect(() => {
    if (!open || status !== 'qrcode') return;
    const interval = setInterval(async () => {
      try {
        const res = await whatsappService.status();
        if (res.data.status === 'connected') {
          setStatus('connected');
          toast('WhatsApp conectado com sucesso!');
          onConnected();
          onClose();
        }
      } catch { /* continua tentando */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [open, status, onConnected, onClose, toast]);

  // Renovação do QR code a cada 20s
  useEffect(() => {
    if (!open || status !== 'qrcode') return;
    const interval = setInterval(async () => {
      try {
        const res = await whatsappService.qrcode();
        if (res.data.qrcode) setQrcode(res.data.qrcode);
      } catch { /* ignora */ }
    }, 20000);
    return () => clearInterval(interval);
  }, [open, status]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative w-full max-w-sm mx-4 rounded-2xl border border-white/15 p-8 space-y-6"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all text-sm"
              aria-label="Fechar"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <div className="text-4xl mb-3">📱</div>
              <h2 className="text-lg font-bold">Conectar WhatsApp</h2>
              <p className="text-sm text-white/50">
                {status === 'connecting'
                  ? 'Iniciando conexão...'
                  : 'Escaneie o QR Code com o WhatsApp do seu celular.'}
              </p>
            </div>

            {(status === 'connecting' || loading) && (
              <div className="flex justify-center py-6">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {status === 'qrcode' && qrcode && (
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-lg">
                  <img src={qrcode} alt="QR Code WhatsApp" className="w-52 h-52 object-contain" />
                </div>
                <p className="text-[11px] text-white/30 text-center">
                  O QR Code é renovado automaticamente a cada 20 segundos.
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-all"
            >
              Fazer depois
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
