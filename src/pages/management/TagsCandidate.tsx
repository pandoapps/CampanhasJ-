import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../../components/GlassCard';
import { ConfirmModal } from '../../components/ConfirmModal';
import { tagService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface Tag { id: string; name: string; color: string; contacts_count: number; }

const COLORS = ['#FF6B00', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#64748b', '#22c55e', '#a855f7', '#334155'];

export function TagsCandidate() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: '', color: COLORS[0] });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const loadTags = useCallback(() => {
    setLoading(true);
    tagService.list()
      .then(({ data }) => setTags(data))
      .catch(() => toast('Erro ao carregar tags.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadTags(); }, [loadTags]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const openCreate = () => {
    setEditTag(null);
    setForm({ name: '', color: COLORS[0] });
    setShowModal(true);
  };

  const openEdit = (tag: Tag) => {
    setEditTag(tag);
    setForm({ name: tag.name, color: tag.color });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTag(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return toast('Nome da tag é obrigatório.', 'error');
    setSaving(true);
    try {
      if (editTag) {
        await tagService.update(editTag.id, form);
        toast('Tag atualizada!');
      } else {
        await tagService.create(form);
        toast('Tag criada com sucesso!');
      }
      closeModal();
      loadTags();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao salvar tag.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await tagService.delete(confirmDelete.id);
      toast('Tag removida.');
      setTags((prev) => prev.filter((t) => t.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao remover tag.', 'error');
    } finally { setDeleting(false); }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold">Gestão de Tags</h1>
          <p className="text-white/50">Categorize sua base para disparos segmentados.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">➕ Nova Tag</button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-white/30">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tags.map((tag) => (
            <GlassCard key={tag.id} className="p-6 group relative overflow-visible">
              <div className="flex justify-between items-start mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  🏷️
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(tag)}
                    className="w-8 h-8 glass rounded-full flex items-center justify-center hover:text-primary" title="Editar">✏️</button>
                  <button
                    onClick={() => setConfirmDelete(tag)}
                    className="w-8 h-8 glass rounded-full flex items-center justify-center hover:text-red-400" title="Excluir">
                    🗑️
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">{tag.name}</h3>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="text-xs font-mono text-white/40">{tag.color}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <div className="text-sm">
                  <span className="font-bold text-lg">{tag.contacts_count ?? 0}</span>
                  <span className="ml-1 text-white/40 uppercase text-[10px] tracking-widest font-bold">Contatos</span>
                </div>
              </div>
            </GlassCard>
          ))}

          <button
            onClick={openCreate}
            className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all text-white/30 hover:text-primary group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">+</div>
            <span className="font-bold uppercase tracking-widest text-xs">Criar Nova Tag</span>
          </button>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Remover Tag"
          message={`Tem certeza que deseja remover a tag "${confirmDelete.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Remover"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md glass-dark p-10 relative z-10"
          >
            <h2 className="text-2xl font-display font-bold mb-8">
              {editTag ? 'Editar Tag' : 'Criar Nova Tag'}
            </h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Nome da Tag</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full input-glass h-12"
                  placeholder="Ex: Liderança Bairro X"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Cor de Identificação</label>
                <div className="grid grid-cols-6 gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, color }))}
                      className={`aspect-square rounded-lg border-2 hover:scale-110 transition-transform shadow-xl ${
                        form.color === color ? 'border-white scale-110' : 'border-white/10'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button type="button" onClick={closeModal}
                className="flex-1 py-4 glass hover:bg-white/10 rounded-xl font-bold transition-all">Cancelar</button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : (editTag ? 'Salvar Alterações' : 'Criar Tag')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
