import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AboutContent, Member } from '../types';
import { getSingleDocument, subscribeToCollection } from '../services/firestoreService';
import { orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function About() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aboutData = await getSingleDocument<AboutContent>('siteContent', 'about');
        setContent(aboutData);
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const unsubscribe = subscribeToCollection<Member>('members', setMembers, orderBy('order', 'asc'));
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      <section className="bg-orange-600 py-20 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About the Trust</h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Honoring the legacy of Rani Avantibai Lodhi through service and heritage.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900 border-l-4 border-orange-600 pl-4">Our History</h2>
              <div className="text-gray-700 leading-relaxed mb-6 text-lg whitespace-pre-wrap">
                {content?.history || "The Amar Shahid Veerangana Rani Avantibai Lodhi Smarak Samiti Trust was founded with the primary objective of immortalizing the memory of Rani Avantibai Lodhi, a fearless queen who fought valiantly against British colonialism."}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src={content?.historyImageUrl || "https://picsum.photos/seed/history/800/600"}
                alt="Trust History"
                className="rounded-2xl shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-8 rounded-2xl hidden md:block">
                <p className="text-4xl font-bold">{content?.yearsOfService || '10'}+</p>
                <p className="text-sm font-medium">Years of Service</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-3xl shadow-lg border-t-8 border-orange-600">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {content?.mission || "To empower the local community through education, healthcare initiatives, and social awareness programs while preserving and promoting the rich cultural heritage of our region."}
              </p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg border-t-8 border-green-600">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {content?.vision || "To create a society where every individual has the opportunity to thrive, guided by the values of bravery, sacrifice, and community service exemplified by Rani Avantibai Lodhi."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">Our Leadership</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {members.map((member) => (
              <div key={member.id} className="group">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-square">
                  <img
                    src={member.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=EA580C&color=fff`}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
                <p className="text-orange-600 font-medium">{member.designation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
