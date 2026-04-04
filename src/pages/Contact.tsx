import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, CreditCard, QrCode, Copy, Check } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getSingleDocument } from '../services/firestoreService';
import { SiteSettings, DonationInfo } from '../types';
import { cn } from '../utils/cn';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [donation, setDonation] = useState<DonationInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getSingleDocument<SiteSettings>('siteContent', 'settings').then(setSettings);
    getSingleDocument<DonationInfo>('siteContent', 'donation').then(setDonation);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const address = settings?.address || 'Chikhli, Kurkheda, Gadchiroli, Maharashtra - 441209';
  const phone = settings?.contactPhone || '+91 XXXXXXXXXX';
  const email = settings?.contactEmail || 'info@trustname.org';

  return (
    <div className="pt-24 min-h-screen bg-white">
      <section className="bg-green-700 py-20 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact & Support</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Have questions or want to support our mission? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info & Donation */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Get in Touch</h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shrink-0">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">Our Location</h4>
                      <p className="text-gray-600">{address}</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shrink-0">
                      <Phone size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">Call Us</h4>
                      <p className="text-gray-600">{phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shrink-0">
                      <Mail size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">Email Us</h4>
                      <p className="text-gray-600">{email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donation Section */}
              {donation && (
                <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <CreditCard className="text-orange-600" /> Support via Donation
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {donation.description || 'Your contribution helps us continue our mission of serving the community and preserving our heritage.'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      {donation.upiId && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">UPI ID (GPay / PhonePe)</label>
                          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-orange-200">
                            <span className="font-bold text-orange-600 flex-grow truncate">{donation.upiId}</span>
                            <button 
                              onClick={() => copyToClipboard(donation.upiId)}
                              className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-gray-400 hover:text-orange-600"
                            >
                              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                            </button>
                          </div>
                        </div>
                      )}

                      {donation.bankName && (
                        <div className="space-y-3 bg-white/50 p-4 rounded-2xl border border-orange-100">
                          <h4 className="font-bold text-gray-900 text-sm border-b border-orange-100 pb-2 mb-2">Bank Transfer Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-gray-400 uppercase font-bold mb-1">Bank Name</p>
                              <p className="font-bold text-gray-800">{donation.bankName}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase font-bold mb-1">IFSC Code</p>
                              <p className="font-bold text-gray-800">{donation.ifscCode}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-gray-400 uppercase font-bold mb-1">Account Number</p>
                              <p className="font-bold text-gray-800 tracking-wider">{donation.accountNumber}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-gray-400 uppercase font-bold mb-1">Account Holder</p>
                              <p className="font-bold text-gray-800">{donation.accountHolderName}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {donation.qrScannerUrl && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-white p-4 rounded-3xl shadow-md border border-orange-100">
                          <img 
                            src={donation.qrScannerUrl} 
                            alt="Donation QR" 
                            className="w-40 h-40 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <QrCode size={12} /> Scan to Donate
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                    status === 'submitting' ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
                  )}
                >
                  {status === 'submitting' ? 'Sending...' : (
                    <>
                      Send Message <Send size={20} />
                    </>
                  )}
                </button>

                {status === 'success' && (
                  <p className="text-green-600 font-bold text-center mt-4">Message sent successfully! We will get back to you soon.</p>
                )}
                {status === 'error' && (
                  <p className="text-red-600 font-bold text-center mt-4">Something went wrong. Please try again later.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
