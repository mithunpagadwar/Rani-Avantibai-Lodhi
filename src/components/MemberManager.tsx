import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, Phone, MapPin, Briefcase, Image as ImageIcon, Upload, Loader2, X, ChevronDown, ChevronUp, FileText, Save } from 'lucide-react';
import { Member } from '../types';
import { subscribeToCollection, addDocument, deleteDocument, updateDocument } from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { orderBy } from 'firebase/firestore';
import { cn } from '../utils/cn';
import ConfirmButton from './ui/ConfirmButton';

export default function MemberManager() {
  const [items, setItems] = useState<Member[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<Member>>({ 
    name: '', 
    phone: '', 
    designation: '', 
    photoUrl: '', 
    address: '', 
    order: 0 
  });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToCollection<Member>('members', setItems, orderBy('order', 'asc'));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadFile(file, 'members', (progress) => {
        setUploadProgress(progress);
      });
      setNewItem(prev => ({ ...prev, photoUrl: url }));
      setUploadProgress(null);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Failed to upload photo: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (member: Member) => {
    setNewItem({
      name: member.name,
      phone: member.phone,
      designation: member.designation,
      photoUrl: member.photoUrl,
      address: member.address,
      order: member.order
    });
    setEditingId(member.id!);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleAdd = async () => {
    console.log('Attempting to save member:', newItem);
    if (!newItem.name || !newItem.designation || !newItem.photoUrl) {
      console.warn('Validation failed: Missing required fields');
      alert('Please fill in Name, Designation, and Photo');
      return;
    }
    
    setIsUploading(true); // Reusing isUploading for save state
    try {
      if (isEditing && editingId) {
        console.log(`Updating member with ID: ${editingId}`);
        await updateDocument('members', editingId, newItem);
      } else {
        console.log('Adding new member');
        await addDocument('members', newItem);
      }
      console.log('Member saved successfully');
      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
      setNewItem({ name: '', phone: '', designation: '', photoUrl: '', address: '', order: 0 });
    } catch (error: any) {
      console.error('Error saving member:', error);
      alert(`Failed to save member: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
    setNewItem({ name: '', phone: '', designation: '', photoUrl: '', address: '', order: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Trust Members</h2>
          <p className="text-sm text-gray-500">Add or remove committee members shown on the home page.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> Add Member
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
                  {isEditing ? <FileText size={24} /> : <Plus size={24} />}
                </div>
                {isEditing ? 'Edit Member Details' : 'New Trust Member'}
              </h3>
              <p className="text-sm text-gray-400 font-medium mt-1">
                {isEditing ? 'Update the information for this committee member.' : 'Add a new member to the trust\'s leadership team.'}
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
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    placeholder="e.g. Shri. Rajesh Patil" 
                    value={newItem.name} 
                    onChange={e => setNewItem({...newItem, name: e.target.value})} 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Designation / Post *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      placeholder="e.g. President" 
                      value={newItem.designation} 
                      onChange={e => setNewItem({...newItem, designation: e.target.value})} 
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      placeholder="e.g. +91 9876543210" 
                      value={newItem.phone} 
                      onChange={e => setNewItem({...newItem, phone: e.target.value})} 
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" 
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Display Order</label>
                  <input 
                    type="number" 
                    value={newItem.order} 
                    onChange={e => setNewItem({...newItem, order: parseInt(e.target.value) || 0})} 
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      placeholder="e.g. Mumbai, Maharashtra" 
                      value={newItem.address} 
                      onChange={e => setNewItem({...newItem, address: e.target.value})} 
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
                        placeholder="https://..." 
                        value={newItem.photoUrl} 
                        onChange={e => setNewItem({...newItem, photoUrl: e.target.value})} 
                        className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 mt-4 outline-none text-sm font-medium" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Member Photo *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-gray-100 rounded-[2.5rem] h-[300px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-orange-200 hover:bg-orange-50/30 transition-all bg-gray-50/30 overflow-hidden relative group"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-orange-600" size={48} />
                      <span className="text-sm font-black text-orange-600 uppercase tracking-widest">Uploading...</span>
                    </div>
                  ) : newItem.photoUrl ? (
                    <>
                      <img src={newItem.photoUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                          <Upload className="text-white" size={32} />
                        </div>
                        <span className="text-white font-black uppercase tracking-widest text-xs">Change Photo</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-gray-900 text-lg">Click to Upload</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">JPG, PNG or WEBP</p>
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
            </div>
          </div>

          <div className="flex gap-4 mt-12 pt-8 border-t border-gray-50">
            <button 
              onClick={handleAdd} 
              disabled={isUploading}
              className="flex-grow bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-orange-100 disabled:opacity-50 active:scale-95"
            >
              {isUploading ? 'Uploading...' : isEditing ? 'Update Member Details' : 'Save Member Details'}
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
              <img 
                src={item.photoUrl} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt={item.name} 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black text-orange-600 shadow-xl border border-orange-50">
                ORDER: {item.order}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px] gap-2">
                <button 
                  onClick={() => handleEdit(item)}
                  className="w-14 h-14 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center text-blue-600 hover:bg-white transition-all shadow-xl active:scale-95"
                  title="Edit Member"
                >
                  <FileText size={24} />
                </button>
                <ConfirmButton 
                  onConfirm={() => deleteDocument('members', item.id!)}
                  confirmLabel="Delete"
                  className="w-14 h-14 rounded-2xl"
                  icon={<Trash2 size={24} />}
                />
              </div>
            </div>
            <div className="p-8 flex-grow space-y-4">
              <div>
                <h4 className="font-black text-gray-900 text-xl leading-tight group-hover:text-orange-600 transition-colors">{item.name}</h4>
                <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.2em] mt-2 bg-red-50 inline-block px-3 py-1 rounded-lg">{item.designation}</p>
              </div>
              <div className="space-y-3 pt-2">
                {item.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                      <Phone size={14} />
                    </div>
                    {item.phone}
                  </div>
                )}
                {item.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-500 font-bold">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 mt-0.5 shrink-0">
                      <MapPin size={14} />
                    </div>
                    <span className="line-clamp-2">{item.address}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <User size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">No members added yet. Click "Add Member" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}
