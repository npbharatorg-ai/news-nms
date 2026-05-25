import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 font-bold text-foreground/80 hover:text-foreground hover:bg-accent"
        >
          <Globe className="w-4 h-4" />
          <span className="uppercase">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={`cursor-pointer font-medium ${language === 'en' ? 'bg-accent text-accent-foreground' : ''}`}
        >
          English (EN)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('hi')}
          className={`cursor-pointer font-medium ${language === 'hi' ? 'bg-accent text-accent-foreground' : ''}`}
        >
          हिंदी (HI)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;