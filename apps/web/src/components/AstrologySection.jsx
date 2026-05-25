import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const AstrologySection = () => {
  const [horoscopes, setHoroscopes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAstrology = async () => {
      try {
        const records = await pb.collection('astrology').getList(1, 12, {
          sort: 'zodiac_sign',
          $autoCancel: false
        });
        setHoroscopes(records.items);
      } catch (error) {
        console.error('Error fetching astrology:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAstrology();

    pb.collection('astrology').subscribe('*', (e) => {
      setHoroscopes((prev) => {
        if (e.action === 'create') return [...prev, e.record];
        if (e.action === 'update') return prev.map(item => item.id === e.record.id ? e.record : item);
        if (e.action === 'delete') return prev.filter(item => item.id !== e.record.id);
        return prev;
      });
    });

    return () => pb.collection('astrology').unsubscribe('*');
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  if (horoscopes.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-bold">Daily Horoscope</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {horoscopes.map((sign, index) => (
          <motion.div
            key={sign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full hover:shadow-md transition-all hover:-translate-y-1 border-purple-100 dark:border-purple-900/30">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg capitalize flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                    {sign.zodiac_sign}
                  </h3>
                  {sign.lucky_color && (
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm border border-border" 
                      style={{ backgroundColor: sign.lucky_color.toLowerCase() }}
                      title={`Lucky Color: ${sign.lucky_color}`}
                    />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                  {sign.prediction}
                </p>
                
                <div className="grid grid-cols-2 gap-2 pt-3 border-t text-xs mt-auto">
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <span className="block text-muted-foreground mb-0.5">Number</span>
                    <span className="font-bold">{sign.lucky_number || '-'}</span>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <span className="block text-muted-foreground mb-0.5">Mood</span>
                    <span className="font-medium capitalize truncate block">{sign.mood || '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AstrologySection;