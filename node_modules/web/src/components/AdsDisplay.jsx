import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import CustomAdCarousel from './CustomAdCarousel.jsx';
import { Skeleton } from '@/components/ui/skeleton';

const AdsDisplay = ({ className = '' }) => {
  const [settings, setSettings] = useState(null);
  const [customAds, setCustomAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdsData = async () => {
      try {
        // Fetch settings
        const settingsRes = await pb.collection('ads_settings').getList(1, 1, { $autoCancel: false });
        const currentSettings = settingsRes.items[0] || null;
        setSettings(currentSettings);

        // Fetch custom ads if enabled
        if (currentSettings?.custom_ads_enabled) {
          const adsRes = await pb.collection('ads').getList(1, 10, {
            filter: 'ad_type="custom" && is_enabled=true',
            sort: '-created',
            $autoCancel: false
          });
          setCustomAds(adsRes.items);
        }
      } catch (error) {
        console.error('Error fetching ads for display:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdsData();
  }, []);

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <Skeleton className="w-full h-[200px] md:h-[300px] rounded-2xl" />
      </div>
    );
  }

  if (!settings) return null;

  const showGoogleAds = settings.google_ads_enabled && settings.google_ads_code;
  const showCustomAds = settings.custom_ads_enabled && customAds.length > 0;

  if (!showGoogleAds && !showCustomAds) return null;

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Custom Ads Carousel */}
      {showCustomAds && (
        <div className="w-full group">
          <CustomAdCarousel ads={customAds} />
        </div>
      )}

      {/* Google Ads Container */}
      {showGoogleAds && (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center min-h-[100px] overflow-hidden">
          <div 
            className="w-full flex justify-center"
            dangerouslySetInnerHTML={{ __html: settings.google_ads_code }} 
          />
        </div>
      )}
    </div>
  );
};

export default AdsDisplay;