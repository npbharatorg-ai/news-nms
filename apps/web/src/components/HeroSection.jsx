import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-secondary to-secondary/95 text-secondary-foreground overflow-hidden py-20 lg:py-28">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl mix-blend-screen"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent rounded-full blur-3xl mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Large Prominent Logo */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <img 
            src="https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/97a02dc29cc61427050fb8669736d0b9.jpg" 
            alt="Navdhriti Manayadhikar Logo" 
            className="w-[280px] sm:w-[350px] md:w-[450px] lg:w-[500px] h-auto object-contain mx-auto drop-shadow-2xl rounded-2xl"
          />
        </div>

        {/* Tagline & Subtitle */}
        <div className="space-y-4 mb-10 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-150 fill-mode-both">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
            Sach Saahas Nyaay Kee Khabar
          </h1>
          <p className="text-lg md:text-xl text-secondary-foreground/90 font-medium max-w-2xl mx-auto">
            Your trusted source for daily news. Bringing truth, courage, and justice to every story.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 fill-mode-both">
          <form onSubmit={handleSearch} className="relative flex items-center shadow-2xl rounded-full bg-background p-2">
            <Search className="absolute left-6 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search latest news, topics, or reporters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 pl-14 pr-4 py-4 text-foreground text-lg rounded-full focus:outline-none"
            />
            <Button 
              type="submit" 
              size="lg"
              className="rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-lg shrink-0"
            >
              Search
            </Button>
          </form>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;