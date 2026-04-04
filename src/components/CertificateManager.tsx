import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, Award, ExternalLink, MoveUp, MoveDown, FileText } from 'lucide-react';
import { Certificate } from '../types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '../services/firestoreService';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmButton from './ui/ConfirmButton';

export default function CertificateManager() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCert, setNewCert] = useState<Partial<Certificate>>({
    title: '',
    description: '',
    url: '',
    order: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCollection<Certificate>('certificates');
        setCertificates(data.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (cert: Certificate) => {
    setNewCert({
      title: cert.title,
      description: cert.description,
      url: cert.url,
      order: cert.order
    });
    setEditingId(cert.id!);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = async () => {
    if (!newCert.title || !newCert.url) return;
    setSaving(true);
    try {
      if (isEditing && editingId) {
        await updateDocument('certificates', editingId, newCert);
        setCertificates(certificates.map(c => c.id === editingId ? { ...c, ...newCert } : c));
      } else {
        const certData = { ...newCert, order: certificates.length } as Certificate;
        const docRef = await addDocument('certificates', certData);
        if (docRef) {
          setCertificates([...certificates, { ...certData, id: docRef.id }]);
        }
      }
      setNewCert({ title: '', description: '', url: '', order: 0 });
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving certificate:', error);
      alert('Failed to save certificate.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setNewCert({ title: '', description: '', url: '', order: 0 });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument('certificates', id);
      setCertificates(certificates.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting certificate:', error);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= certificates.length) return;

    const newCerts = [...certificates];
    const temp = newCerts[index];
    newCerts[index] = newCerts[newIndex];
    newCerts[newIndex] = temp;

    // Update order values
    const updatedCerts = newCerts.map((c, i) => ({ ...c, order: i }));
    setCertificates(updatedCerts);

    // Save to Firestore
    try {
      await Promise.all(updatedCerts.map(c => updateDocument('certificates', c.id!, { order: c.order })));
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
          <h2 className="text-2xl font-bold text-gray-900">Important Certificates</h2>
          <p className="text-gray-500 text-sm">Manage trust registration and other important certificates</p>
        </div>
      </div>

      {/* Add/Edit Certificate */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {isEditing ? <FileText className="text-orange-600" size={20} /> : <Plus className="text-orange-600" size={20} />}
          {isEditing ? 'Edit Certificate' : 'Add New Certificate'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Certificate Title</label>
            <input 
              value={newCert.title} 
              onChange={e => setNewCert({...newCert, title: e.target.value})} 
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
              placeholder="e.g., Trust Registration Certificate"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Certificate URL / Link</label>
            <input 
              value={newCert.url} 
              onChange={e => setNewCert({...newCert, url: e.target.value})} 
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
              placeholder="https://drive.google.com/..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Description (Optional)</label>
            <textarea 
              value={newCert.description} 
              onChange={e => setNewCert({...newCert, description: e.target.value})} 
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
              rows={2}
              placeholder="Briefly describe the certificate..."
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAdd}
            disabled={saving || !newCert.title || !newCert.url}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? <Save size={20} /> : <Plus size={20} />)}
            {isEditing ? 'Update Certificate' : 'Add Certificate'}
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

      {/* Certificate List */}
      <div className="space-y-4">
        <AnimatePresence>
          {certificates.map((cert, index) => (
            <motion.div 
              key={cert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 group"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <Award size={24} />
              </div>
              
              <div className="flex-grow">
                <h4 className="font-bold text-gray-900">{cert.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-1">{cert.description || 'No description provided'}</p>
                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                  <ExternalLink size={12} /> View Document
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(cert)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Certificate"
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
                  disabled={index === certificates.length - 1}
                  className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-20 transition-colors"
                >
                  <MoveDown size={18} />
                </button>
                <ConfirmButton 
                  onConfirm={() => handleDelete(cert.id!)}
                  confirmLabel="Delete"
                  className="p-2 text-gray-400 hover:text-red-600"
                  icon={<Trash2 size={18} />}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {certificates.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Award className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No certificates added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
