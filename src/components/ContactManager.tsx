import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Mail, User, Phone, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Contact } from '../types';
import { subscribeToCollection, deleteDocument } from '../services/firestoreService';
import { orderBy } from 'firebase/firestore';
import ConfirmButton from './ui/ConfirmButton';

export default function ContactManager() {
  const [messages, setMessages] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = () => {
    try {
      setError(null);
      console.log('Starting subscription to contacts...');
      return subscribeToCollection<Contact>(
        'contacts', 
        (data) => {
          console.log('Received contacts data:', data);
          setMessages(data);
          setError(null);
        },
        (err) => {
          console.error('Subscription error callback:', err);
          setError(`Permission Error: ${err.message || 'Check your admin status'}`);
        }
        // Temporarily removed orderBy to see if it's filtering messages
        // orderBy('createdAt', 'desc')
      );
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to initialize message loading');
      return () => {};
    }
  };

  useEffect(() => {
    const unsubscribe = fetchMessages();
    return () => unsubscribe();
  }, []);

  const formatDate = (createdAt: any) => {
    if (!createdAt) return 'N/A';
    // Handle Firestore Timestamp
    if (createdAt.toDate && typeof createdAt.toDate === 'function') {
      return createdAt.toDate().toLocaleString();
    }
    // Handle ISO string or other date formats
    try {
      return new Date(createdAt).toLocaleString();
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Inquiry Messages</h2>
          <p className="text-sm text-gray-400 font-medium">Manage and respond to messages from the contact form.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              window.location.reload();
            }}
            className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all"
            title="Refresh Page"
          >
            <Clock size={20} />
          </button>
          <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
            <span className="text-orange-600 font-black text-sm uppercase tracking-widest">{messages.length} Total Messages</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-bold flex items-center gap-3">
          <XCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {messages.map((msg, index) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-grow space-y-6">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sender</p>
                      <p className="font-black text-gray-900">{msg.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                      <p className="font-bold text-gray-600">{msg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                      <p className="font-bold text-gray-600">{msg.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Received</p>
                      <p className="font-bold text-gray-600">{formatDate(msg.createdAt || msg.date)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={16} className="text-orange-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Content</span>
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">{msg.message}</p>
                </div>
              </div>

              <div className="flex lg:flex-col justify-end gap-3">
                <ConfirmButton 
                  onConfirm={() => deleteDocument('contacts', msg.id!)}
                  confirmLabel="Delete"
                  className="w-14 h-14 bg-red-50 text-red-500 hover:text-white"
                  icon={<Trash2 size={24} />}
                />
                <a 
                  href={`mailto:${msg.email}`}
                  className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center hover:bg-orange-700 transition-all shadow-xl shadow-orange-100"
                  title="Reply via Email"
                >
                  <Mail size={24} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}

        {messages.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-400 font-medium">When people contact you through the website, their messages will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
