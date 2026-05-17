import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GlassCardDark } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface LoginPageProps {
  type: 'CANDIDATE' | 'ADMIN';
}

export function LoginPage({ type }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const isAdmin = type === 'ADMIN';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/'); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleQuickAccess = async (e: string, p: string, dest: string) => {
    setEmail(e);
    setPassword(p);
    setLoading(true);
    try {
      await login(e, p);
      navigate(dest);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Credenciais inválidas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate(isAdmin ? '/admin/dashboard' : '/candidato/dashboard');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Credenciais inválidas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden bg-mesh">
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-white/50 hover:text-white cursor-pointer transition-colors">
          <span>←</span><span>Voltar para o site</span>
        </div>

        <GlassCardDark className="p-10 mb-6">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-3xl mb-4">
              {isAdmin ? '⚙️' : '🚀'}
            </div>
            <h1 className="text-2xl font-display font-bold leading-tight">
              {isAdmin ? 'Painel Administrativo' : 'Acesso do Candidato'}
            </h1>
            <p className="text-white/50 text-sm mt-2">
              {isAdmin ? 'Gerenciamento global da plataforma' : 'Gerencie suas campanhas e eleitores'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/70 ml-1">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">📧</span>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" className="w-full input-glass pl-12 h-12" required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-white/70 ml-1">Senha</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="w-full input-glass pl-12 pr-12 h-12" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                  title={showPassword ? 'Ocultar' : 'Mostrar'}>
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5" />
                <span className="text-white/50">Lembrar de mim</span>
              </label>
              <a href="#" className="text-primary hover:text-secondary transition-colors font-medium">Esqueceu a senha?</a>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full h-12 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Entrando...</span></> : 'Entrar'}
            </button>
          </form>
        </GlassCardDark>

        <GlassCardDark className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
            <span>⚡</span> Acesso Rápido — Ambiente de Teste
          </h3>
          <div className="grid gap-3">
            <button onClick={() => handleQuickAccess('admin@admin.com', '123456', '/admin/dashboard')}
              className="w-full glass p-4 flex items-center gap-4 hover:border-primary/50 text-left group">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🛡️</div>
              <div><div className="font-bold text-sm">Gestor Admin</div><div className="text-xs text-white/40">admin@admin.com</div></div>
            </button>
            {[
              { label: 'Tomio', email: 'tomio@campanhasja.com' },
              { label: 'Tião do Gás', email: 'tiaodogas@campanhasja.com' },
            ].map((u) => (
              <button key={u.email} onClick={() => handleQuickAccess(u.email, '123456', '/candidato/dashboard')}
                className="w-full glass p-4 flex items-center gap-4 hover:border-primary/50 text-left group">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">👤</div>
                <div><div className="font-bold text-sm">{u.label}</div><div className="text-xs text-white/40">{u.email}</div></div>
              </button>
            ))}
          </div>
        </GlassCardDark>
      </motion.div>
    </div>
  );
}
