import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, PlayCircle } from 'lucide-react';

const LiveChannelsSection = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveChannels = async () => {
    try {
      const records = await pb.collection('live_channels').getList(1, 50, {
        filter: 'is_active=true',
        sort: '-created',
        $autoCancel: false
      });
      setChannels(records.items);
    } catch (error) {
      console.error('Error fetching live channels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveChannels();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchActiveChannels();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getEmbedUrl = (platform, url) => {
    if (!url) return '';
    
    try {
      switch (platform) {
        case 'YouTube': {
          // Extract video ID from various YouTube URL formats
          let videoId = '';
          if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
          } else if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v');
          } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
          } else if (url.includes('youtube.com/live/')) {
            videoId = url.split('youtube.com/live/')[1]?.split('?')[0];
          }
          return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : url;
        }
        case 'Twitch': {
          // Extract channel name
          let channelName = '';
          if (url.includes('twitch.tv/')) {
            channelName = url.split('twitch.tv/')[1]?.split('?')[0];
          }
          const hostname = window.location.hostname;
          return channelName ? `https://player.twitch.tv/?channel=${channelName}&parent=${hostname}` : url;
        }
        case 'Facebook': {
          return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
        }
        case 'Custom':
        default:
          return url;
      }
    } catch (e) {
      console.error('Error parsing embed URL:', e);
      return url;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'YouTube': return 'bg-[hsl(var(--platform-youtube))] text-white';
      case 'Twitch': return 'bg-[hsl(var(--platform-twitch))] text-white';
      case 'Facebook': return 'bg-[hsl(var(--platform-facebook))] text-white';
      default: return 'bg-slate-800 text-white';
    }
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="flex items-center gap-3 mb-8">
          <Radio className="w-6 h-6 text-[hsl(var(--live-indicator))] animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold">Live Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-none shadow-md">
              <Skeleton className="w-full aspect-video rounded-none" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (channels.length === 0) {
    return null; // Hide section entirely if no active channels, or show empty state if preferred.
  }

  return (
    <section className="py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="relative flex h-4 w-4 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--live-indicator))] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(var(--live-indicator))]"></span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">Live Now</h2>
      </div>

      <div className={`grid grid-cols-1 gap-8 ${channels.length === 1 ? 'md:grid-cols-1 max-w-4xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {channels.map((channel) => (
          <Card key={channel.id} className="overflow-hidden border-none shadow-lg bg-card transition-all duration-300 hover:shadow-xl group">
            <div className="relative video-container bg-black">
              {/* If we want to show thumbnail first and play on click, we could implement that. 
                  For now, we embed the iframe directly. */}
              <iframe
                src={getEmbedUrl(channel.platform, channel.stream_url)}
                title={channel.channel_name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
              
              {/* Overlay badges that sit on top of the video container if needed, 
                  though iframes often sit on top. We'll put badges in the header instead. */}
            </div>
            
            <CardHeader className="p-5 pb-2">
              <div className="flex items-start justify-between gap-4 mb-2">
                <Badge className={`border-transparent font-semibold tracking-wide ${getPlatformColor(channel.platform)}`}>
                  {channel.platform}
                </Badge>
                <Badge variant="outline" className="bg-[hsl(var(--live-indicator))/10] text-[hsl(var(--live-indicator))] border-[hsl(var(--live-indicator))/20] live-pulse font-bold">
                  LIVE
                </Badge>
              </div>
              <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                {channel.channel_name}
              </CardTitle>
            </CardHeader>
            
            {channel.description && (
              <CardContent className="p-5 pt-0">
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {channel.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default LiveChannelsSection;