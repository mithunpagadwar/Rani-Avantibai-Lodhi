import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowRight, 
  Bell, 
  FileText, 
  CreditCard, 
  AlertCircle, 
  LayoutGrid, 
  Download,
  ExternalLink,
  Phone,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscribeToCollection, getSingleDocument } from '../services/firestoreService';
import { Member, Post, Notice, AboutContent, Certificate, QuickLink, JoinUsInfo } from '../types';
import { orderBy, limit } from 'firebase/firestore';

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [joinUs, setJoinUs] = useState<JoinUsInfo | null>(null);

  useEffect(() => {
    const unsubMembers = subscribeToCollection<Member>('members', setMembers, orderBy('order', 'asc'));
    const unsubPosts = subscribeToCollection<Post>('posts', setLatestPosts, orderBy('date', 'desc'), limit(3));
    const unsubNotices = subscribeToCollection<Notice>('notices', setNotices, orderBy('date', 'desc'));
    const unsubCerts = subscribeToCollection<Certificate>('certificates', setCertificates, orderBy('order', 'asc'));
    const unsubLinks = subscribeToCollection<QuickLink>('quickLinks', setQuickLinks, orderBy('order', 'asc'));
    
    // Fetch about content
    getSingleDocument<AboutContent>('siteContent', 'about').then(content => {
      if (content) setAboutContent(content);
    });

    // Fetch Join Us content
    getSingleDocument<JoinUsInfo>('siteContent', 'joinUs').then(setJoinUs);

    return () => {
      unsubMembers();
      unsubPosts();
      unsubNotices();
      unsubCerts();
      unsubLinks();
    };
  }, []);
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Notice Bar */}
      <div className="bg-white border-b border-gray-200 py-2 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center">
          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded mr-4 shrink-0">
            NOTICE
          </div>
          <div className="flex-grow overflow-hidden relative h-6">
            <div className="absolute whitespace-nowrap animate-marquee flex items-center gap-8 text-sm font-medium text-gray-700">
              {notices.length > 0 ? (
                notices.map((n) => (
                  <span key={n.id}>{n.text}</span>
                ))
              ) : (
                <>
                  <span>अधिकृत पोर्टलवर आपले स्वागत आहे | आपले कर वेळेवर भरा | ग्रामसभेत सहभाग नोंदवा.</span>
                  <span>Welcome to the official portal | Pay your taxes on time | Register your participation in Gram Sabha.</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="h-[500px] md:h-[600px]">
          <HeroSlider />
        </div>

        {/* Quick Action Buttons - Overlapping */}
        <div className="absolute -bottom-12 left-0 right-0 z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Donate', icon: <CreditCard size={28} />, color: 'bg-green-600', path: '/contact' },
                { label: 'Join Us', icon: <Users size={28} />, color: 'bg-red-600', path: '/contact' },
                { label: 'Programs', icon: <LayoutGrid size={28} />, color: 'bg-blue-600', path: '/programs' },
                { label: 'Meetings', icon: <Bell size={28} />, color: 'bg-orange-600', path: '/meetings' },
              ].map((btn, idx) => (
                <Link
                  key={idx}
                  to={btn.path}
                  className={`${btn.color} text-white p-6 rounded-lg shadow-xl flex flex-col items-center justify-center gap-3 transform hover:-translate-y-1 transition-all duration-300`}
                >
                  {btn.icon}
                  <span className="font-bold text-lg">{btn.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      {joinUs && (
        <section className="py-20 bg-orange-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{joinUs.title || 'Join Our Mission'}</h2>
              <p className="text-xl text-orange-100 mb-10 leading-relaxed">
                {joinUs.description || 'Become a part of our community and help us make a difference in the lives of people in Gadchiroli.'}
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link 
                  to="/contact" 
                  className="bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all shadow-xl"
                >
                  {joinUs.buttonText || 'Join Us Now'}
                </Link>
                <Link 
                  to="/about" 
                  className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Committee */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8 border-b-2 border-navy pb-2">
                <Users className="text-navy" size={28} />
                <h2 className="text-2xl font-bold text-navy uppercase tracking-tight">
                  Trust Committee Members
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col items-center p-6 text-center group">
                      <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-gray-50 group-hover:border-orange-500 transition-all duration-500">
                        <img 
                          src={member.photoUrl} 
                          alt={member.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                      <p className="text-red-600 font-bold text-sm mt-1 uppercase tracking-wider">{member.designation}</p>
                      {member.phone && (
                        <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                          <Phone size={12} /> {member.phone}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center text-gray-400 italic bg-white rounded-xl border border-dashed">
                    No committee members added yet.
                  </div>
                )}
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-bold mb-6 text-gray-800">About Our Trust</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {aboutContent?.mission || "Amar Shahid Veerangana Rani Avantibai Lodhi Smarak Samiti Trust, Chikhli is dedicated to preserving the legacy of Rani Avantibai Lodhi and working towards the social and cultural upliftment of the community in Gadchiroli district."}
                </p>
                <Link to="/about" className="text-orange-600 font-bold flex items-center gap-2 hover:gap-4 transition-all">
                  Read More About Trust <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            {/* Right Column: Notices & Certificates */}
            <div className="space-y-8">
              
              {/* Latest Notices */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-red-600 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={20} />
                    <span className="font-bold uppercase tracking-wider">Latest News / Posts</span>
                  </div>
                  <span className="bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded animate-pulse">LIVE</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {latestPosts.length > 0 ? (
                    latestPosts.map((post) => (
                      <Link key={post.id} to={`/posts`} className="p-4 block hover:bg-gray-50 transition-colors">
                        <h4 className="text-sm font-bold text-gray-800 line-clamp-2">{post.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-1">{post.date}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-400 italic text-sm">
                      No news or posts posted yet.
                    </div>
                  )}
                </div>
                {latestPosts.length > 0 && (
                  <Link to="/posts" className="block p-3 text-center text-xs font-bold text-red-600 bg-gray-50 hover:bg-gray-100 transition-colors">
                    View All Posts
                  </Link>
                )}
              </div>

              {/* Important Certificates */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-blue-600">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    Important Certificates
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {certificates.length > 0 ? (
                    certificates.map((cert) => (
                      <a 
                        key={cert.id} 
                        href={cert.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-4 block hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <ExternalLink size={16} className="text-red-500 mt-1 shrink-0" />
                          <div>
                            <h4 className="text-blue-700 font-bold text-sm group-hover:underline">{cert.title}</h4>
                            <p className="text-gray-500 text-xs mt-1">{cert.description}</p>
                          </div>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-400 italic text-sm">
                      No certificates added yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-navy text-white p-6 rounded-lg shadow-lg">
                <h3 className="font-bold mb-4 border-b border-white/20 pb-2">Quick Links</h3>
                <ul className="space-y-3 text-sm">
                  {quickLinks.length > 0 ? (
                    quickLinks.map((link) => (
                      <li key={link.id}>
                        <a 
                          href={link.url} 
                          target={link.url.startsWith('http') ? "_blank" : "_self"} 
                          rel="noopener noreferrer" 
                          className="hover:text-orange-400 transition-colors flex items-center gap-2"
                        >
                          → {link.title}
                        </a>
                      </li>
                    ))
                  ) : (
                    <>
                      <li><Link to="/programs" className="hover:text-orange-400 transition-colors flex items-center gap-2">→ Government Schemes</Link></li>
                      <li><Link to="/meetings" className="hover:text-orange-400 transition-colors flex items-center gap-2">→ Gram Sabha Records</Link></li>
                      <li><Link to="/gallery" className="hover:text-orange-400 transition-colors flex items-center gap-2">→ Village Gallery</Link></li>
                      <li><Link to="/contact" className="hover:text-orange-400 transition-colors flex items-center gap-2">→ Contact Us</Link></li>
                    </>
                  )}
                </ul>
              </div>

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

