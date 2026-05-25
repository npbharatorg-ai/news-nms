import React from 'react';
import { cn } from '@/lib/utils';

const FILTERS = ['Today', 'Yesterday', 'This Week', 'This Month', 'All'];

const BreakingNewsFilter = ({ activeFilter, onFilterChange, counts }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter;
        const count = counts[filter] || 0;
        
        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md scale-105" 
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            <span>{filter}</span>
            <span 
              className={cn(
                "flex items-center justify-center px-2 py-0.5 rounded-full text-xs transition-colors duration-300",
                isActive 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-background text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BreakingNewsFilter;