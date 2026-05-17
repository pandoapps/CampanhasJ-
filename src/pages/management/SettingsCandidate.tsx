import { useState, useEffect, useCallback, FormEvent } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { profileService, whatsappService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatPhone } from '../../utils/format';

export function SettingsCandidate() {
  const { user } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'connected' | 'disconnected' | 'qrcode'>('idle');
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name ?? '', email: user.email ?? '', phone: (user as Record<string, string>).phone ?? '' });
    }
  }, [user]);

  const checkWhatsappStatus = useCallback(async () => {
    try {
      const res = await whatsappService.status();
      setWhatsappStatus(res.data.status === 'connected' ? 'connected' : 'disconnected');
    } catch {
      setWhatsappStatus('disconnected');
    }
  }, []);

  useEffect(() => { checkWhatsappStatus(); }, [checkWhatsappStatus]);

  useEffect(() => {
    if (whatsappStatus !== 'qrcode') return;
    const interval = setInterval(async () => {
      try {
        const res = await whatsappService.status();
        if (res.data.status === 'connected') {
          setWhatsappStatus('connected');
          setQrcode(null);
          toast('WhatsApp conectado com sucesso!');
          clearInterval(interval);
        }
      } catch { /* continua tentando */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [whatsappStatus, toast]);

  useEffect(() => {
    if (whatsappStatus !== 'qrcode') return;
    const interval = setInterval(async () => {
      try {
        const res = await whatsappService.qrcode();
        if (res.data.qrcode) setQrcode(res.data.qrcode);
      } catch { /* ignora erros de atualização */ }
    }, 20000);
    return () => clearInterval(interval);
  }, [whatsappStatus]);

  const handleConnect = async () => {
    setLoadingWhatsapp(true);
    try {
      const res = await whatsappService.connect();
      if (res.data.status === 'connected') {
        setWhatsappStatus('connected');
      } else {
        setQrcode(res.data.qrcode ?? null);
        setWhatsappStatus('qrcode');
      }
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao conectar WhatsApp.', 'error');
    } finally { setLoadingWhatsapp(false); }
  };

  const handleDisconnect = async () => {
    setLoadingWhatsapp(true);
    try {
      await whatsappService.disconnect();
      setWhatsappStatus('disconnected');
      setQrcode(null);
      toast('WhatsApp desconectado.');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao desconectar.', 'error');
    } finally { setLoadingWhatsapp(false); }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile.name || !profile.email) return toast('Nome e email são obrigatórios.', 'error');
    setSavingProfile(true);
    try {
      await profileService.update(profile);
      toast('Perfil atualizado com sucesso!');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao salvar perfil.', 'error');
    } finally { setSavingProfile(false); }
  };

  const handleSavePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!passwords.current_password || !passwords.password) return toast('Preencha todos os campos.', 'error');
    if (passwords.password !== passwords.password_confirmation) return toast('Senhas não conferem.', 'error');
    if (passwords.password.length < 8) return toast('A nova senha deve ter pelo menos 8 caracteres.', 'error');
    setSavingPassword(true);
    try {
      await profileService.updatePassword(passwords);
      toast('Senha alterada com sucesso!');
      setPasswords({ current_password: '', password: '', password_confirmation: '' });
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao alterar senha.', 'error');
    } finally { setSavingPassword(false); }
  };

  const userRecord = user as Record<string, unknown> | null;
  const planLabel = ({ basic: 'Básico', professional: 'Profissional', enterprise: 'Enterprise' } as Record<string, string>)[userRecord?.plan as string] ?? 'Básico';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Configurações</h1>
        <p className="text-white/50 text-sm">Gerencie sua conta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <GlassCard className="p-4 sm:p-6 lg:p-8">
            <h3 className="text-xl font-bold mb-6">Informações do Perfil</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSaveProfile}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Nome do Candidato</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full input-glass" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className="w-full input-glass" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Telefone</label>
                <input type="text" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                  className="w-full input-glass" placeholder="(11) 98888-7777" maxLength={15} />
              </div>
              <div className="space-y-1 flex items-end">
                <button type="submit" disabled={savingProfile} className="btn-primary w-full h-11 disabled:opacity-50">
                  {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6 lg:p-8">
            <h3 className="text-xl font-bold mb-6">Segurança</h3>
            <form className="space-y-6" onSubmit={handleSavePassword}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Senha Atual</label>
                  <input type="password" value={passwords.current_password}
                    onChange={(e) => setPasswords((p) => ({ ...p, current_password: e.target.value }))}
                    placeholder="••••••••" className="w-full input-glass" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Nova Senha</label>
                  <input type="password" value={passwords.password}
                    onChange={(e) => setPasswords((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••" className="w-full input-glass" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Confirmar Senha</label>
                  <input type="password" value={passwords.password_confirmation}
                    onChange={(e) => setPasswords((p) => ({ ...p, password_confirmation: e.target.value }))}
                    placeholder="••••••••" className="w-full input-glass" required />
                </div>
              </div>
              <button type="submit" disabled={savingPassword}
                className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded-lg border border-white/10 text-sm font-medium transition-all disabled:opacity-50">
                {savingPassword ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </form>
          </GlassCard>
        </div>

        <div className="space-y-6 lg:space-y-8">
          <GlassCard className="p-4 sm:p-6 lg:p-8">
            <h3 className="text-lg font-bold mb-1">WhatsApp</h3>
            <p className="text-white/40 text-sm mb-6">Conecte seu número para enviar campanhas.</p>

            {whatsappStatus === 'connected' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" />
                  <span className="text-sm font-medium text-green-400">Conectado</span>
                </div>
                <button onClick={handleDisconnect} disabled={loadingWhatsapp}
                  className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-all disabled:opacity-50">
                  {loadingWhatsapp ? 'Aguarde...' : 'Desconectar'}
                </button>
              </div>
            )}

            {whatsappStatus === 'disconnected' && (
              <button onClick={handleConnect} disabled={loadingWhatsapp}
                className="w-full btn-primary py-3 disabled:opacity-50">
                {loadingWhatsapp ? 'Conectando...' : 'Conectar WhatsApp'}
              </button>
            )}

            {whatsappStatus === 'qrcode' && (
              <div className="space-y-4">
                <p className="text-sm text-white/60">Escaneie o QR Code com o WhatsApp do seu celular.</p>
                {qrcode && (
                  <div className="flex justify-center p-4 bg-white rounded-xl">
                    <img src={qrcode} alt="QR Code WhatsApp" className="w-52 h-52 object-contain" />
                  </div>
                )}
                <button onClick={handleDisconnect} disabled={loadingWhatsapp}
                  className="w-full py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-all disabled:opacity-50">
                  Cancelar
                </button>
              </div>
            )}

            {whatsappStatus === 'idle' && (
              <div className="h-12 flex items-center">
                <span className="text-white/30 text-sm">Verificando status...</span>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-4 sm:p-6 lg:p-8">
            <h3 className="text-lg font-bold mb-4">Nível do Plano</h3>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold">{planLabel}</span>
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-black">ATIVA</span>
              </div>
            </div>
            <button className="text-sm text-primary font-bold hover:underline">Fazer Upgrade →</button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
