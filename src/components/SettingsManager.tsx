import React, { useState, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon, Upload, X, MapPin, Phone, Mail, Type, Users } from 'lucide-react';
import { SiteSettings, JoinUsInfo } from '../types';
import { getSingleDocument, setSingleDocument } from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { motion } from 'framer-motion';

export default function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Amar Shahid Veerangana Rani Avantibai Lodhi Smarak Samiti Trust',
    contactEmail: '',
    contactPhone: '',
    address: '',
    footerText: '',
    logoUrl: ''
  });
  const [joinUs, setJoinUs] = useState<JoinUsInfo>({
    title: 'Join Our Mission',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number | null }>({
    logo: null,
    joinUs: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsData = await getSingleDocument<SiteSettings>('siteContent', 'settings');
        if (settingsData) setSettings(settingsData);
        
        const joinUsData = await getSingleDocument<JoinUsInfo>('siteContent', 'joinUs');
        if (joinUsData) setJoinUs(joinUsData);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'joinUs') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setUploadProgress(prev => ({ ...prev, [field]: 0 }));
      const url = await uploadFile(file, 'settings', (progress) => {
        setUploadProgress(prev => ({ ...prev, [field]: progress }));
      });
      
      if (field === 'logo') {
        setSettings(prev => ({ ...prev, logoUrl: url }));
      } else {
        setJoinUs(prev => ({ ...prev, imageUrl: url }));
      }
      setUploadProgress(prev => ({ ...prev, [field]: null }));
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      console.log('Saving settings...', settings);
      console.log('Saving joinUs...', joinUs);
      
      await Promise.all([
        setSingleDocument('siteContent', 'settings', settings),
        setSingleDocument('siteContent', 'joinUs', joinUs)
      ]);
      
      alert('Settings updated successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error.message || 'Unknown error'}`);
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
          <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
          <p className="text-gray-500 text-sm">Manage site name, logo, contact info, and join us section</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Site Identity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Type className="text-orange-600" size={20} /> Site Identity
          </h3>
          
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Site Name / Header Name</label>
            <input 
              value={settings.siteName} 
              onChange={e => setSettings(prev => ({...prev, siteName: e.target.value}))} 
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold" 
              placeholder="Enter site name..."
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Site Logo</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} className="w-full h-full object-contain p-2" alt="Logo" />
                ) : (
                  <ImageIcon className="text-gray-300" size={32} />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label htmlFor="logo-upload" className="cursor-pointer bg-white text-orange-600 p-2 rounded-lg shadow-lg">
                    <Upload size={18} />
                  </label>
                </div>
              </div>
              <div className="flex-grow">
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  disabled={saving}
                />
                <p className="text-xs text-gray-500">Upload a transparent PNG logo. Recommended size: 200x200px.</p>
                {uploadProgress.logo !== null && (
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                    <div className="bg-orange-600 h-1 rounded-full transition-all" style={{ width: `${uploadProgress.logo}%` }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Phone className="text-orange-600" size={20} /> Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  value={settings.contactPhone} 
                  onChange={e => setSettings(prev => ({...prev, contactPhone: e.target.value}))} 
                  className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="+91 1234567890"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  value={settings.contactEmail} 
                  onChange={e => setSettings(prev => ({...prev, contactEmail: e.target.value}))} 
                  className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="info@trust.org"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Office Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
              <textarea 
                value={settings.address} 
                onChange={e => setSettings(prev => ({...prev, address: e.target.value}))} 
                className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                rows={3}
                placeholder="Enter full office address..."
              />
            </div>
          </div>
        </motion.div>

        {/* Join Us Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6 lg:col-span-2"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-orange-600" size={20} /> Join Us Section
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Section Title</label>
                <input 
                  value={joinUs.title} 
                  onChange={e => setJoinUs(prev => ({...prev, title: e.target.value}))} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Description / Call to Action</label>
                <textarea 
                  value={joinUs.description} 
                  onChange={e => setJoinUs(prev => ({...prev, description: e.target.value}))} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                  rows={5}
                  placeholder="Explain why people should join the trust..."
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase">Section Image</label>
              <div className="relative aspect-video bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center group">
                {joinUs.imageUrl ? (
                  <img src={joinUs.imageUrl} className="w-full h-full object-cover" alt="Join Us" />
                ) : (
                  <ImageIcon className="text-gray-300" size={48} />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label htmlFor="joinus-upload" className="cursor-pointer bg-white text-orange-600 p-3 rounded-xl shadow-lg">
                    <Upload size={24} />
                  </label>
                </div>
                {uploadProgress.joinUs !== null && (
                  <div className="absolute bottom-0 left-0 w-full bg-gray-100 h-1">
                    <div className="bg-orange-600 h-1 transition-all" style={{ width: `${uploadProgress.joinUs}%` }} />
                  </div>
                )}
              </div>
              <input
                type="file"
                id="joinus-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'joinUs')}
                disabled={saving}
              />
            </div>
          </div>
        </motion.div>

        {/* Footer Text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6 lg:col-span-2"
        >
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Footer Copyright Text</label>
            <input 
              value={settings.footerText} 
              onChange={e => setSettings(prev => ({...prev, footerText: e.target.value}))} 
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
              placeholder="© 2024 Amar Shahid Veerangana Rani Avantibai Lodhi Smarak Samiti Trust. All rights reserved."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
