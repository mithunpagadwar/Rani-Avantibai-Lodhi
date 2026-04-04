import React, { useState, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon, Upload, X } from 'lucide-react';
import { AboutContent } from '../types';
import { getSingleDocument, setSingleDocument } from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { motion } from 'framer-motion';

export default function AboutManager() {
  const [content, setContent] = useState<AboutContent>({
    history: '',
    mission: '',
    vision: '',
    historyImageUrl: '',
    yearsOfService: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getSingleDocument<AboutContent>('siteContent', 'about');
        if (data) {
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setUploadProgress(0);
      const url = await uploadFile(file, 'about', (progress) => {
        setUploadProgress(progress);
      });
      setContent({ ...content, historyImageUrl: url });
      setUploadProgress(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSingleDocument('siteContent', 'about', content);
      alert('About content updated successfully!');
    } catch (error) {
      console.error('Error saving about content:', error);
      alert('Failed to save content.');
    } finally {
      setSaving(false);
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
          <h2 className="text-2xl font-bold text-gray-900">About Trust Content</h2>
          <p className="text-gray-500 text-sm">Edit the history, mission, and vision of the trust</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">History Image</label>
            <div className="flex items-center gap-6">
              <div className="w-48 h-48 bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                {content.historyImageUrl ? (
                  <img src={content.historyImageUrl} className="w-full h-full object-cover" alt="History" />
                ) : (
                  <ImageIcon className="text-gray-300" size={48} />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label htmlFor="history-image" className="cursor-pointer bg-white text-orange-600 p-3 rounded-xl shadow-lg hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </label>
                  {content.historyImageUrl && (
                    <button 
                      onClick={() => setContent({...content, historyImageUrl: ''})}
                      className="bg-white text-red-600 p-3 rounded-xl shadow-lg hover:scale-110 transition-transform"
                    >
                      <X size={24} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-grow space-y-4">
                <input
                  type="file"
                  id="history-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={saving}
                />
                <p className="text-sm text-gray-500">
                  Upload a high-quality image representing the trust's history. 
                  Recommended size: 800x600px.
                </p>
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

          <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Years of Service</label>
            <input 
              type="number"
              value={content.yearsOfService} 
              onChange={e => setContent({...content, yearsOfService: parseInt(e.target.value) || 0})} 
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-xl" 
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Trust History</label>
            <textarea 
              rows={8} 
              value={content.history} 
              onChange={e => setContent({...content, history: e.target.value})} 
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all leading-relaxed" 
              placeholder="Describe the history of the trust..."
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Our Mission</label>
            <textarea 
              rows={6} 
              value={content.mission} 
              onChange={e => setContent({...content, mission: e.target.value})} 
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all leading-relaxed" 
              placeholder="What is the trust's mission?"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Our Vision</label>
            <textarea 
              rows={6} 
              value={content.vision} 
              onChange={e => setContent({...content, vision: e.target.value})} 
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all leading-relaxed" 
              placeholder="What is the trust's vision for the future?"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
