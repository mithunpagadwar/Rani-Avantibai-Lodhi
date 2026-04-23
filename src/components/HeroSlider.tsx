import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Slider } from '../types';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

export default function HeroSlider() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'sliders'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Slider))
        .filter(s => s.imageUrl && s.imageUrl.trim() !== '');
      
      if (data.length > 0) {
        setSliders(data);
      } else {
        useFallback();
      }
    }, (error) => {
      console.error('Error fetching sliders:', error);
      useFallback();
    });

    function useFallback() {
      setSliders([
        {
          imageUrl: 'https://images.unsplash.com/photo-1621508654686-809f23efdaba?auto=format&fit=crop&q=80&w=1920&h=1080',
          title: 'Slide 1',
          description: '',
          order: 0
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1541976590-713ea5488c57?auto=format&fit=crop&q=80&w=1920&h=1080',
          title: 'Slide 2',
          description: '',
          order: 1
        }
      ]);
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (sliders.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % sliders.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);

  if (sliders.length === 0) return <div className="h-full w-full bg-gray-100 animate-pulse" />;

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-200">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img 
            src={sliders[currentIndex].imageUrl} 
            alt="Slider Display"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1621508654686-809f23efdaba?auto=format&fit=crop&q=80&w=1920&h=1080';
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all z-10"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all z-10"
      >
        <ChevronRight size={32} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {sliders.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              idx === currentIndex ? "bg-orange-600 w-8" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
