import React, { useState, useEffect, useMemo } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NewsCard from '@/components/NewsCard.jsx';
import BreakingNewsFilter from '@/components/BreakingNewsFilter.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const BreakingNewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchBreakingNews = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      // Fetching from published_news where is_breaking is true
      // Note: published_news schema doesn't have a 'status' field, so we only filter by is_breaking
      const result = await pb.collection('published_news').getList(1, 50, {
        filter: 'is_breaking=true',
        sort: '-published_at',
        $autoCancel: false
      });
      setNews(result.items || []);
    } catch (err) {
      console.error('[BreakingNewsSection] Error fetching breaking news:', err);
      setError('Failed to load breaking news. Please try again.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakingNews();

    // Real-time subscription for new breaking news
    const subscribeToNews = async () => {
      try {
        await pb.collection('published_news').subscribe('*', (e) => {
          if (e.action === 'create' || e.action === 'update' || e.action === 'delete') {
            // Re-fetch to ensure correct sorting and filtering
            fetchBreakingNews(false);
          }
        });
      } catch (err) {
        console.error('[BreakingNewsSection] Subscription error:', err);
      }
    };

    subscribeToNews();

    return () => {
      pb.collection('published_news').unsubscribe('*').catch(console.error);
    };
  }, []);

  // Date calculations
  const { startOfToday, startOfYesterday, startOfLast7Days, startOfLast30Days } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    return {
      startOfToday: today,
      startOfYesterday: yesterday,
      startOfLast7Days: last7Days,
      startOfLast30Days: last30Days
    };
  }, []);

  // Calculate counts and filter news
  const { filteredNews, counts } = useMemo(() => {
    const countsObj = {
      'Today': 0,
      'Yesterday': 0,
      'This Week': 0,
      'This Month': 0,
      'All': news.length
    };

    const filtered = news.filter(item => {
      const pubDate = new Date(item.published_at || item.created);
      
      // Update counts
      if (pubDate >= startOfToday) countsObj['Today']++;
      if (pubDate >= startOfYesterday && pubDate < startOfToday) countsObj['Yesterday']++;
      if (pubDate >= startOfLast7Days) countsObj['This Week']++;
      if (pubDate >= startOfLast30Days) countsObj['This Month']++;

      // Apply active filter
      if (activeFilter === 'Today') return pubDate >= startOfToday;
      if (activeFilter === 'Yesterday') return pubDate >= startOfYesterday && pubDate < startOfToday;
      if (activeFilter === 'This Week') return pubDate >= startOfLast7Days;
      if (activeFilter === 'This Month') return pubDate >= startOfLast30Days;
      return true; // 'All'
    });

    return { filteredNews: filtered, counts: countsObj };
  }, [news, activeFilter, startOfToday, startOfYesterday, startOfLast7Days, startOfLast30Days]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-primary fill-primary animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Breaking News</h2>
        </div>
        
        <div className="w-full md:w-auto">
          <BreakingNewsFilter 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
            counts={counts} 
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Skeleton className="md:col-span-8 h-[400px] rounded-2xl" />
          <div className="md:col-span-4 flex flex-col gap-6">
            <Skeleton className="h-[190px] rounded-2xl" />
            <Skeleton className="h-[190px] rounded-2xl" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-destructive mb-3" />
          <p className="text-foreground font-medium mb-4">{error}</p>
          <Button onClick={() => fetchBreakingNews(true)} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      ) : filteredNews.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNews.length > 0 && (
              <motion.div 
                key={filteredNews[0].id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="md:col-span-8"
              >
                <NewsCard news={filteredNews[0]} variant="featured" />
              </motion.div>
            )}
            
            {filteredNews.length > 1 && (
              <div className="md:col-span-4 flex flex-col gap-6">
                {filteredNews.slice(1, 3).map((item, index) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex-1"
                  >
                    <NewsCard news={item} variant="featured" />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
          
          {/* Additional grid for remaining items if any */}
          {filteredNews.length > 3 && (
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
              {filteredNews.slice(3).map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <NewsCard news={item} variant="standard" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-muted/30 rounded-2xl p-16 text-center border border-dashed"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-muted p-4 rounded-full">
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <p className="text-foreground text-xl font-bold mb-2">No breaking news found</p>
          <p className="text-muted-foreground">
            There are no breaking news articles for the selected time period ({activeFilter}).
          </p>
          {activeFilter !== 'All' && (
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => setActiveFilter('All')}
            >
              View All Breaking News
            </Button>
          )}
        </motion.div>
      )}
    </section>
  );
};

export default BreakingNewsSection;