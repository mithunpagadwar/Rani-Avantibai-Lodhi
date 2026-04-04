import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { motion } from 'framer-motion';
import { User, Calendar, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (selectedPost) {
    return (
      <div className="pt-24 min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-orange-600 font-bold mb-8 hover:underline"
          >
            ← Back to Posts
          </button>
          
          {selectedPost.imageUrl && (
            <img
              src={selectedPost.imageUrl}
              alt={selectedPost.title}
              className="w-full h-[400px] object-cover rounded-3xl mb-8 shadow-xl"
            />
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            {selectedPost.title}
          </h1>
          
          <div className="flex items-center gap-6 text-gray-500 mb-10 border-b pb-6">
            <div className="flex items-center gap-2">
              <User size={18} className="text-orange-600" />
              <span>{selectedPost.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-orange-600" />
              <span>{new Date(selectedPost.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none prose-orange">
            <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <section className="bg-orange-700 py-20 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Posts</h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Insights, stories, and updates from the Amar Shahid Veerangana Rani Avantibai Lodhi Trust.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <div key={i} className="h-96 bg-white rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col group cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  {post.imageUrl && (
                    <div className="h-56 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold">
                        {post.author}
                      </span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 mb-6 flex-grow">
                      {post.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-2 text-orange-600 font-bold group-hover:gap-4 transition-all">
                      Read Full Post <ArrowRight size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">No posts published yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
