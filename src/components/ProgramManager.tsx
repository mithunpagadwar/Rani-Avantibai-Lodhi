import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Image as ImageIcon, X, Upload, Loader2, Video, ExternalLink, FileText, Save } from 'lucide-react';
import { Program } from '../types';
import { subscribeToCollection, addDocument, deleteDocument, updateDocument } from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmButton from './ui/ConfirmButton';

export default function ProgramManager() {
  const [items, setItems] = useState<Program[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<Program>>({ 
    title: '', 
    description: '', 
    imageUrl: '', 
    videoUrl: '',
    date: new Date().toISOString().split('T')[0] 
  });

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    return subscribeToCollection<Program>('programs', setItems, orderBy('date', 'desc'));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setUploadProgress(0);
      console.log('Starting program image upload...');
      const url = await uploadFile(file, 'programs', (progress) => {
        setUploadProgress(progress);
      });
      console.log('Program image upload successful, URL:', url);
      setNewItem(prev => ({ ...prev, imageUrl: url }));
      setUploadProgress(null);
    } catch (error: any) {
      console.error('Program Image Upload failed:', error);
      alert(`Image upload failed: ${error.message || 'Unknown error'}`);
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program: Program) => {
    setNewItem({
      title: program.title,
      description: program.description,
      imageUrl: program.imageUrl,
      videoUrl: program.videoUrl,
      date: program.date
    });
    setEditingId(program.id!);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleAdd = async () => {
    console.log('Attempting to save program:', newItem);
    if (!newItem.title || !newItem.description) {
      console.warn('Validation failed: Missing required fields');
      alert('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing && editingId) {
        console.log(`Updating program with ID: ${editingId}`);
        await updateDocument('programs', editingId, newItem);
      } else {
        console.log('Adding new program');
        await addDocument('programs', newItem);
      }
      console.log('Program saved successfully');
      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
      setNewItem({ 
        title: '', 
        description: '', 
        imageUrl: '', 
        videoUrl: '',
        date: new Date().toISOString().split('T')[0] 
      });
    } catch (error: any) {
      console.error('Error saving program:', error);
      alert(`Failed to save program: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
    setNewItem({ 
      title: '', 
      description: '', 
      imageUrl: '', 
      videoUrl: '',
      date: new Date().toISOString().split('T')[0] 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Programs</h2>
          <p className="text-gray-500 text-sm">Create and manage trust programs and events</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-200 active:scale-95"
          >
            <Plus size={20} /> Add Program
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{isEditing ? 'Edit Program' : 'New Program Details'}</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Program Title</label>
                <input 
                  placeholder="Enter program title..." 
                  value={newItem.title} 
                  onChange={e => setNewItem({...newItem, title: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Program Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    value={newItem.date} 
                    onChange={e => setNewItem({...newItem, date: e.target.value})} 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Program Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative group w-full">
                    <input
                      type="file"
                      id="program-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={loading}
                    />
                    <label
                      htmlFor="program-image"
                      className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition-all"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin text-orange-600" size={20} />
                      ) : (
                        <Upload className="text-gray-400 group-hover:text-orange-600" size={20} />
                      )}
                      <span className="text-sm text-gray-600 group-hover:text-orange-600">
                        {newItem.imageUrl ? 'Change Image' : 'Upload Image'}
                      </span>
                    </label>
                  </div>
                  {newItem.imageUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <img src={newItem.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>
                {uploadProgress !== null && (
                  <div className="w-full space-y-2 mt-4">
                    <div className="flex justify-between text-[10px] font-black text-orange-600 uppercase tracking-widest">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-orange-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">YouTube Video URL (Optional)</label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={newItem.videoUrl} 
                    onChange={e => setNewItem({...newItem, videoUrl: e.target.value})} 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
                {newItem.videoUrl && getYoutubeId(newItem.videoUrl) && (
                  <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(newItem.videoUrl)}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  placeholder="Describe the program..." 
                  rows={4} 
                  value={newItem.description} 
                  onChange={e => setNewItem({...newItem, description: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleAdd} 
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                {isEditing ? 'Update Program' : 'Save Program'}
              </button>
              <button 
                onClick={handleCancel} 
                className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-3xl overflow-hidden flex border border-gray-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300"
            >
              <div className="w-40 h-40 shrink-0 relative overflow-hidden">
                <img 
                  src={item.imageUrl || 'https://picsum.photos/seed/prog/400/400'} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt={item.title} 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 text-orange-600 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Calendar size={12} />
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <h4 className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{item.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                  {item.videoUrl && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-bold">
                      <Video size={12} /> Video Attached
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4 gap-2">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Edit Program"
                  >
                    <FileText size={18} />
                  </button>
                  <ConfirmButton 
                    onConfirm={() => deleteDocument('programs', item.id!)}
                    confirmLabel="Delete"
                    className="text-red-500 p-2.5 hover:bg-red-50"
                    icon={<Trash2 size={18} />}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No programs found. Add your first program to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
