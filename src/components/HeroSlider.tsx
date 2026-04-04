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
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slider));
      if (data.length > 0) {
        setSliders(data);
      } else {
        // Fallback default sliders if none in DB
        setSliders([
          {
            imageUrl: 'https://picsum.photos/seed/trust1/1920/1080',
            title: 'Welcome to Rani Avantibai Lodhi Trust',
            description: 'Dedicated to the memory of Amar Shahid Veerangana Rani Avantibai Lodhi.',
            order: 0
          },
          {
            imageUrl: 'https://picsum.photos/seed/trust2/1920/1080',
            title: 'Empowering the Community',
            description: 'Join us in our mission to bring positive change and social welfare.',
            order: 1
          }
        ]);
      }
    });
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

  if (sliders.length === 0) return <div className="h-screen bg-gray-100 animate-pulse" />;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <img 
              src={sliders[currentIndex].imageUrl} 
              alt={sliders[currentIndex].title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl"
            >
              {sliders[currentIndex].title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl mb-8 max-w-2xl text-gray-200"
            >
              {sliders[currentIndex].description}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/about"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
              >
                Read More
              </Link>
            </motion.div>
          </div>
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
