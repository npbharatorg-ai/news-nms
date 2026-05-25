import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient.js';

const CustomAdCarousel = ({ ads }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-advance carousel
  useEffect(() => {
    if (ads.length <= 1 || isHovered) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [ads.length, isHovered]);

  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  if (!ads || ads.length === 0) return null;

  const currentAd = ads[currentIndex];
  const imageUrl = currentAd.image ? pb.files.getUrl(currentAd, currentAd.image) : null;

  const AdContent = () => (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-100 overflow-hidden rounded-2xl group">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={currentAd.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <span className="text-xl font-bold text-primary/50">{currentAd.title}</span>
        </div>
      )}
      
      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-2 bg-primary/90 hover:bg-primary text-white border-none backdrop-blur-sm">Sponsored</Badge>
            <h3 className="text-xl md:text-2xl font-bold leading-tight mb-1">{currentAd.title}</h3>
            {currentAd.description && (
              <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-2xl">
                {currentAd.description}
              </p>
            )}
          </div>
          {currentAd.link && (
            <div className="hidden sm:flex shrink-0 bg-white/20 backdrop-blur-md p-3 rounded-full group-hover:bg-white group-hover:text-primary transition-colors duration-300">
              <ExternalLink className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Simple Badge component inline to avoid extra imports if not needed globally
  const Badge = ({ children, className }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
      {children}
    </span>
  );

  return (
    <div 
      className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-2xl overflow-hidden shadow-lg border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {currentAd.link ? (
            <a href={currentAd.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
              <AdContent />
            </a>
          ) : (
            <div className="w-full h-full">
              <AdContent />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {ads.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            onClick={handlePrevious}
            aria-label="Previous ad"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            onClick={handleNext}
            aria-label="Next ad"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to ad ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomAdCarousel;