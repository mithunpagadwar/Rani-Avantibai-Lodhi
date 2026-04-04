import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, Upload, Loader2, X, File, ExternalLink } from 'lucide-react';
import { Meeting } from '../types';
import { subscribeToCollection, addDocument, deleteDocument, updateDocument } from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmButton from './ui/ConfirmButton';

export default function MeetingManager() {
  const [items, setItems] = useState<Meeting[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<Meeting>>({ 
    title: '', 
    date: new Date().toISOString().split('T')[0], 
    pdfUrl: '', 
    notes: '' 
  });

  useEffect(() => {
    return subscribeToCollection<Meeting>('meetings', setItems, orderBy('date', 'desc'));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      const url = await uploadFile(file, 'meetings', (progress) => {
        setUploadProgress(progress);
      });
      setNewItem({ ...newItem, pdfUrl: url });
      setUploadProgress(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setNewItem({
      title: meeting.title,
      date: meeting.date,
      pdfUrl: meeting.pdfUrl,
      notes: meeting.notes
    });
    setEditingId(meeting.id!);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleAdd = async () => {
    if (!newItem.title || !newItem.date) {
      alert('Please fill in required fields (Title and Date).');
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing && editingId) {
        await updateDocument('meetings', editingId, newItem);
      } else {
        await addDocument('meetings', newItem);
      }
      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
      setNewItem({ 
        title: '', 
        date: new Date().toISOString().split('T')[0], 
        pdfUrl: '', 
        notes: '' 
      });
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting record.');
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
      date: new Date().toISOString().split('T')[0], 
      pdfUrl: '', 
      notes: '' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Records</h2>
          <p className="text-gray-500 text-sm">Manage and upload minutes of trust meetings</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> Add Meeting
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
              <h3 className="text-lg font-semibold">{isEditing ? 'Edit Meeting Record' : 'New Meeting Record'}</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
                <input 
                  placeholder="e.g., Annual General Meeting 2024" 
                  value={newItem.title} 
                  onChange={e => setNewItem({...newItem, title: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Meeting Date</label>
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
                <label className="block text-sm font-medium text-gray-700">Minutes PDF</label>
                <div className="flex items-center gap-4">
                  <div className="relative group w-full">
                    <input
                      type="file"
                      id="meeting-pdf"
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      disabled={loading}
                    />
                    <label
                      htmlFor="meeting-pdf"
                      className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition-all"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin text-orange-600" size={20} />
                      ) : (
                        <Upload className="text-gray-400 group-hover:text-orange-600" size={20} />
                      )}
                      <span className="text-sm text-gray-600 group-hover:text-orange-600">
                        {newItem.pdfUrl ? 'Change PDF' : 'Upload Minutes PDF'}
                      </span>
                    </label>
                  </div>
                  {newItem.pdfUrl && (
                    <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shrink-0">
                      <FileText size={24} />
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
                <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea 
                  placeholder="Any key points or notes from the meeting..." 
                  rows={4} 
                  value={newItem.notes} 
                  onChange={e => setNewItem({...newItem, notes: e.target.value})} 
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
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
                {isEditing ? 'Update Meeting Record' : 'Save Meeting Record'}
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
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <File size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{item.title}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {item.date}
                    </span>
                    {item.pdfUrl && (
                      <a 
                        href={item.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> View Minutes
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(item)}
                  className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Edit Meeting"
                >
                  <FileText size={20} />
                </button>
                <ConfirmButton 
                  onConfirm={() => deleteDocument('meetings', item.id!)}
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
            <p className="text-gray-500">No meeting records found. Add your first record.</p>
          </div>
        )}
      </div>
    </div>
  );
}
