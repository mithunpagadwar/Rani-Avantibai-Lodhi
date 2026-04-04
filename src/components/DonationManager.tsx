import React, { useState, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon, Upload, X, CreditCard, QrCode } from 'lucide-react';
import { DonationInfo } from '../types';
import { getSingleDocument, setSingleDocument } from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { motion } from 'framer-motion';

export default function DonationManager() {
  const [donation, setDonation] = useState<DonationInfo>({
    upiId: '',
    qrScannerUrl: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSingleDocument<DonationInfo>('siteContent', 'donation');
        if (data) setDonation(data);
      } catch (error) {
        console.error('Error fetching donation info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setUploadProgress(0);
      const url = await uploadFile(file, 'donations', (progress) => {
        setUploadProgress(progress);
      });
      setDonation({ ...donation, qrScannerUrl: url });
      setUploadProgress(null);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Failed to upload QR scanner: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSingleDocument('siteContent', 'donation', donation);
      alert('Donation information updated successfully!');
    } catch (error) {
      console.error('Error saving donation info:', error);
      alert('Failed to save donation info.');
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
          <h2 className="text-2xl font-bold text-gray-900">Donation Settings</h2>
          <p className="text-gray-500 text-sm">Manage UPI ID, QR Scanner, and Bank Details for donations</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Donation Info
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* UPI & QR Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="text-orange-600" size={20} /> UPI & QR Scanner
          </h3>
          
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">UPI ID (Google Pay / PhonePe)</label>
            <input 
              value={donation.upiId} 
              onChange={e => setDonation({...donation, upiId: e.target.value})} 
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-xl text-blue-600" 
              placeholder="trust@upi"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">QR Scanner Image</label>
            <div className="flex flex-col items-center gap-6">
              <div className="w-64 h-64 bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                {donation.qrScannerUrl ? (
                  <img src={donation.qrScannerUrl} className="w-full h-full object-contain p-4" alt="QR Scanner" />
                ) : (
                  <ImageIcon className="text-gray-300" size={64} />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label htmlFor="qr-upload" className="cursor-pointer bg-white text-orange-600 p-3 rounded-xl shadow-lg hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </label>
                  {donation.qrScannerUrl && (
                    <button 
                      onClick={() => setDonation({...donation, qrScannerUrl: ''})}
                      className="bg-white text-red-600 p-3 rounded-xl shadow-lg hover:scale-110 transition-transform"
                    >
                      <X size={24} />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-center">
                <input
                  type="file"
                  id="qr-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={saving}
                />
                <p className="text-sm text-gray-500">Upload your Google Pay or PhonePe QR code image.</p>
                {uploadProgress !== null && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
                    <div className="bg-orange-600 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bank Details Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-orange-600" size={20} /> Bank Account Details
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Account Holder Name</label>
              <input 
                value={donation.accountHolderName} 
                onChange={e => setDonation({...donation, accountHolderName: e.target.value})} 
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                placeholder="Trust Name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Bank Name</label>
              <input 
                value={donation.bankName} 
                onChange={e => setDonation({...donation, bankName: e.target.value})} 
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                placeholder="State Bank of India"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Account Number</label>
                <input 
                  value={donation.accountNumber} 
                  onChange={e => setDonation({...donation, accountNumber: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">IFSC Code</label>
                <input 
                  value={donation.ifscCode} 
                  onChange={e => setDonation({...donation, ifscCode: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none uppercase" 
                  placeholder="SBIN0001234"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Donation Description / Message</label>
              <textarea 
                value={donation.description} 
                onChange={e => setDonation({...donation, description: e.target.value})} 
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" 
                rows={4}
                placeholder="Enter a message for donors..."
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
