import React from 'react';
import { TrendingUp, Eye, User } from 'lucide-react';
import { motion } from 'framer-motion';

const TrendingNewsSection = ({ searchQuery }) => {
  const trendingArticles = [
    {
      id: 1,
      headline: 'Digital transformation initiative receives overwhelming public support',
      category: 'Technology',
      views: '12.4k',
      date: 'March 29, 2026',
      author: 'Vikram Singh'
    },
    {
      id: 2,
      headline: 'Economic indicators show positive growth trajectory for the quarter',
      category: 'Business',
      views: '9.8k',
      date: 'March 29, 2026',
      author: 'Anita Desai'
    },
    {
      id: 3,
      headline: 'Youth employment program creates thousands of new opportunities',
      category: 'National',
      views: '8.2k',
      date: 'March 28, 2026',
      author: 'Rajesh Kumar'
    },
    {
      id: 4,
      headline: 'Renewable energy projects set to power entire district by next year',
      category: 'State',
      views: '7.6k',
      date: 'March 28, 2026',
      author: 'Meera Patel'
    },
    {
      id: 5,
      headline: 'Cultural heritage sites receive UNESCO recognition and funding',
      category: 'Entertainment',
      views: '6.9k',
      date: 'March 27, 2026',
      author: 'Arjun Reddy'
    },
  ];

  const filteredArticles = searchQuery
    ? trendingArticles.filter(
        (article) =>
          article.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : trendingArticles;

  const getCategoryColor = (cat) => {
    const colors = {
      'National': 'text-primary',
      'State': 'text-secondary',
      'District': 'text-accent-foreground',
      'Politics': 'text-primary',
      'Business': 'text-secondary',
      'Technology': 'text-accent-foreground',
      'Sports': 'text-primary',
      'Entertainment': 'text-secondary',
    };
    return colors[cat] || 'text-muted-foreground';
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-10">
          <TrendingUp className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ letterSpacing: '-0.02em' }}>
              Trending now
            </h2>
            <p className="text-muted-foreground">Most viewed stories today</p>
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="text-6xl font-bold text-primary/20" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-sm font-semibold ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                      <span className="text-muted-foreground text-sm">•</span>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{article.views} views</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold leading-snug mb-2 hover:text-primary transition-colors duration-200">
                      {article.headline}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-muted-foreground text-sm mt-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> By {article.author}
                      </span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No trending articles found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingNewsSection;