import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Bell, X, Send, Clock, FileText, Save } from 'lucide-react';
import { Notice } from '../types';
import { subscribeToCollection, addDocument, deleteDocument, updateDocument } from '../services/firestoreService';
import { orderBy } from 'firebase/firestore';
import ConfirmButton from './ui/ConfirmButton';

export default function NoticeManager() {
  const [items, setItems] = useState<Notice[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    return subscribeToCollection<Notice>('notices', setItems, orderBy('date', 'desc'));
  }, []);

  const handleEdit = (notice: Notice) => {
    setNewText(notice.text);
    setEditingId(notice.id!);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleAdd = async () => {
    if (!newText) return;
    try {
      if (isEditing && editingId) {
        await updateDocument('notices', editingId, { text: newText });
      } else {
        await addDocument('notices', { 
          text: newText, 
          date: new Date().toISOString() 
        });
      }
      setNewText('');
      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving notice:', error);
      alert('Failed to save notice.');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
    setNewText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Marquee Notices</h2>
          <p className="text-sm text-gray-400 font-medium">Manage the scrolling announcements on the home page.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-orange-100 active:scale-95"
          >
            <Plus size={18} /> Add Notice
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-[2rem] shadow-2xl border border-orange-100 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  {isEditing ? <Send size={18} /> : <Bell size={18} />}
                </div>
                {isEditing ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button 
                onClick={handleCancel} 
                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Notice Message *</label>
                <textarea 
                  value={newText} 
                  onChange={e => setNewText(e.target.value)} 
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700 min-h-[120px]"
                  placeholder="Enter the text that will scroll on the home page marquee..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleAdd} 
                  className="flex-grow bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send size={16} /> {isEditing ? 'Update Notice' : 'Publish Notice'}
                </button>
                <button 
                  onClick={handleCancel} 
                  className="px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                <Bell size={22} />
              </div>
              <div>
                <p className="text-gray-800 font-bold text-lg leading-tight">{item.text}</p>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">
                  <Clock size={12} />
                  Published: {new Date(item.date).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleEdit(item)}
                className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-600 hover:text-white transition-all"
                title="Edit Notice"
              >
                <Send size={18} />
              </button>
              <ConfirmButton 
                onConfirm={() => deleteDocument('notices', item.id!)}
                confirmLabel="Delete"
                className="w-10 h-10 bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:text-white"
                icon={<Trash2 size={18} />}
              />
            </div>
          </motion.div>
        ))}
        {items.length === 0 && !isAdding && (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No active notices</h3>
            <p className="text-gray-400 font-medium">Click "Add Notice" to publish an announcement on the home page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
