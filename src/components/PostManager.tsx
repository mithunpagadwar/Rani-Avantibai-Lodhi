import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, User, FileText, Image as ImageIcon, Upload, Loader2, X, Save } from 'lucide-react';
import { Post } from '../types';
import { subscribeToCollection, addDocument, deleteDocument, updateDocument } from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmButton from './ui/ConfirmButton';

export default function PostManager() {
  const [items, setItems] = useState<Post[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<Post>>({ 
    title: '', 
    content: '', 
    author: '', 
    date: new Date().toISOString().split('T')[0], 
    imageUrl: '' 
  });

  useEffect(() => {
    return subscribeToCollection<Post>('posts', setItems, orderBy('date', 'desc'));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setUploadProgress(0);
      console.log('Starting post image upload...');
      const url = await uploadFile(file, 'posts', (progress) => {
        setUploadProgress(progress);
      });
      console.log('Post image upload successful, URL:', url);
      setNewItem(prev => ({ ...prev, imageUrl: url }));
      setUploadProgress(null);
    } catch (error: any) {
      console.error('Post Image Upload failed:', error);
      alert(`Image upload failed: ${error.message || 'Unknown error'}`);
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setNewItem({
      title: post.title,
      content: post.content,
      author: post.author,
      date: post.date,
      imageUrl: post.imageUrl
    });
    setEditingId(post.id!);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleAdd = async () => {
    console.log('Attempting to save post:', newItem);
    if (!newItem.title || !newItem.content || !newItem.author) {
      console.warn('Validation failed: Missing required fields');
      alert('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing && editingId) {
        console.log(`Updating post with ID: ${editingId}`);
        await updateDocument('posts', editingId, newItem);
      } else {
        console.log('Adding new post');
        await addDocument('posts', newItem);
      }
      console.log('Post saved successfully');
      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
      setNewItem({ 
        title: '', 
        content: '', 
        author: '', 
        date: new Date().toISOString().split('T')[0], 
        imageUrl: '' 
      });
    } catch (error: any) {
      console.error('Error saving post:', error);
      alert(`Failed to save post: ${error.message || 'Unknown error'}`);
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
      content: '', 
      author: '', 
      date: new Date().toISOString().split('T')[0], 
      imageUrl: '' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Posts</h2>
          <p className="text-gray-500 text-sm">Write and publish posts for the trust website</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> New Post
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
              <h3 className="text-lg font-semibold">{isEditing ? 'Edit Post' : 'Write New Post'}</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Post Title</label>
                <input 
                  placeholder="Enter post title..." 
                  value={newItem.title} 
                  onChange={e => setNewItem({...newItem, title: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Author Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    placeholder="Author name..." 
                    value={newItem.author} 
                    onChange={e => setNewItem({...newItem, author: e.target.value})} 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Publish Date</label>
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

              <div className="space-y-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative group w-full">
                    <input
                      type="file"
                      id="post-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={loading}
                    />
                    <label
                      htmlFor="post-image"
                      className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition-all"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin text-orange-600" size={20} />
                      ) : (
                        <Upload className="text-gray-400 group-hover:text-orange-600" size={20} />
                      )}
                      <span className="text-sm text-gray-600 group-hover:text-orange-600">
                        {newItem.imageUrl ? 'Change Image' : 'Upload Cover Image'}
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
                <label className="block text-sm font-medium text-gray-700">Content (Markdown supported)</label>
                <textarea 
                  placeholder="Write your post content here..." 
                  rows={10} 
                  value={newItem.content} 
                  onChange={e => setNewItem({...newItem, content: e.target.value})} 
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-mono text-sm" 
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleAdd} 
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                {isEditing ? 'Update Post' : 'Publish Post'}
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

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{item.title}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User size={12} /> {item.author}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {item.date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(item)}
                  className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Edit Post"
                >
                  <FileText size={20} />
                </button>
                <ConfirmButton 
                  onConfirm={() => deleteDocument('posts', item.id!)}
                  confirmLabel="Delete"
                  className="text-red-500 p-3 hover:bg-red-50"
                  icon={<Trash2 size={20} />}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && !isAdding && (
          <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No posts found. Start writing your first post.</p>
          </div>
        )}
      </div>
    </div>
  );
}
