import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Flag, Building2, Globe, Briefcase, HeartPulse, Trophy, MonitorPlay, Zap, Leaf, Car, ShieldAlert, GraduationCap, Film, Landmark, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import NewsCard from '@/components/NewsCard.jsx';
import AdsDisplay from '@/components/AdsDisplay.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useSEO } from '@/hooks/useSEO.jsx';
import { generateBreadcrumbSchema } from '@/utils/schemaGenerator.js';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'All News', name: 'All News', icon: Globe, color: 'bg-blue-50 text-blue-600', desc: 'All latest news and updates.' },
    { id: 'Agriculture', name: 'Agriculture', icon: Leaf, color: 'bg-green-50 text-green-600', desc: 'Farming and agriculture news.' },
    { id: 'Automobile', name: 'Automobile', icon: Car, color: 'bg-slate-100 text-slate-600', desc: 'Cars, bikes, and auto industry.' },
    { id: 'Breaking News', name: 'Breaking News', icon: Zap, color: 'bg-red-50 text-red-600', desc: 'Urgent and breaking updates.' },
    { id: 'Business', name: 'Business', icon: Briefcase, color: 'bg-indigo-50 text-indigo-600', desc: 'Markets and corporate updates.' },
    { id: 'Crime', name: 'Crime', icon: ShieldAlert, color: 'bg-orange-50 text-orange-600', desc: 'Crime and law enforcement.' },
    { id: 'District News', name: 'District News', icon: MapPin, color: 'bg-amber-50 text-amber-600', desc: 'Local district updates.' },
    { id: 'Education', name: 'Education', icon: GraduationCap, color: 'bg-cyan-50 text-cyan-600', desc: 'Schools, colleges, and exams.' },
    { id: 'Entertainment', name: 'Entertainment', icon: Film, color: 'bg-pink-50 text-pink-600', desc: 'Movies, music, and pop culture.' },
    { id: 'Health', name: 'Health', icon: HeartPulse, color: 'bg-rose-50 text-rose-600', desc: 'Medical and wellness news.' },
    { id: 'Politics', name: 'Politics', icon: Landmark, color: 'bg-purple-50 text-purple-600', desc: 'Government and political affairs.' },
    { id: 'Sports', name: 'Sports', icon: Trophy, color: 'bg-yellow-50 text-yellow-600', desc: 'Match highlights and sports.' },
    { id: 'Technology', name: 'Technology', icon: MonitorPlay, color: 'bg-teal-50 text-teal-600', desc: 'Gadgets and tech trends.' },
    { id: 'National', name: 'National', icon: Flag, color: 'bg-blue-50 text-blue-600', desc: 'Top stories across the country.' },
  ];

  const categoryObj = selectedCategory ? categories.find(cat => cat.id === selectedCategory) : null;
  
  const seoTags = useSEO({
    title: selectedCategory ? `${categoryObj?.name || selectedCategory} News` : 'News Categories',
    description: selectedCategory ? categoryObj?.desc : 'Browse news by categories including National, State, District, and more.',
    url: selectedCategory ? `/categories?category=${selectedCategory}` : '/categories',
    schemas: [
      generateBreadcrumbSchema([
        { name: 'Home', url: 'https://nms.news/' },
        { name: 'Categories', url: 'https://nms.news/categories' },
        ...(selectedCategory ? [{ name: selectedCategory, url: `https://nms.news/categories?category=${selectedCategory}` }] : [])
      ])
    ]
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const newCounts = {};
        
        await Promise.all(categories.map(async (cat) => {
          let filterStr = 'status="published"';
          if (cat.id !== 'All News') {
            filterStr += ` && category="${cat.id}"`;
          }
          const result = await pb.collection('news').getList(1, 1, {
            filter: filterStr,
            $autoCancel: false
          });
          newCounts[cat.id] = result.totalItems;
        }));
        
        setCounts(newCounts);
      } catch (error) {
        console.error('[CategoriesPage] Error fetching category counts:', error);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCounts();
  }, []);

  const fetchArticles = async () => {
    if (!selectedCategory) return;
    
    setLoadingArticles(true);
    setError(null);
    try {
      let filterStr = 'status="published"';
      if (selectedCategory !== 'All News') {
        filterStr += ` && category="${selectedCategory}"`;
      }
      const result = await pb.collection('news').getList(1, 50, {
        filter: filterStr,
        sort: '-created_at',
        $autoCancel: false
      });
      
      setArticles(result.items || []);
    } catch (err) {
      console.error('[CategoriesPage] Error fetching articles:', err);
      setError('Failed to load articles for this category.');
      setArticles([]);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories?category=${categoryId}`);
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  if (selectedCategory) {
    const category = categories.find(cat => cat.id === selectedCategory);
    const Icon = category?.icon || Flag;

    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        {seoTags}
        <Header />

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto mb-8">
            <AdsDisplay />
          </div>

          <div className="max-w-7xl mx-auto">
            <Button variant="ghost" onClick={handleBackToCategories} className="mb-8">
              ← Back to Categories
            </Button>

            <div className="flex items-center gap-4 mb-12">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${category?.color || 'bg-primary/10 text-primary'}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {category?.name || selectedCategory}
                </h1>
                <p className="text-lg text-slate-600 mt-1">
                  {category?.desc || `Browse all ${selectedCategory} articles`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 xl:col-span-9">
                {loadingArticles ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-12 text-center flex flex-col items-center">
                    <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                    <p className="text-foreground font-medium mb-4">{error}</p>
                    <Button onClick={fetchArticles} variant="outline" className="gap-2">
                      <RefreshCw className="w-4 h-4" /> Retry
                    </Button>
                  </div>
                ) : articles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {articles.map(article => (
                      <NewsCard key={article.id} news={article} variant="standard" />
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-2xl p-16 text-center border border-dashed">
                    <p className="text-muted-foreground text-lg font-medium">No articles found</p>
                    <p className="text-sm text-muted-foreground mt-2">Check back later for updates in this category.</p>
                  </div>
                )}
              </div>
              
              <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
                <div className="sticky top-24">
                  <h2 className="text-lg font-bold mb-4 text-muted-foreground uppercase tracking-wider">Sponsored</h2>
                  <AdsDisplay />
                </div>
              </aside>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-12">
            <AdsDisplay />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {seoTags}
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mb-12">
          <AdsDisplay />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Explore News by Category
            </h1>
            <p className="text-lg text-slate-600">
              Dive into the topics that matter most to you. From hyper-local district updates to major national headlines, find all your news organized in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = counts[category.id] || 0;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group block h-full text-left"
                >
                  <Card className="h-full border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      
                      <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h2>
                      
                      <p className="text-sm text-slate-600 mb-6 flex-1">
                        {category.desc}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <span className="text-sm font-medium text-slate-500">
                          {loadingCounts ? '...' : `${count} Articles`}
                        </span>
                        <span className="text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          View All &rarr;
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16">
          <AdsDisplay />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoriesPage;