import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const FeaturedNewsSection = () => {
  const featuredArticle = {
    image: 'https://images.unsplash.com/photo-1662485732745-5a841bfe7f65',
    headline: 'Government announces comprehensive reforms to strengthen democratic institutions',
    description: 'In a landmark decision, the administration has unveiled a series of reforms aimed at enhancing transparency, accountability, and citizen participation in governance processes across all levels.',
    category: 'National',
    date: 'March 29, 2026',
    author: 'Priya Sharma',
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl group"
        >
          <div className="relative aspect-[21/9] md:aspect-[21/8]">
            <img
              src={featuredArticle.image}
              alt={featuredArticle.headline}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 hero-overlay" />
            
            <div className="absolute inset-0 flex items-end">
              <div className="p-6 md:p-10 lg:p-12 max-w-4xl">
                <div className="mb-4">
                  <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
                    {featuredArticle.category}
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                  {featuredArticle.headline}
                </h2>
                
                <p className="text-white/90 text-base md:text-lg leading-relaxed mb-6 max-w-3xl">
                  {featuredArticle.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 mb-6 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredArticle.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>By {featuredArticle.author}</span>
                  </div>
                </div>
                
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]">
                  Read full story
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedNewsSection;