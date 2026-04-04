import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Meeting } from '../types';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar as CalendarIcon } from 'lucide-react';

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting));
      setMeetings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <section className="bg-green-800 py-20 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Meeting Records</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Transparency and documentation of our trust's decision-making process.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          ) : meetings.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {meetings.map((meeting, idx) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <CalendarIcon size={14} />
                        {new Date(meeting.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {meeting.pdfUrl && (
                      <a
                        href={meeting.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Download size={18} />
                        View PDF
                      </a>
                    )}
                    {meeting.notes && (
                      <button
                        onClick={() => alert(meeting.notes)}
                        className="text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        Read Notes
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">No meeting records found.</div>
          )}
        </div>
      </section>
    </div>
  );
}
