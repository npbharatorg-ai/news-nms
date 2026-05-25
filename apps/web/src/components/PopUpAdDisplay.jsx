import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

const PopUpAdDisplay = () => {
  const [adsQueue, setAdsQueue] = useState([]);
  const [currentAd, setCurrentAd] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const records = await pb.collection('pop_up_ads').getFullList({
          filter: 'active=true',
          $autoCancel: false
        });

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const validAds = records.filter(ad => {
          const start = new Date(ad.start_date);
          const end = new Date(ad.end_date);
          end.setHours(23, 59, 59, 999); // End of the day

          if (now < start || now > end) return false;

          if (ad.display_frequency === 'once_per_session') {
            if (sessionStorage.getItem(`popup_${ad.id}`)) return false;
          } else if (ad.display_frequency === 'once_per_day') {
            if (localStorage.getItem(`popup_day_${ad.id}`) === todayStr) return false;
          }
          return true;
        });

        setAdsQueue(validAds);
      } catch (error) {
        console.error('Error fetching pop-up ads:', error);
      }
    };

    // Only fetch on initial load or route change if queue is empty
    if (adsQueue.length === 0 && !currentAd) {
      fetchAds();
    }
  }, [location.pathname]); // Re-evaluate on route change

  useEffect(() => {
    if (adsQueue.length > 0 && !currentAd) {
      // Small delay before showing ad
      const timer = setTimeout(() => {
        setCurrentAd(adsQueue[0]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [adsQueue, currentAd]);

  const handleClose = () => {
    if (!currentAd) return;
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (currentAd.display_frequency === 'once_per_session') {
      sessionStorage.setItem(`popup_${currentAd.id}`, 'true');
    } else if (currentAd.display_frequency === 'once_per_day') {
      localStorage.setItem(`popup_day_${currentAd.id}`, todayStr);
    }

    setAdsQueue(prev => prev.slice(1));
    setCurrentAd(null);
  };

  const handleActionClick = () => {
    if (currentAd?.link) {
      window.open(currentAd.link, '_blank');
      handleClose();
    }
  };

  if (!currentAd) return null;

  const imageUrl = currentAd.image ? pb.files.getUrl(currentAd, currentAd.image) : null;

  return (
    <AnimatePresence>
      {currentAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden border border-border z-10"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8 backdrop-blur-md"
            >
              <X className="h-4 w-4" />
            </Button>

            {imageUrl && (
              <div className="relative w-full aspect-video bg-muted">
                <img
                  src={imageUrl}
                  alt={currentAd.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-8 text-center">
              <h3 className="text-2xl font-bold mb-3 text-foreground leading-tight">
                {currentAd.title}
              </h3>
              
              {currentAd.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {currentAd.description}
                </p>
              )}

              {currentAd.link && (
                <Button 
                  onClick={handleActionClick}
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  Learn More
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PopUpAdDisplay;