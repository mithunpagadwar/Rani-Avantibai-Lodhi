import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, Link as LinkIcon, ExternalLink, MoveUp, MoveDown, FileText } from 'lucide-react';
import { QuickLink } from '../types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '../services/firestoreService';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmButton from './ui/ConfirmButton';

export default function QuickLinkManager() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState<Partial<QuickLink>>({
    title: '',
    url: '',
    order: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCollection<QuickLink>('quickLinks');
        setLinks(data.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Error fetching quick links:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (link: QuickLink) => {
    setNewLink({
      title: link.title,
      url: link.url,
      order: link.order
    });
    setEditingId(link.id!);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = async () => {
    if (!newLink.title || !newLink.url) return;
    setSaving(true);
    try {
      if (isEditing && editingId) {
        await updateDocument('quickLinks', editingId, newLink);
        setLinks(links.map(l => l.id === editingId ? { ...l, ...newLink } : l));
      } else {
        const linkData = { ...newLink, order: links.length } as QuickLink;
        const docRef = await addDocument('quickLinks', linkData);
        if (docRef) {
          setLinks([...links, { ...linkData, id: docRef.id }]);
        }
      }
      setNewLink({ title: '', url: '', order: 0 });
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving quick link:', error);
      alert('Failed to save quick link.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setNewLink({ title: '', url: '', order: 0 });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument('quickLinks', id);
      setLinks(links.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting quick link:', error);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[newIndex];
    newLinks[newIndex] = temp;

    // Update order values
    const updatedLinks = newLinks.map((l, i) => ({ ...l, order: i }));
    setLinks(updatedLinks);

    // Save to Firestore
    try {
      await Promise.all(updatedLinks.map(l => updateDocument('quickLinks', l.id!, { order: l.order })));
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-orange-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Links</h2>
          <p className="text-gray-500 text-sm">Manage links for the footer and other sections</p>
        </div>
      </div>

      {/* Add/Edit Link */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {isEditing ? <LinkIcon className="text-orange-600" size={20} /> : <Plus className="text-orange-600" size={20} />}
          {isEditing ? 'Edit Quick Link' : 'Add New Link'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Link Title</label>
            <input 
              value={newLink.title} 
              onChange={e => setNewLink({...newLink, title: e.target.value})} 
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
              placeholder="e.g., Government Portal"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Link URL</label>
            <input 
              value={newLink.url} 
              onChange={e => setNewLink({...newLink, url: e.target.value})} 
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
              placeholder="https://www.example.gov.in"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAdd}
            disabled={saving || !newLink.title || !newLink.url}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? <Save size={20} /> : <Plus size={20} />)}
            {isEditing ? 'Update Quick Link' : 'Add Quick Link'}
          </button>
          {isEditing && (
            <button 
              onClick={handleCancel}
              className="px-8 py-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Link List */}
      <div className="space-y-4">
        <AnimatePresence>
          {links.map((link, index) => (
            <motion.div 
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 group"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <LinkIcon size={24} />
              </div>
              
              <div className="flex-grow">
                <h4 className="font-bold text-gray-900">{link.title}</h4>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                  <ExternalLink size={12} /> {link.url}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(link)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Link"
                >
                  <FileText size={18} />
                </button>
                <button 
                  onClick={() => handleMove(index, 'up')} 
                  disabled={index === 0}
                  className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-20 transition-colors"
                >
                  <MoveUp size={18} />
                </button>
                <button 
                  onClick={() => handleMove(index, 'down')} 
                  disabled={index === links.length - 1}
                  className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-20 transition-colors"
                >
                  <MoveDown size={18} />
                </button>
                <ConfirmButton 
                  onConfirm={() => handleDelete(link.id!)}
                  confirmLabel="Delete"
                  className="p-2 text-gray-400 hover:text-red-600"
                  icon={<Trash2 size={18} />}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {links.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <LinkIcon className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No quick links added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
