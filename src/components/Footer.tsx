import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { subscribeToDocument, getCollection } from '../services/firestoreService';
import { SiteSettings, QuickLink } from '../types';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToDocument<SiteSettings>('siteContent', 'settings', setSettings);
    getCollection<QuickLink>('quickLinks').then(links => {
      setQuickLinks(links.sort((a, b) => a.order - b.order));
    });
    return () => unsubscribe();
  }, []);

  const siteName = settings?.siteName || 'Amar Shahid Veerangana Rani Avantibai Lodhi Smarak Samiti Trust';
  const address = settings?.address || 'Chikhli, Kurkheda, Gadchiroli, Maharashtra';
  const phone = settings?.contactPhone || '+91 XXXXXXXXXX';
  const email = settings?.contactEmail || 'info@trustname.org';
  const footerText = settings?.footerText || `© ${new Date().getFullYear()} ${siteName}. All Rights Reserved.`;

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* About */}
        <div>
          <h3 className="text-xl font-bold mb-6 text-orange-500">About Trust</h3>
          <p className="text-gray-400 leading-relaxed mb-6">
            {siteName} is dedicated to preserving the legacy of Rani Avantibai and serving the community through various social and cultural programs.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-orange-500 transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-orange-500 transition-colors"><Twitter size={20} /></a>
            <a href="#" className="hover:text-orange-500 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-orange-500 transition-colors"><Youtube size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-6 text-orange-500">Quick Links</h3>
          <ul className="space-y-3">
            <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Trust</Link></li>
            <li><Link to="/programs" className="text-gray-400 hover:text-white transition-colors">Our Programs</Link></li>
            <li><Link to="/gallery" className="text-gray-400 hover:text-white transition-colors">Photo Gallery</Link></li>
            <li><Link to="/posts" className="text-gray-400 hover:text-white transition-colors">Blog Posts</Link></li>
            {quickLinks.map(link => (
              <li key={link.id}>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  {link.title} <ExternalLink size={12} />
                </a>
              </li>
            ))}
            <li><Link to="/admin" className="text-gray-400 hover:text-white transition-colors">Admin Login</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-bold mb-6 text-orange-500">Contact Us</h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-gray-400">
              <MapPin className="shrink-0 text-orange-500" size={20} />
              <span>{address}</span>
            </li>
            <li className="flex gap-3 text-gray-400">
              <Phone className="shrink-0 text-orange-500" size={20} />
              <span>{phone}</span>
            </li>
            <li className="flex gap-3 text-gray-400">
              <Mail className="shrink-0 text-orange-500" size={20} />
              <span>{email}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-bold mb-6 text-orange-500">Newsletter</h3>
          <p className="text-gray-400 mb-4">Subscribe to get updates on our programs and events.</p>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Your Email"
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-orange-500"
            />
            <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 rounded transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>{footerText}</p>
      </div>
    </footer>
  );
}
