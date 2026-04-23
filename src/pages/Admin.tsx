import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  LogOut, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  MessageSquare, 
  Users, 
  Bell,
  ChevronRight,
  Menu,
  X,
  Settings,
  Mail,
  Calendar,
  TrendingUp,
  Eye,
  PlusCircle,
  CreditCard,
  Award,
  Link as LinkIcon
} from 'lucide-react';
import { orderBy, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Contact } from '../types';
import { subscribeToCollection } from '../services/firestoreService';
import { cn } from '../utils/cn';

import SliderManager from '../components/SliderManager';
import ProgramManager from '../components/ProgramManager';
import GalleryManager from '../components/GalleryManager';
import MeetingManager from '../components/MeetingManager';
import PostManager from '../components/PostManager';
import MemberManager from '../components/MemberManager';
import NoticeManager from '../components/NoticeManager';
import ContactManager from '../components/ContactManager';
import AboutManager from '../components/AboutManager';
import SettingsManager from '../components/SettingsManager';
import DonationManager from '../components/DonationManager';
import CertificateManager from '../components/CertificateManager';
import QuickLinkManager from '../components/QuickLinkManager';

const ADMIN_EMAILS = [
  'amarshahidraniavantibailodhism@gmail.com',
  'mithunpagadwar745@gmail.com',
  'mithunpagadwar8@gmail.com'
];

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({
    members: 0,
    sliders: 0,
    gallery: 0,
    messages: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        console.log('Logged in user:', {
          email: u.email,
          uid: u.uid,
          emailVerified: u.emailVerified
        });
        if (u.email && ADMIN_EMAILS.includes(u.email)) {
          setUser(u);
          fetchStats();
        } else {
          console.warn('Unauthorized email:', u.email);
          setUser(null);
          if (u.email) {
            setError(`Email "${u.email}" is not authorized. Please contact the main administrator.`);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchStats = async () => {
    try {
      const collections = ['members', 'sliders', 'gallery', 'contacts'];
      const counts = await Promise.all(
        collections.map(async (col) => {
          const snapshot = await getDocs(collection(db, col));
          return snapshot.size;
        })
      );
      setStats({
        members: counts[0],
        sliders: counts[1],
        gallery: counts[2],
        messages: counts[3]
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogin = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error logging in with Google');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Email login error:', error);
      setError(error.message || 'Error logging in with Email/Password');
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100">
          <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Settings className="text-orange-600" size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 mb-8 font-medium">Please sign in with the authorized administrator account.</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {!showEmailLogin ? (
            <div className="space-y-4">
              <button 
                onClick={handleLogin} 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-3 active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Sign in with Google
              </button>
              
              <button 
                onClick={() => setShowEmailLogin(true)}
                className="w-full text-gray-400 font-bold text-sm hover:text-orange-600 transition-colors py-2"
              >
                Or use Email & Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-orange-600 outline-none transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-orange-600 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-gray-200 active:scale-95"
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => setShowEmailLogin(false)}
                className="w-full text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors py-2 text-center"
              >
                Back to Google Sign In
              </button>
            </form>
          )}

          <button 
            onClick={() => window.location.href = '/'} 
            className="mt-6 text-gray-300 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            Back to Website
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Site Settings', icon: Settings },
    { id: 'donation', label: 'Donation Info', icon: CreditCard },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'quicklinks', label: 'Quick Links', icon: LinkIcon },
    { id: 'sliders', label: 'Hero Sliders', icon: ImageIcon },
    { id: 'members', label: 'Trust Members', icon: Users },
    { id: 'notices', label: 'Marquee Notices', icon: Bell },
    { id: 'about', label: 'About Trust', icon: FileText },
    { id: 'programs', label: 'Programs', icon: Video },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'meetings', label: 'Meetings', icon: FileText },
    { id: 'posts', label: 'Blog Posts', icon: FileText },
    { id: 'contacts', label: 'Messages', icon: Mail },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'sliders': return <SliderManager />;
      case 'programs': return <ProgramManager />;
      case 'gallery': return <GalleryManager />;
      case 'meetings': return <MeetingManager />;
      case 'posts': return <PostManager />;
      case 'contacts': return <ContactManager />;
      case 'members': return <MemberManager />;
      case 'notices': return <NoticeManager />;
      case 'about': return <AboutManager />;
      case 'settings': return <SettingsManager />;
      case 'donation': return <DonationManager />;
      case 'certificates': return <CertificateManager />;
      case 'quicklinks': return <QuickLinkManager />;
      case 'dashboard': return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-orange-100 relative overflow-hidden group">
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-5xl font-black mb-6 tracking-tight leading-tight">
                  Namaste, <br />
                  <span className="text-orange-200">{user.displayName?.split(' ')[0]}!</span>
                </h2>
                <p className="text-orange-50/80 font-medium max-w-lg text-lg leading-relaxed mb-8">
                  Everything you need to manage the trust's digital footprint is right here. Keep your community updated and engaged.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('members')}
                    className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-50 transition-all shadow-xl active:scale-95"
                  >
                    Manage Members
                  </button>
                  <button 
                    onClick={() => setActiveTab('notices')}
                    className="bg-orange-400/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                  >
                    Post Notice
                  </button>
                </div>
              </motion.div>
            </div>
            <motion.div
              animate={{ 
                rotate: [12, 15, 12],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-20 -bottom-20 text-white/10"
            >
              <Settings size={400} />
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Members" value={stats.members} icon={<Users />} color="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Hero Sliders" value={stats.sliders} icon={<ImageIcon />} color="text-orange-600" bg="bg-orange-50" />
            <StatCard label="Gallery Items" value={stats.gallery} icon={<Video />} color="text-purple-600" bg="bg-purple-50" />
            <StatCard label="New Messages" value={stats.messages} icon={<Mail />} color="text-green-600" bg="bg-green-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <TrendingUp className="text-orange-600" /> Quick Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuickCard 
                  title="Trust Members" 
                  desc="Manage the 13 committee members and their roles." 
                  icon={<Users className="text-blue-600" />} 
                  color="bg-blue-50"
                  onClick={() => setActiveTab('members')}
                />
                <QuickCard 
                  title="Hero Sliders" 
                  desc="Update the main banner images on the home page." 
                  icon={<ImageIcon className="text-orange-600" />} 
                  color="bg-orange-50"
                  onClick={() => setActiveTab('sliders')}
                />
                <QuickCard 
                  title="Gallery" 
                  desc="Upload photos and videos of trust activities." 
                  icon={<Video className="text-purple-600" />} 
                  color="bg-purple-50"
                  onClick={() => setActiveTab('gallery')}
                />
                <QuickCard 
                  title="User Messages" 
                  desc="View and respond to inquiries from the contact form." 
                  icon={<Mail className="text-green-600" />} 
                  color="bg-green-50"
                  onClick={() => setActiveTab('contacts')}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">System Status</h3>
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-gray-700">Auth Status</span>
                  </div>
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Logged In</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", stats.messages >= 0 ? "bg-green-500" : "bg-red-500")}></div>
                    <span className="text-sm font-bold text-gray-700">Firestore Access</span>
                  </div>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", stats.messages >= 0 ? "text-green-600" : "text-red-600")}>
                    {stats.messages >= 0 ? 'Verified' : 'Denied'}
                  </span>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Admin Identity</p>
                  <p className="text-xs font-bold text-gray-600 break-all">{user.email}</p>
                  <p className="text-[8px] text-gray-400 mt-1">UID: {user.uid}</p>
                </div>
                <button 
                  onClick={fetchStats}
                  className="w-full py-4 text-sm font-black text-orange-600 uppercase tracking-widest hover:bg-orange-50 transition-all rounded-xl border border-orange-100"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-100 transition-all duration-500 flex flex-col fixed h-full z-50 shadow-sm",
        isSidebarOpen ? "w-72" : "w-24"
      )}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Settings className="text-white" size={20} />
              </div>
              <span className="font-black text-gray-900 tracking-tighter text-xl">ADMIN</span>
            </div>
          ) : (
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 mx-auto">
              <Settings className="text-white" size={20} />
            </div>
          )}
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-8 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative",
                activeTab === tab.id 
                  ? "bg-orange-600 text-white shadow-xl shadow-orange-100" 
                  : "text-gray-400 hover:bg-orange-50/50 hover:text-gray-900"
              )}
            >
              <div className={cn(
                "shrink-0 transition-all duration-300",
                activeTab === tab.id ? "text-white scale-110" : "text-gray-400 group-hover:text-orange-600 group-hover:scale-110"
              )}>
                <tab.icon size={22} />
              </div>
              {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{tab.label}</span>}
              {!isSidebarOpen && activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-orange-600 rounded-l-full shadow-[0_0_10px_rgba(234,88,12,0.5)]" 
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={22} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-grow transition-all duration-500 min-h-screen flex flex-col",
        isSidebarOpen ? "ml-72" : "ml-24"
      )}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 px-10 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                System Online
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative group flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-900 leading-none mb-1">{user.displayName || 'Admin'}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{user.email}</p>
              </div>
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=Admin&background=EA580C&color=fff`} 
                className="w-12 h-12 rounded-2xl border-2 border-white shadow-md group-hover:scale-105 transition-transform cursor-pointer" 
                alt="Admin" 
              />
              <button
                onClick={handleLogout}
                className="ml-2 p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
              <div className="absolute -bottom-1 right-12 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="p-10 text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] border-t border-gray-50">
          Amar Shahid Veerangana Rani Avantibai Lodhi Smarak Samiti Trust • Admin v2.0
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", bg, color)}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, time }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-default">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="flex-grow">
        <p className="text-sm font-bold text-gray-800">{title}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{time}</p>
      </div>
      <ChevronRight size={14} className="text-gray-200 group-hover:text-orange-600 transition-colors" />
    </div>
  );
}

function QuickCard({ title, desc, icon, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", color)}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-400 font-medium leading-relaxed">{desc}</p>
      <div className="mt-6 flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Manage Now <ChevronRight size={14} />
      </div>
    </button>
  );
}
