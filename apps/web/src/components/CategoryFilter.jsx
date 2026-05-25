import React from 'react';

const CATEGORIES = [
  'All Categories',
  'Politics',
  'Sports',
  'Entertainment',
  'Business',
  'Health',
  'Technology'
];

const CategoryFilter = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex items-center gap-3 min-w-max">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`
                px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap
                ${isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-105'}
              `}
              aria-pressed={isActive}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;