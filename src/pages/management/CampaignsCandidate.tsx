import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../../components/GlassCard';
import { ConfirmModal } from '../../components/ConfirmModal';
import { campaignService, tagService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

type ActiveTab = 'LIST' | 'NEW' | 'DETAIL';

interface Campaign {
  id: string; name: string; status: string; total_recipients: number;
  total_sent: number; created_at: string; message?: string;
}

interface Delivery {
  id: string;
  phone: string;
  status: string;
  sent_at: string | null;
  contact: { id: string; name: string } | null;
}

interface CampaignDetail extends Campaign {
  deliveries: Delivery[];
}

interface Tag { id: string; name: string; color: string; contacts_count: number; }

const statusBadge = (s: string) => ({
  completed: 'badge-success', sending: 'badge-info', scheduled: 'badge-warning',
  paused: 'badge-warning', draft: 'badge-danger',
}[s] ?? 'badge-info');

const statusLabel = (s: string) => ({
  completed: 'Concluída', sending: 'Ativa', scheduled: 'Agendada',
  paused: 'Pausada', draft: 'Rascunho',
}[s] ?? s);

export function CampaignsCandidate() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('LIST');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const [form, setForm] = useState({
    name: '', description: '', message: '', tags: [] as string[],
    send_now: true, scheduled_at: '',
  });

  const loadCampaigns = useCallback(() => {
    setLoading(true);
    campaignService.list()
      .then(({ data }) => setCampaigns(data.data ?? data))
      .catch(() => toast('Erro ao carregar campanhas.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  useEffect(() => {
    tagService.list().then(({ data }) => setTags(data)).catch(() => {});
  }, []);

  const handleViewDetail = async (id: string) => {
    setLoadingDetail(true);
    setActiveTab('DETAIL');
    try {
      const { data } = await campaignService.show(id);
      setDetail(data);
    } catch {
      toast('Erro ao carregar detalhes.', 'error');
      setActiveTab('LIST');
    } finally { setLoadingDetail(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await campaignService.delete(confirmDelete.id);
      toast('Campanha excluída.');
      setCampaigns((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao excluir.', 'error');
    } finally { setDeleting(false); }
  };

  const toggleTag = (id: string) =>
    setForm((p) => ({ ...p, tags: p.tags.includes(id) ? p.tags.filter((t) => t !== id) : [...p.tags, id] }));

  const handleCreate = async (asDraft = false) => {
    if (!form.name.trim()) return toast('Nome da campanha é obrigatório.', 'error');
    if (!form.message.trim()) return toast('A mensagem é obrigatória.', 'error');
    setSaving(true);
    try {
      const isScheduled = !asDraft && !form.send_now && !!form.scheduled_at;
      const payload = {
        ...form,
        status: asDraft ? 'draft' : (isScheduled ? 'scheduled' : 'draft'),
        scheduled_at: (!form.send_now && form.scheduled_at)
          ? new Date(form.scheduled_at).toISOString()
          : null,
      };
      const { data } = await campaignService.create(payload);
      if (!asDraft && form.send_now) {
        await campaignService.send(data.id);
        toast('Campanha criada e envio iniciado!');
      } else {
        toast('Campanha salva como rascunho!');
      }
      setForm({ name: '', description: '', message: '', tags: [], send_now: true, scheduled_at: '' });
      setCurrentStep(1);
      setActiveTab('LIST');
      loadCampaigns();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao criar campanha.', 'error');
    } finally { setSaving(false); }
  };

  const steps = [
    { num: 1, label: 'Informações' },
    { num: 2, label: 'Destinatários' },
    { num: 3, label: 'Mensagem' },
    { num: 4, label: 'Agendamento' },
    { num: 5, label: 'Revisão' },
  ];

  const totalTagContacts = tags.filter((t) => form.tags.includes(t.id)).reduce((s, t) => s + (t.contacts_count ?? 0), 0);

  const detailPieData = detail ? [
    { name: 'Enviado', value: detail.deliveries.filter((d) => d.status === 'sent').length, color: '#22c55e' },
    { name: 'Falha', value: detail.deliveries.filter((d) => d.status === 'failed').length, color: '#ef4444' },
    { name: 'Pendente', value: detail.deliveries.filter((d) => d.status === 'pending').length, color: '#eab308' },
  ] : [];

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold">
            {activeTab === 'DETAIL' ? 'Detalhes da Campanha' : 'Gerenciar Campanhas'}
          </h1>
          <p className="text-white/50">
            {activeTab === 'DETAIL'
              ? `Análise de desempenho: ${detail?.name ?? ''}`
              : 'Crie e acompanhe o desempenho de suas mensagens.'}
          </p>
        </div>
        <div className="flex glass p-1 rounded-xl">
          {(['LIST', 'NEW'] as ActiveTab[]).map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setCurrentStep(1); }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5 text-white/50'}`}>
              {tab === 'LIST' ? 'Minhas Campanhas' : 'Nova Campanha'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'LIST' && (
          <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {loading ? (
              <div className="p-12 text-center text-white/30">Carregando...</div>
            ) : campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-white/30 text-lg mb-4">Nenhuma campanha ainda</p>
                <button onClick={() => setActiveTab('NEW')} className="btn-primary">➕ Criar primeira campanha</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {campaigns.map((campaign) => (
                  <GlassCard key={campaign.id} className="p-8 flex flex-col group overflow-visible">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`badge ${statusBadge(campaign.status)}`}>{statusLabel(campaign.status)}</span>
                      <div className="flex gap-1">
                        <button onClick={() => setConfirmDelete(campaign)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400" title="Excluir">
                          🗑️
                        </button>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">{campaign.name}</h3>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                      {new Date(campaign.created_at).toLocaleDateString('pt-BR')} • {campaign.total_recipients} Destinatários
                    </p>
                    {campaign.status === 'sending' && campaign.total_recipients > 0 && (
                      <div className="mb-8 space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-white/40 uppercase">Progresso</span>
                          <span className="text-primary">{Math.round((campaign.total_sent / campaign.total_recipients) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(campaign.total_sent / campaign.total_recipients) * 100}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="h-full bg-primary"
                          />
                        </div>
                      </div>
                    )}
                    <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                      <div className="text-xs text-white/40">
                        {campaign.total_sent} enviados
                      </div>
                      <button onClick={() => handleViewDetail(campaign.id)} className="text-sm font-bold text-primary group-hover:underline">
                        Ver detalhes →
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'DETAIL' && (
          <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            {loadingDetail ? (
              <div className="p-12 text-center text-white/30">Carregando detalhes...</div>
            ) : detail && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Envios', value: detail.total_recipients, color: '' },
                    { label: 'Enviados', value: detail.deliveries.filter((d) => d.status === 'sent').length, color: 'text-green-400' },
                    { label: 'Falhas', value: detail.deliveries.filter((d) => d.status === 'failed').length, color: 'text-red-500' },
                    { label: 'Pendentes', value: detail.deliveries.filter((d) => d.status === 'pending').length, color: 'text-yellow-400' },
                  ].map((kpi) => (
                    <GlassCard key={kpi.label} className="p-6">
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{kpi.label}</p>
                      <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    </GlassCard>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <GlassCard className="lg:col-span-8 p-8">
                    <h3 className="text-xl font-bold mb-8">Conteúdo da Mensagem</h3>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-white/70 italic leading-relaxed mb-6">
                      {detail.message || '—'}
                    </div>
                    {detail.deliveries.some((d) => d.status === 'failed') && (
                      <button onClick={() => campaignService.retryFailed(detail.id).then(() => { toast('Reenvio iniciado.'); handleViewDetail(detail.id); }).catch(() => toast('Erro ao reenviar.', 'error'))}
                        className="btn-primary">
                        Reenviar para Falhas
                      </button>
                    )}
                  </GlassCard>

                  <GlassCard className="lg:col-span-4 p-8 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-8 self-start">Status Geral</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={detailPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {detailPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #ffffff10', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-4">
                      {detailPieData.map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-white/60 font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>

                <GlassCard className="p-8">
                  <h3 className="text-xl font-bold mb-6">Relatório de Entregas</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-white/30 uppercase font-black tracking-widest border-b border-white/10">
                          <th className="pb-4 px-2">Recipiente</th>
                          <th className="pb-4 px-2">Telefone</th>
                          <th className="pb-4 px-2">Enviado em</th>
                          <th className="pb-4 px-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {detail.deliveries.slice(0, 20).map((d) => (
                          <tr key={d.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                                  {d.contact?.name?.charAt(0) ?? '?'}
                                </div>
                                <span className="text-sm font-medium">{d.contact?.name ?? '—'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-sm text-white/40 font-mono">{d.phone}</td>
                            <td className="py-4 px-2 text-xs text-white/40">
                              {d.sent_at ? new Date(d.sent_at).toLocaleString('pt-BR') : '—'}
                            </td>
                            <td className="py-4 px-2 text-right">
                              {d.status === 'sent' ? (
                                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase">Entregue ✅</span>
                              ) : d.status === 'failed' ? (
                                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase">Falha ❌</span>
                              ) : (
                                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold uppercase">Pendente ⏳</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'NEW' && (
          <motion.div key="new" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassCard className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-16 relative px-4">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0 hidden md:block" />
                {steps.map((step) => (
                  <div key={step.num} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all border-4 ${
                      currentStep >= step.num
                        ? 'bg-primary text-white border-primary/20 shadow-lg shadow-primary/20'
                        : 'bg-bg-card text-white/20 border-white/5'
                    }`}>
                      {currentStep > step.num ? '✓' : step.num}
                    </div>
                    <span className={`text-[10px] uppercase font-black tracking-widest hidden md:block ${currentStep >= step.num ? 'text-primary' : 'text-white/20'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="max-w-3xl mx-auto min-h-[400px]">
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <h2 className="text-2xl font-bold">Informações Básicas</h2>
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Nome da Campanha *</label>
                        <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full input-glass h-14" placeholder="Ex: Informativo Obras Centro" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Descrição Interna</label>
                        <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                          className="w-full input-glass p-4" rows={4} placeholder="Para qual finalidade serve esta campanha?" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <h2 className="text-2xl font-bold">Selecionar Destinatários</h2>
                    <div className="p-6 glass bg-white/2 rounded-2xl flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-xl">👥</div>
                        <div>
                          <div className="text-xs font-bold uppercase text-white/40 tracking-widest">Volume Estimado</div>
                          <div className="text-2xl font-bold">{form.tags.length === 0 ? 'Todos os contatos' : `~${totalTagContacts} Contatos`}</div>
                        </div>
                      </div>
                    </div>
                    {tags.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tags.map((tag) => (
                          <label key={tag.id} className="cursor-pointer group">
                            <input type="checkbox" checked={form.tags.includes(tag.id)} onChange={() => toggleTag(tag.id)} className="hidden" />
                            <div className={`p-4 glass rounded-xl border border-white/5 flex items-center gap-3 transition-all ${form.tags.includes(tag.id) ? 'border-primary bg-primary/10' : 'group-hover:bg-white/5'}`}>
                              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                              <span className="font-medium text-sm flex-1 truncate">{tag.name}</span>
                              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/40">{tag.contacts_count}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/40 text-center py-8">Nenhuma tag criada. A campanha será enviada para todos os contatos.</p>
                    )}
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <h2 className="text-2xl font-bold">Escrever Mensagem *</h2>
                    <div className="relative">
                      <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        className="w-full input-glass p-6 text-lg min-h-[300px] leading-relaxed"
                        placeholder="Olá {nome}, como vai? Gostaria de contar com seu apoio..." />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        {['{nome}'].map((tag) => (
                          <button key={tag} type="button"
                            onClick={() => setForm((p) => ({ ...p, message: p.message + tag }))}
                            className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs font-mono transition-colors">{tag}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 glass bg-blue-500/5 border border-blue-500/20 rounded-xl">
                      <span className="text-xl">ℹ️</span>
                      <p className="text-xs text-blue-400/80">
                        Variáveis como <span className="font-mono">{'{nome}'}</span> aumentam a taxa de resposta e evitam bloqueios.
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <h2 className="text-2xl font-bold">Agendamento</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <label className="cursor-pointer" onClick={() => setForm((p) => ({ ...p, send_now: true }))}>
                        <div className={`p-8 glass rounded-2xl border-2 transition-all text-center ${form.send_now ? 'border-primary bg-primary/5' : 'border-white/5'}`}>
                          <div className="text-4xl mb-4">⚡</div>
                          <div className="font-bold text-xl mb-1">Enviar Agora</div>
                          <p className="text-sm text-white/40">Inicia o disparo imediatamente após revisão.</p>
                        </div>
                      </label>
                      <label className="cursor-pointer" onClick={() => setForm((p) => ({ ...p, send_now: false }))}>
                        <div className={`p-8 glass rounded-2xl border-2 transition-all text-center ${!form.send_now ? 'border-primary bg-primary/5' : 'border-white/5'}`}>
                          <div className="text-4xl mb-4">📅</div>
                          <div className="font-bold text-xl mb-1">Agendar Horário</div>
                          <p className="text-sm text-white/40">Escolha o melhor momento para o envio.</p>
                        </div>
                      </label>
                    </div>
                    {!form.send_now && (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Data e Hora</label>
                          <input type="datetime-local" value={form.scheduled_at}
                            onChange={(e) => setForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                            className="w-full input-glass h-12" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-10">
                    <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-green-500/30 mb-8">🚀</div>
                    <h2 className="text-3xl font-display font-bold">Tudo pronto!</h2>
                    <p className="text-white/50 max-w-md mx-auto">Revise as informações abaixo antes de confirmar o disparo.</p>
                    <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mt-12 mb-12">
                      <div className="glass p-4 rounded-xl">
                        <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Campanha</div>
                        <div className="font-bold truncate">{form.name}</div>
                      </div>
                      <div className="glass p-4 rounded-xl">
                        <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Público</div>
                        <div className="font-bold">{form.tags.length === 0 ? 'Todos os contatos' : `${form.tags.length} tag(s) • ~${totalTagContacts} contatos`}</div>
                      </div>
                      <div className="glass p-4 rounded-xl">
                        <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Agendamento</div>
                        <div className="font-bold">{form.send_now ? 'Enviar Agora' : form.scheduled_at || 'Não definido'}</div>
                      </div>
                      <div className="glass p-4 rounded-xl">
                        <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Mensagem</div>
                        <div className="font-medium text-sm text-white/60 truncate">{form.message}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleCreate(false)} disabled={saving}
                      className="btn-primary w-full max-w-md h-16 text-xl shadow-2xl shadow-primary/30 disabled:opacity-50">
                      {saving ? 'Criando...' : 'Confirmar e Enviar 🚀'}
                    </button>
                    <button type="button" onClick={() => handleCreate(true)} disabled={saving}
                      className="block mx-auto mt-6 text-sm text-white/40 hover:text-white transition-colors disabled:opacity-50">
                      Salvar como Rascunho
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="mt-16 flex justify-between border-t border-white/5 pt-8">
                <button type="button" disabled={currentStep === 1} onClick={() => setCurrentStep((prev) => prev - 1)}
                  className={`px-8 py-3 glass rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10'}`}>
                  Voltar
                </button>
                {currentStep < 5 && (
                  <button type="button" onClick={() => {
                    if (currentStep === 1 && !form.name.trim()) return toast('Informe o nome da campanha.', 'error');
                    if (currentStep === 3 && !form.message.trim()) return toast('Escreva a mensagem.', 'error');
                    setCurrentStep((prev) => prev + 1);
                  }} className="px-10 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    Próximo Passo
                  </button>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir Campanha"
          message={`Tem certeza que deseja excluir "${confirmDelete.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
