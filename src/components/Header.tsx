import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '../utils/cn';
import { subscribeToDocument } from '../services/firestoreService';
import { SiteSettings } from '../types';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About Trust', path: '/about' },
  { name: 'Programs', path: '/programs' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Meetings', path: '/meetings' },
  { name: 'Blog Posts', path: '/posts' },
  { name: 'Contact', path: '/contact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = subscribeToDocument<SiteSettings>('siteContent', 'settings', setSettings);
    return () => unsubscribe();
  }, []);

  const siteName = settings?.siteName || 'अमर शहीद वीरांगना रानी अवंतीबाई लोधी';
  const logoUrl = settings?.logoUrl || 'https://picsum.photos/seed/trust-logo/100/100';

  return (
    <header className="bg-[#1a233a] text-white py-3 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo & Title */}
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <div className="flex items-center gap-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/512px-Emblem_of_India.svg.png" 
              alt="Emblem" 
              className="h-10 md:h-12 w-auto brightness-200 contrast-200"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://www.india.gov.in/sites/upload_files/npi/files/logo_0.png';
              }}
            />
            <div className="h-10 md:h-12 w-px bg-white/20 mx-1 md:mx-2" />
            <img 
              src={logoUrl} 
              alt="Trust Logo" 
              className="h-10 md:h-12 w-10 md:w-12 rounded-full border border-white/20 object-contain bg-white"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Trust&background=EA580C&color=fff';
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl xl:text-2xl font-bold leading-tight tracking-wide">
              {siteName}
            </h1>
            <p className="text-[10px] md:text-xs xl:text-sm font-medium text-orange-400">
              स्मारक समिति ट्रस्ट, चिखली | कुरखेडा, गडचिरोली
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200',
                location.pathname === item.path
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-white/10 text-gray-200'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="xl:hidden p-2 rounded-md text-white hover:bg-white/10"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={cn(
          'xl:hidden fixed inset-0 bg-[#1a233a] z-40 transition-transform duration-300 transform pt-20',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col p-6 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'text-lg font-semibold py-3 px-4 rounded-lg border-b border-white/5',
                location.pathname === item.path ? 'bg-red-600 text-white' : 'text-gray-300'
              )}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

