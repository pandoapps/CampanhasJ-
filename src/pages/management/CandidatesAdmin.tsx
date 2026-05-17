import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../../components/GlassCard';
import { ConfirmModal } from '../../components/ConfirmModal';
import { candidateService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatPhone } from '../../utils/format';

interface Candidate {
  id: string; name: string; email: string; phone: string; plan: string;
  status: string; created_at: string; contacts_count?: number; campaigns_count?: number;
}

export function CandidatesAdmin() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', plan: 'basic' });
  const [confirmBlock, setConfirmBlock] = useState<Candidate | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const toast = useToast();

  const loadCandidates = useCallback(() => {
    setLoading(true);
    candidateService.list({ search: search || undefined, plan: filterPlan || undefined, status: filterStatus || undefined })
      .then(({ data }) => setCandidates(data.data ?? data))
      .catch(() => toast('Erro ao carregar candidatos.', 'error'))
      .finally(() => setLoading(false));
  }, [search, filterPlan, filterStatus]);

  useEffect(() => { loadCandidates(); }, [loadCandidates]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const openEdit = (c: Candidate) => {
    setEditingCandidate(c);
    setForm({ name: c.name, email: c.email, phone: c.phone ?? '', plan: c.plan });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCandidate(null);
    setForm({ name: '', email: '', phone: '', plan: 'basic' });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast('Nome e email são obrigatórios.', 'error');
    setSaving(true);
    try {
      if (editingCandidate) {
        await candidateService.update(editingCandidate.id, form);
        toast('Candidato atualizado com sucesso!');
      } else {
        await candidateService.create(form);
        toast('Candidato cadastrado com sucesso!');
      }
      closeModal();
      loadCandidates();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao salvar candidato.', 'error');
    } finally { setSaving(false); }
  };

  const handleBlock = async () => {
    if (!confirmBlock) return;
    const isBlocked = confirmBlock.status === 'blocked';
    setBlocking(true);
    setActionId(confirmBlock.id);
    try {
      if (isBlocked) {
        await candidateService.unblock(confirmBlock.id);
        toast(`${confirmBlock.name} desbloqueado.`);
      } else {
        await candidateService.block(confirmBlock.id);
        toast(`${confirmBlock.name} bloqueado.`);
      }
      setConfirmBlock(null);
      loadCandidates();
    } catch (e: unknown) {
      const action = isBlocked ? 'desbloquear' : 'bloquear';
      toast(e instanceof Error ? e.message : `Erro ao ${action} candidato.`, 'error');
    } finally { setBlocking(false); setActionId(null); }
  };

  const planLabel = (plan: string) => ({ basic: 'Básico', profissional: 'Profissional', enterprise: 'Enterprise' }[plan] ?? plan);
  const statusBadge = (s: string) => s === 'active' ? 'badge-success' : 'badge-danger';
  const statusLabel = (s: string) => s === 'active' ? 'Ativo' : s === 'blocked' ? 'Bloqueado' : 'Inativo';

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold">Gestão de Candidatos</h1>
          <p className="text-white/50">Gerencie todos os usuários da plataforma.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">➕ Adicionar Candidato</button>
      </div>

      <GlassCard className="p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, email ou telefone..." className="w-full input-glass pl-12 h-12 bg-white/5" />
          </div>
          <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
            className="input-glass h-12 bg-white/5 md:w-48 w-full">
            <option value="">Todos os Planos</option>
            <option value="basic">Básico</option>
            <option value="professional">Profissional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="input-glass h-12 bg-white/5 md:w-48 w-full">
            <option value="">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/30">Carregando...</div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/30 text-lg mb-4">Nenhum candidato encontrado</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">➕ Adicionar primeiro candidato</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                  <th className="px-6 py-4">Candidato</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4 text-center">Plano</th>
                  <th className="px-6 py-4 text-center">Métricas</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs uppercase">
                          {c.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold group-hover:text-primary transition-colors">{c.name}</div>
                          <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            Desde {new Date(c.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/70">{c.email}</div>
                      {c.phone && <div className="text-xs text-white/40 font-mono">{c.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/10">
                        {planLabel(c.plan)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-bold">{c.contacts_count ?? 0} <span className="text-[8px] text-white/30 uppercase">Contatos</span></span>
                        <span className="text-sm font-bold">{c.campaigns_count ?? 0} <span className="text-[8px] text-white/30 uppercase">Campanhas</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge ${statusBadge(c.status)}`}>{statusLabel(c.status)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 glass flex items-center justify-center rounded-lg hover:text-primary transition-all"
                          title="Editar candidato">
                          ✏️
                        </button>
                        <button
                          onClick={() => setConfirmBlock(c)}
                          disabled={actionId === c.id}
                          className={`w-8 h-8 glass flex items-center justify-center rounded-lg transition-all ${
                            c.status === 'blocked' ? 'hover:text-green-400' : 'hover:text-red-400'
                          }`}
                          title={c.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}>
                          {actionId === c.id ? '⏳' : c.status === 'blocked' ? '✅' : '🚫'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {confirmBlock && (
        <ConfirmModal
          title={confirmBlock.status === 'blocked' ? 'Desbloquear Candidato' : 'Bloquear Candidato'}
          message={confirmBlock.status === 'blocked'
            ? `Deseja desbloquear "${confirmBlock.name}"? O candidato voltará a ter acesso à plataforma.`
            : `Deseja bloquear "${confirmBlock.name}"? O candidato perderá o acesso à plataforma.`}
          confirmLabel={confirmBlock.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
          icon={confirmBlock.status === 'blocked' ? '✅' : '🚫'}
          danger={confirmBlock.status !== 'blocked'}
          loading={blocking}
          onConfirm={handleBlock}
          onCancel={() => setConfirmBlock(null)}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl glass-dark p-10 relative z-10"
          >
            <h2 className="text-2xl font-display font-bold mb-8">
              {editingCandidate ? 'Editar Candidato' : 'Cadastrar Novo Candidato'}
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Nome do Candidato *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full input-glass" placeholder="João da Silva" required />
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email Principal *</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full input-glass" placeholder="joao@email.com" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Telefone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                  className="w-full input-glass" placeholder="(11) 99999-9999" maxLength={15} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Plano</label>
                <select value={form.plan} onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
                  className="w-full input-glass h-12">
                  <option value="basic">Básico</option>
                  <option value="profissional">Profissional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              {!editingCandidate && (
                <div className="col-span-2">
                  <p className="text-xs text-white/40 bg-white/5 rounded-lg px-4 py-3 border border-white/5">
                    Senha inicial: <span className="font-mono font-bold text-white/60">123456</span> — o candidato pode alterar nas configurações.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-12">
              <button type="button" onClick={closeModal}
                className="flex-1 py-4 glass hover:bg-white/10 rounded-xl font-bold transition-all">Cancelar</button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : editingCandidate ? 'Salvar Alterações' : 'Criar Conta do Candidato'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
