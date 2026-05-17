import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../../components/GlassCard';
import { ConfirmModal } from '../../components/ConfirmModal';
import { contactService, tagService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatPhone } from '../../utils/format';

interface Tag { id: string; name: string; color: string; }
interface Contact { id: string; name: string; phone: string; email: string; notes?: string; tags: Tag[]; created_at: string; }

export function ContactsCandidate() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '', tags: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const loadContacts = useCallback(() => {
    setLoading(true);
    contactService.list({ search: search || undefined, tag: filterTag || undefined })
      .then(({ data }) => setContacts(data.data ?? data))
      .catch(() => toast('Erro ao carregar contatos.', 'error'))
      .finally(() => setLoading(false));
  }, [search, filterTag]);

  useEffect(() => {
    tagService.list().then(({ data }) => setTags(data)).catch(() => {});
  }, []);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const openCreate = () => {
    setEditContact(null);
    setForm({ name: '', phone: '', email: '', notes: '', tags: [] });
    setShowModal(true);
  };

  const openEdit = (contact: Contact) => {
    setEditContact(contact);
    setForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email ?? '',
      notes: contact.notes ?? '',
      tags: contact.tags?.map((t) => t.id) ?? [],
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditContact(null); };

  const handleSave = async () => {
    if (!form.name || !form.phone) return toast('Nome e WhatsApp são obrigatórios.', 'error');
    setSaving(true);
    try {
      if (editContact) {
        await contactService.update(editContact.id, form);
        toast('Contato atualizado com sucesso!');
      } else {
        await contactService.create(form);
        toast('Contato salvo com sucesso!');
      }
      closeModal();
      loadContacts();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao salvar contato.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await contactService.delete(confirmDelete.id);
      toast('Contato removido.');
      setContacts((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch { toast('Erro ao remover contato.', 'error'); }
    finally { setDeleting(false); }
  };

  const toggleTag = (id: string) =>
    setForm((p) => ({ ...p, tags: p.tags.includes(id) ? p.tags.filter((t) => t !== id) : [...p.tags, id] }));

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold">Gestão de Contatos</h1>
          <p className="text-white/50">Visualize e organize sua base de eleitores.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium transition-all">📥 Importar CSV</button>
          <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium transition-all">📤 Exportar</button>
          <button onClick={openCreate} className="btn-primary py-2 px-6">➕ Adicionar Contato</button>
        </div>
      </div>

      <GlassCard className="p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou telefone..." className="w-full input-glass pl-12 h-12 bg-white/5" />
          </div>
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
            className="input-glass h-12 bg-white/5 md:w-48 w-full">
            <option value="">Todas as Tags</option>
            {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/30">Carregando...</div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/30 text-lg mb-4">Nenhum contato encontrado</p>
            <button onClick={openCreate} className="btn-primary">➕ Adicionar primeiro contato</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Telefone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium group-hover:text-primary transition-colors">{c.name}</div>
                      <div className="text-[10px] text-white/30 uppercase font-bold">
                        {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-white/60">{c.phone}</td>
                    <td className="px-6 py-4 text-sm text-white/40">{c.email || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {c.tags?.map((tag) => (
                          <span key={tag.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 glass flex items-center justify-center rounded-lg hover:text-primary transition-all" title="Editar">
                          ✏️
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c)}
                          className="w-8 h-8 glass flex items-center justify-center rounded-lg hover:text-red-400 transition-all" title="Excluir">
                          🗑️
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg glass-dark p-10 relative z-10"
          >
            <h2 className="text-2xl font-display font-bold mb-8">
              {editContact ? 'Editar Contato' : 'Adicionar Novo Contato'}
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase">Nome Completo *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full input-glass" placeholder="João das Neves" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase">WhatsApp *</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                    className="w-full input-glass" placeholder="(11) 98888-7777" maxLength={15} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase">Email (Opcional)</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full input-glass" placeholder="joao@exemplo.com" />
              </div>
              {tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                          form.tags.includes(tag.id)
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'
                        }`}>
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase">Observações</label>
                <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full input-glass p-3 resize-none" rows={2} placeholder="Observações..." />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={closeModal}
                className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-bold transition-all">Cancelar</button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : editContact ? 'Salvar Alterações' : 'Salvar Contato'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Remover Contato"
          message={`Tem certeza que deseja remover "${confirmDelete.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Remover"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
