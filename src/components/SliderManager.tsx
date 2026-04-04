import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2, X, ChevronDown, ChevronUp, FileText, Save } from 'lucide-react';
import { Slider } from '../types';
import { subscribeToCollection, addDocument, deleteDocument, updateDocument } from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { orderBy } from 'firebase/firestore';
import { cn } from '../utils/cn';
import ConfirmButton from './ui/ConfirmButton';

export default function SliderManager() {
  const [items, setItems] = useState<Slider[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<Slider>>({ title: '', description: '', imageUrl: '', order: 0 });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToCollection<Slider>('sliders', setItems, orderBy('order', 'asc'));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadFile(file, 'sliders', (progress) => {
        setUploadProgress(progress);
      });
      setNewItem(prev => ({ ...prev, imageUrl: url }));
      setUploadProgress(null);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (slider: Slider) => {
    setNewItem({
      title: slider.title,
      description: slider.description,
      imageUrl: slider.imageUrl,
      order: slider.order
    });
    setEditingId(slider.id!);
    setIsEditing(true);
    setIsAdding(true);
    if (slider.imageUrl.startsWith('http')) {
      setShowUrlInput(true);
    }
  };

  const handleAdd = async () => {
    if (!newItem.imageUrl || !newItem.title) {
      alert('Please provide a title and an image.');
      return;
    }
    
    try {
      if (isEditing && editingId) {
        await updateDocument('sliders', editingId, newItem);
      } else {
        await addDocument('sliders', newItem);
      }
      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
      setNewItem({ title: '', description: '', imageUrl: '', order: 0 });
      setShowUrlInput(false);
    } catch (error) {
      console.error('Error saving slider:', error);
      alert('Failed to save slider.');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
    setNewItem({ title: '', description: '', imageUrl: '', order: 0 });
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Hero Sliders</h2>
          <p className="text-sm text-gray-500">Add or remove images from the home page slider.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> Add Slider
          </button>
        )}
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-orange-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-600 to-red-600"></div>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  {isEditing ? <ImageIcon size={24} /> : <Plus size={24} />}
                </div>
                {isEditing ? 'Edit Slider Item' : 'Create New Slider'}
              </h3>
              <p className="text-sm text-gray-400 font-medium mt-1">
                {isEditing ? 'Update the details for this home page slide.' : 'Fill in the details below to add a new slide to the home page.'}
              </p>
            </div>
            <button 
              onClick={handleCancel} 
              className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Slide Title *</label>
                <input 
                  placeholder="e.g. Empowering Women in Rural India" 
                  value={newItem.title} 
                  onChange={e => setNewItem({...newItem, title: e.target.value})} 
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Description</label>
                <textarea 
                  placeholder="Tell a short story about this slide..." 
                  value={newItem.description} 
                  onChange={e => setNewItem({...newItem, description: e.target.value})} 
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-gray-600 min-h-[120px] resize-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Display Order</label>
                <input 
                  type="number" 
                  value={newItem.order} 
                  onChange={e => setNewItem({...newItem, order: parseInt(e.target.value) || 0})} 
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" 
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Slide Image *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-4 border-dashed rounded-[2rem] h-[300px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all overflow-hidden relative group",
                    newItem.imageUrl ? "border-green-100 bg-green-50/30" : "border-gray-100 bg-gray-50/30 hover:border-orange-200 hover:bg-orange-50/30"
                  )}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <Loader2 className="animate-spin text-orange-600" size={48} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        </div>
                      </div>
                      <span className="text-sm font-black text-orange-600 uppercase tracking-widest">Uploading...</span>
                    </div>
                  ) : newItem.imageUrl ? (
                    <>
                      <img src={newItem.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                          <Upload className="text-white" size={32} />
                        </div>
                        <span className="text-white font-black uppercase tracking-widest text-xs">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-gray-900 text-lg">Click to Upload</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">JPG, PNG or WEBP (Max 5MB)</p>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
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

              <div className="pt-2">
                <button 
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 hover:text-orange-600 transition-colors"
                >
                  {showUrlInput ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Advanced: Use Image URL
                </button>
                <AnimatePresence>
                  {showUrlInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <input 
                        placeholder="https://images.unsplash.com/..." 
                        value={newItem.imageUrl} 
                        onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} 
                        className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 mt-4 outline-none text-sm font-medium" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-12 pt-8 border-t border-gray-50">
            <button 
              onClick={handleAdd} 
              disabled={isUploading}
              className="flex-grow bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-orange-100 disabled:opacity-50 active:scale-95"
            >
              {isUploading ? 'Uploading...' : isEditing ? 'Update Slider Item' : 'Save Slider Item'}
            </button>
            <button 
              onClick={handleCancel} 
              className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
          >
            <div className="relative h-64 overflow-hidden">
              <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black text-orange-600 shadow-xl uppercase tracking-widest">
                  Order {item.order}
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h4 className="text-white font-black text-xl tracking-tight mb-2 line-clamp-1">{item.title}</h4>
                <p className="text-white/70 text-xs font-medium line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
            </div>
            <div className="p-6 flex justify-end bg-gray-50/50 border-t border-gray-50 gap-2">
              <button 
                onClick={() => handleEdit(item)}
                className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                title="Edit Slider"
              >
                <ImageIcon size={20} />
              </button>
              <ConfirmButton 
                onConfirm={() => deleteDocument('sliders', item.id!)}
                confirmLabel="Delete"
                className="w-12 h-12 bg-white text-red-500 hover:text-white"
                icon={<Trash2 size={20} />}
              />
            </div>
          </motion.div>
        ))}
        {items.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">No sliders found. Add your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
