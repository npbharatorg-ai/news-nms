import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/NewsCard.jsx';

const LatestNewsSection = ({ searchQuery }) => {
  const latestArticles = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1683890918267-4673173a4456',
      headline: 'New education policy aims to transform learning outcomes across the state',
      excerpt: 'The state government has introduced comprehensive reforms to modernize the education system, focusing on digital literacy and skill development for students.',
      category: 'State',
      date: 'March 29, 2026',
      author: 'Rajesh Kumar',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1690120225080-e48e3aea49de',
      headline: 'Infrastructure development project to connect rural areas with urban centers',
      excerpt: 'A major infrastructure initiative has been launched to improve connectivity and boost economic growth in rural regions through modern road networks.',
      category: 'District',
      date: 'March 28, 2026',
      author: 'Anita Desai',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6',
      headline: 'Technology sector shows remarkable growth with new startup initiatives',
      excerpt: 'The local technology ecosystem is thriving with innovative startups receiving substantial funding and support from government programs.',
      category: 'Business',
      date: 'March 28, 2026',
      author: 'Vikram Singh',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1663124178598-71717cdea439',
      headline: 'Healthcare facilities upgraded with advanced medical equipment',
      excerpt: 'District hospitals receive state-of-the-art medical technology to improve patient care and treatment outcomes across the region.',
      category: 'District',
      date: 'March 27, 2026',
      author: 'Meera Patel',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1669986955931-d5b410970ba1',
      headline: 'Environmental conservation efforts gain momentum with community participation',
      excerpt: 'Local communities join hands with authorities to implement sustainable practices and protect natural resources for future generations.',
      category: 'National',
      date: 'March 27, 2026',
      author: 'Arjun Reddy',
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1683890918267-4673173a4456',
      headline: 'Sports infrastructure development to nurture young talent',
      excerpt: 'New sports facilities and training centers are being established to provide world-class amenities for aspiring athletes.',
      category: 'Sports',
      date: 'March 26, 2026',
      author: 'Kavita Nair',
    },
  ];

  if (!latestArticles || !Array.isArray(latestArticles)) return null;

  const filteredArticles = searchQuery
    ? latestArticles.filter(
        (article) =>
          article?.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article?.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : latestArticles;

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
              Latest news
            </h2>
            <p className="text-muted-foreground">Stay updated with the most recent developments</p>
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {filteredArticles.map((article, index) => (
                <NewsCard key={article.id || index} news={{
                  id: article.id,
                  title: article.headline,
                  description: article.excerpt,
                  category: article.category,
                  created: article.date,
                  author_name: article.author,
                  photo1: null 
                }} variant="standard" />
              ))}
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="lg" className="transition-all duration-200 active:scale-[0.98]">
                View all latest news
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No articles found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestNewsSection;