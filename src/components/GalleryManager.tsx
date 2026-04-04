import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, Video, Upload, Loader2, X, Calendar, ChevronDown, ChevronUp, FileText, Save } from 'lucide-react';
import { GalleryItem } from '../types';
import { subscribeToCollection, addDocument, deleteDocument, updateDocument } from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { orderBy } from 'firebase/firestore';
import { cn } from '../utils/cn';
import ConfirmButton from './ui/ConfirmButton';

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<GalleryItem>>({ 
    title: '', 
    url: '', 
    type: 'photo', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToCollection<GalleryItem>('gallery', setItems, orderBy('date', 'desc'));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video' = 'photo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadFile(file, 'gallery', (progress) => {
        setUploadProgress(progress);
      });
      setNewItem(prev => ({ ...prev, url: url, type: type }));
      setUploadProgress(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Failed to upload file: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setNewItem({
      title: item.title,
      url: item.url,
      type: item.type,
      date: item.date
    });
    setEditingId(item.id!);
    setIsEditing(true);
    setIsAdding(true);
    if (item.url.startsWith('http')) {
      setShowUrlInput(true);
    }
  };

  const handleAdd = async () => {
    console.log('Attempting to save gallery item:', newItem);
    if (!newItem.url || !newItem.title) {
      console.warn('Validation failed: Missing required fields');
      alert('Please provide a title and a URL or File.');
      return;
    }
    
    setIsUploading(true); // Reusing isUploading for save state
    try {
      if (isEditing && editingId) {
        console.log(`Updating gallery item with ID: ${editingId}`);
        await updateDocument('gallery', editingId, newItem);
      } else {
        console.log('Adding new gallery item');
        await addDocument('gallery', newItem);
      }
      console.log('Gallery item saved successfully');
      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
      setNewItem({ title: '', url: '', type: 'photo', date: new Date().toISOString().split('T')[0] });
      setShowUrlInput(false);
    } catch (error: any) {
      console.error('Error saving gallery item:', error);
      alert(`Failed to save gallery item: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
    setNewItem({ title: '', url: '', type: 'photo', date: new Date().toISOString().split('T')[0] });
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Gallery</h2>
          <p className="text-sm text-gray-500">Add photos or YouTube video links to the gallery.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> Add Item
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
                {isEditing ? 'Edit Gallery Item' : 'New Gallery Item'}
              </h3>
              <p className="text-sm text-gray-400 font-medium mt-1">
                {isEditing ? 'Update the details for this gallery item.' : 'Add a new photo or video to your trust\'s gallery.'}
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
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Item Title *</label>
                <input 
                  placeholder="e.g. Annual Trust Meeting 2024" 
                  value={newItem.title} 
                  onChange={e => setNewItem({...newItem, title: e.target.value})} 
                  className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Type</label>
                  <select 
                    value={newItem.type} 
                    onChange={e => setNewItem({...newItem, type: e.target.value as any})} 
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700 appearance-none"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date" 
                      value={newItem.date} 
                      onChange={e => setNewItem({...newItem, date: e.target.value})} 
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 hover:text-orange-600 transition-colors"
                >
                  {showUrlInput ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {newItem.type === 'video' ? 'Enter YouTube URL *' : 'Advanced: Use Image URL'}
                </button>
                <AnimatePresence>
                  {(showUrlInput || newItem.type === 'video') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <input 
                        placeholder={newItem.type === 'video' ? "https://www.youtube.com/watch?v=..." : "https://..."}
                        value={newItem.url} 
                        onChange={e => setNewItem({...newItem, url: e.target.value})} 
                        className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 mt-4 outline-none text-sm font-medium" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                  {newItem.type === 'photo' ? 'Upload Photo *' : 'Upload Video or Preview'}
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-4 border-dashed rounded-[2.5rem] h-[300px] flex flex-col items-center justify-center gap-4 transition-all overflow-hidden relative group",
                    "cursor-pointer border-gray-100 bg-gray-50/30 hover:border-orange-200 hover:bg-orange-50/30"
                  )}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-orange-600" size={48} />
                      <span className="text-sm font-black text-orange-600 uppercase tracking-widest">Uploading...</span>
                    </div>
                  ) : newItem.url && newItem.type === 'photo' ? (
                    <>
                      <img src={newItem.url} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                          <Upload className="text-white" size={32} />
                        </div>
                        <span className="text-white font-black uppercase tracking-widest text-xs">Change Photo</span>
                      </div>
                    </>
                  ) : newItem.url && newItem.type === 'video' ? (
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                        <Video size={40} />
                      </div>
                      <p className="text-gray-900 font-black text-lg">Video Uploaded</p>
                      <p className="text-gray-500 text-xs mt-2 truncate max-w-[200px]">{newItem.url}</p>
                      <div className="mt-4 text-xs font-bold text-orange-600 uppercase tracking-widest">Click to Change</div>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-gray-900 text-lg">Click to Upload</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                          {newItem.type === 'photo' ? 'JPG, PNG or WEBP' : 'MP4, WEBM or YouTube Link'}
                        </p>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => handleFileChange(e, newItem.type as any)} 
                    accept={newItem.type === 'photo' ? "image/*" : "video/*"} 
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
            </div>
          </div>

          <div className="flex gap-4 mt-12 pt-8 border-t border-gray-50">
            <button 
              onClick={handleAdd} 
              disabled={isUploading}
              className="flex-grow bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-orange-100 disabled:opacity-50 active:scale-95"
            >
              {isUploading ? 'Uploading...' : isEditing ? 'Update Gallery Item' : 'Save Gallery Item'}
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative aspect-square rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
          >
            {item.type === 'photo' ? (
              <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Video size={32} className="text-orange-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Video Content</p>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-6 backdrop-blur-[2px]">
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => handleEdit(item)}
                  className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-blue-600 hover:bg-white transition-all shadow-xl active:scale-95"
                  title="Edit Item"
                >
                  <ImageIcon size={20} />
                </button>
                <ConfirmButton 
                  onConfirm={() => deleteDocument('gallery', item.id!)}
                  confirmLabel="Delete"
                />
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
              >
                <h4 className="text-white font-black text-sm line-clamp-2 mb-2 leading-tight">{item.title}</h4>
                <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                  <Calendar size={12} />
                  {item.date}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">Gallery is empty. Add some memories!</p>
          </div>
        )}
      </div>
    </div>
  );
}
