import React from 'react';
import { Flag, MapPin, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/NewsCard.jsx';

const CategorySections = ({ searchQuery }) => {
  const categories = [
    {
      id: 'national',
      title: 'National news',
      icon: Flag,
      color: 'text-primary',
      articles: [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1683890918267-4673173a4456',
          headline: 'Parliament passes landmark legislation for digital governance',
          excerpt: 'The new bill aims to streamline government services and improve citizen access to public information through digital platforms.',
          category: 'National',
          date: 'March 29, 2026',
          author: 'Sanjay Gupta',
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1690120225080-e48e3aea49de',
          headline: 'National security framework updated to address emerging threats',
          excerpt: 'Comprehensive measures introduced to strengthen defense capabilities and protect critical infrastructure.',
          category: 'National',
          date: 'March 28, 2026',
          author: 'Deepa Menon',
        },
        {
          id: 3,
          image: 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6',
          headline: 'Economic reforms boost manufacturing sector growth',
          excerpt: 'New policies encourage domestic production and create employment opportunities across industries.',
          category: 'National',
          date: 'March 27, 2026',
          author: 'Amit Verma',
        },
        {
          id: 4,
          image: 'https://images.unsplash.com/photo-1663124178598-71717cdea439',
          headline: 'National education summit addresses quality and accessibility',
          excerpt: 'Stakeholders discuss strategies to improve learning outcomes and expand educational opportunities.',
          category: 'National',
          date: 'March 26, 2026',
          author: 'Neha Kapoor',
        },
      ],
    },
    {
      id: 'state',
      title: 'State news',
      icon: MapPin,
      color: 'text-secondary',
      articles: [
        {
          id: 5,
          image: 'https://images.unsplash.com/photo-1669986955931-d5b410970ba1',
          headline: 'State budget allocates record funding for healthcare infrastructure',
          excerpt: 'Major investments planned to upgrade hospitals and expand medical services in underserved areas.',
          category: 'State',
          date: 'March 29, 2026',
          author: 'Ravi Shankar',
        },
        {
          id: 6,
          image: 'https://images.unsplash.com/photo-1683890918267-4673173a4456',
          headline: 'Agricultural reforms promise better income for farmers',
          excerpt: 'New policies focus on sustainable farming practices and direct market access for producers.',
          category: 'State',
          date: 'March 28, 2026',
          author: 'Lakshmi Iyer',
        },
        {
          id: 7,
          image: 'https://images.unsplash.com/photo-1690120225080-e48e3aea49de',
          headline: 'Tourism sector receives boost with heritage site development',
          excerpt: 'State government invests in preserving cultural landmarks and promoting sustainable tourism.',
          category: 'State',
          date: 'March 27, 2026',
          author: 'Karthik Reddy',
        },
        {
          id: 8,
          image: 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6',
          headline: 'Public transport network expansion to improve urban mobility',
          excerpt: 'New metro lines and bus routes planned to reduce congestion and pollution in major cities.',
          category: 'State',
          date: 'March 26, 2026',
          author: 'Pooja Malhotra',
        },
      ],
    },
    {
      id: 'district',
      title: 'District news',
      icon: Building2,
      color: 'text-accent-foreground',
      articles: [
        {
          id: 9,
          image: 'https://images.unsplash.com/photo-1663124178598-71717cdea439',
          headline: 'Local administration launches smart city initiatives',
          excerpt: 'Digital infrastructure and IoT solutions implemented to improve civic services and quality of life.',
          category: 'District',
          date: 'March 29, 2026',
          author: 'Suresh Babu',
        },
        {
          id: 10,
          image: 'https://images.unsplash.com/photo-1669986955931-d5b410970ba1',
          headline: 'Community health centers receive modern medical equipment',
          excerpt: 'District hospitals equipped with advanced diagnostic tools to enhance patient care.',
          category: 'District',
          date: 'March 28, 2026',
          author: 'Anjali Rao',
        },
        {
          id: 11,
          image: 'https://images.unsplash.com/photo-1683890918267-4673173a4456',
          headline: 'Skill development programs empower local youth',
          excerpt: 'Training initiatives prepare young people for emerging job opportunities in various sectors.',
          category: 'District',
          date: 'March 27, 2026',
          author: 'Manoj Kumar',
        },
        {
          id: 12,
          image: 'https://images.unsplash.com/photo-1690120225080-e48e3aea49de',
          headline: 'Water conservation projects address drought concerns',
          excerpt: 'Innovative solutions implemented to ensure sustainable water supply for agriculture and households.',
          category: 'District',
          date: 'March 26, 2026',
          author: 'Divya Nair',
        },
      ],
    },
  ];

  if (!categories || !Array.isArray(categories)) return null;

  return (
    <div className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categories.map((category, catIndex) => {
          if (!category?.articles || !Array.isArray(category.articles)) return null;

          const filteredArticles = searchQuery
            ? category.articles.filter(
                (article) =>
                  article?.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  article?.category?.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : category.articles;

          if (filteredArticles.length === 0 && searchQuery) return null;

          const Icon = category.icon;

          return (
            <section key={category.id || catIndex} id={category.id} className={catIndex > 0 ? 'mt-20' : ''}>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  {Icon && <Icon className={`w-8 h-8 ${category.color || ''}`} />}
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold" style={{ letterSpacing: '-0.02em' }}>
                      {category.title || 'Category'}
                    </h2>
                    <p className="text-muted-foreground">Latest updates from across the region</p>
                  </div>
                </div>
                <Button variant="ghost" className="hidden md:flex items-center gap-2 transition-all duration-200 active:scale-[0.98]">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredArticles.map((article, index) => (
                  <NewsCard key={article.id || index} news={{
                    id: article.id,
                    title: article.headline,
                    description: article.excerpt,
                    category: article.category,
                    created: article.date,
                    photo1: null
                  }} variant="standard" />
                ))}
              </div>

              <div className="flex justify-center mt-8 md:hidden">
                <Button variant="outline" className="transition-all duration-200 active:scale-[0.98]">
                  View all {category.title?.toLowerCase() || 'news'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySections;