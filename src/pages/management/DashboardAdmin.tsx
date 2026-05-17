import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../../components/GlassCard';
import { adminService, candidateService } from '../../services/api';

interface Stats {
  total_candidates: number;
  active_campaigns: number;
  total_messages: number;
  monthly_growth: Array<{ month: string; count: number }>;
}

interface Candidate {
  id: string; name: string; email: string; plan: string; status: string; created_at: string;
}

export function DashboardAdmin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.dashboard(),
      candidateService.list(),
    ]).then(([statsRes, candidatesRes]) => {
      setStats(statsRes.data);
      const data = candidatesRes.data;
      setCandidates(data.data ?? data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Candidatos Cadastrados', value: stats.total_candidates, icon: '👥', trend: 'total' },
    { label: 'Campanhas em Execução', value: stats.active_campaigns, icon: '📩', trend: 'ativas' },
    { label: 'Mensagens Enviadas', value: (stats.total_messages ?? 0).toLocaleString('pt-BR'), icon: '📊', trend: 'total' },
  ] : [];

  const maxGrowth = stats?.monthly_growth?.reduce((m, g) => Math.max(m, g.count), 1) ?? 1;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Painel Administrativo</h2>
          <p className="text-xs text-gray-400">Visão geral da plataforma CampanhasJá</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} className="p-5 rounded-2xl">
                <div className="h-4 bg-white/5 rounded mb-2 w-3/4" />
                <div className="h-8 bg-white/5 rounded w-1/2" />
              </GlassCard>
            ))
          : statCards.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <GlassCard className="p-5 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                    <span className="text-xl opacity-80">{stat.icon}</span>
                  </div>
                  <p className="text-3xl font-bold mt-2 font-display">{stat.value}</p>
                  <p className="text-[10px] text-green-400 mt-1">{stat.trend}</p>
                </GlassCard>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-10">Crescimento de Candidatos</h3>
          <div className="flex items-end justify-between h-56 px-2 gap-4">
            {(stats?.monthly_growth ?? []).map((g, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4">
                <div className="w-full chart-bar" style={{ height: `${(g.count / maxGrowth) * 100}%` }} />
                <span className="text-[10px] uppercase font-bold text-white/30">{g.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-8">Candidatos Recentes</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-white/30 text-sm text-center py-4">Carregando...</p>
            ) : candidates.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{c.email}</p>
                </div>
                <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'} flex-shrink-0`}>
                  {c.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold">Candidatos da Plataforma</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Plano</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-white/30">Carregando...</td></tr>
              ) : candidates.slice(0, 10).map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-white/40">{c.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold border border-white/10 px-2 py-1 rounded bg-white/5 capitalize">{c.plan}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {c.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/40">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
