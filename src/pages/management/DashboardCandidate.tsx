import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { campaignService, contactService, whatsappService } from '../../services/api';
import { WhatsAppConnectModal } from '../../components/WhatsAppConnectModal';

interface Campaign {
  id: string; name: string; status: string; total_recipients: number;
  total_sent: number; created_at: string;
}

interface DailyStat { date: string; label: string; count: number; }
interface Contact { id: string; name: string; phone: string; created_at: string; }

export function DashboardCandidate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  useEffect(() => {
    Promise.all([
      campaignService.list(),
      campaignService.dailyStats(),
      contactService.list({ page: 1 }),
    ]).then(([c, d, ct]) => {
      setCampaigns(c.data);
      setDailyStats(d.data);
      const contacts = ct.data?.data ?? ct.data;
      setRecentContacts(Array.isArray(contacts) ? contacts.slice(0, 5) : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    whatsappService.status()
      .then(({ data }) => { if (data.status !== 'connected') setShowWhatsAppModal(true); })
      .catch(() => {});
  }, []);

  const totalSent   = campaigns.reduce((s, c) => s + (c.total_sent || 0), 0);
  const activeCamps = campaigns.filter((c) => c.status === 'sending').length;

  const stats = [
    { label: 'Campanhas', value: campaigns.length, icon: '📩', trend: activeCamps + ' ativas' },
    { label: 'Mensagens Enviadas', value: totalSent.toLocaleString('pt-BR'), icon: '📈', trend: 'total' },
    { label: 'Concluídas', value: campaigns.filter((c) => c.status === 'completed').length, icon: '✅', trend: 'finalizadas' },
    { label: 'Rascunhos', value: campaigns.filter((c) => c.status === 'draft').length, icon: '📝', trend: 'pendentes' },
  ];

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      completed: 'badge-success', sending: 'badge-info',
      scheduled: 'badge-warning', paused: 'badge-warning', draft: 'badge-danger',
    };
    return map[s] ?? 'badge-info';
  };
  const statusLabel = (s: string) => ({
    completed: 'Concluída', sending: 'Ativa', scheduled: 'Agendada',
    paused: 'Pausada', draft: 'Rascunho',
  }[s] ?? s);

  return (
    <div className="p-8 space-y-8">
      <WhatsAppConnectModal
        open={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onConnected={() => setShowWhatsAppModal(false)}
      />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Olá, {user?.name} 👋</h2>
          <p className="text-xs text-gray-400">Acompanhe o desempenho da sua candidatura</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input type="text" placeholder="Buscar..." className="input-glass w-56 pl-4 pr-10 text-sm h-10" />
            <span className="absolute right-3 top-2.5 opacity-40">🔍</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                <span className="text-xl opacity-80">{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold mt-2 font-display">{loading ? '—' : stat.value}</p>
              <p className="text-[10px] text-gray-400 mt-1">{stat.trend}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-8">Mensagens Enviadas (Últimos 7 dias)</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">Carregando...</div>
          ) : (() => {
            const max = Math.max(...dailyStats.map((d) => d.count), 1);
            const BAR_MAX_PX = 140;
            return (
              <div className="flex items-end justify-between h-48 px-2 gap-2">
                {dailyStats.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] text-white/40 font-mono">{d.count > 0 ? d.count : ''}</span>
                    <div
                      className="w-full chart-bar"
                      style={{ height: `${Math.max((d.count / max) * BAR_MAX_PX, d.count === 0 ? 3 : 0)}px` }}
                    />
                    <span className="text-[10px] text-gray-400 font-medium capitalize">{d.label}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="col-span-12 lg:col-span-5 glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold">Últimos Contatos</h3>
            <button onClick={() => navigate('/candidato/contatos')}
              className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline">
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-white/30 text-sm text-center py-4">Carregando...</p>
            ) : recentContacts.length > 0 ? recentContacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                  {c.name.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{c.phone}</p>
                </div>
                <p className="text-[10px] text-white/30 shrink-0">{new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            )) : (
              <div className="text-center py-6">
                <p className="text-white/30 text-sm mb-3">Nenhum contato ainda</p>
                <button onClick={() => navigate('/candidato/contatos')} className="btn-primary py-2 px-4 text-sm">
                  Adicionar contato
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {campaigns.length > 0 && (
        <GlassCard className="overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-bold">Campanhas</h3>
            <button onClick={() => navigate('/candidato/campanhas')} className="text-sm text-primary font-medium hover:underline">Ver todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Enviadas</th>
                  <th className="px-6 py-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">{c.name}</td>
                    <td className="px-6 py-4 text-center"><span className={`badge ${statusBadge(c.status)}`}>{statusLabel(c.status)}</span></td>
                    <td className="px-6 py-4 text-center text-sm font-mono">{c.total_sent}</td>
                    <td className="px-6 py-4 text-sm text-white/40">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/candidato/campanhas')}
        className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-pulse-slow border-4 border-white/10"
        title="Nova Campanha">
        ➕
      </motion.button>
    </div>
  );
}
