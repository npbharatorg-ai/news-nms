import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Briefcase, MapPin } from 'lucide-react';

const ReporterCard = ({ reporter }) => {
  if (!reporter) return null;

  const avatarUrl = reporter.photo ? pb.files.getUrl(reporter, reporter.photo) : '';
  const initials = reporter.name ? reporter.name.substring(0, 2).toUpperCase() : 'R';

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 mt-12 transition-all hover:shadow-md">
      <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
        <AvatarImage src={avatarUrl} alt={reporter.name} className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 text-center sm:text-left flex flex-col justify-center h-full">
        <h3 className="text-xl font-bold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
          {reporter.name}
        </h3>
        
        <div className="space-y-2">
          {reporter.designation && (
            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
              <Briefcase className="w-4 h-4 text-primary/70" />
              <span className="font-medium">{reporter.designation}</span>
            </div>
          )}
          
          {reporter.working_area && (
            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span>{reporter.working_area}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporterCard;