import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import CategoryFilter from '@/components/CategoryFilter.jsx';
import NewsCard from '@/components/NewsCard.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, RefreshCw, FileQuestion, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import AdsDisplay from '@/components/AdsDisplay.jsx';
import WeatherSection from '@/components/WeatherSection.jsx';
import AstrologySection from '@/components/AstrologySection.jsx';
import MarketUpdatesSection from '@/components/MarketUpdatesSection.jsx';

const getDateStrings = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  return { today: todayStr, yesterday: yesterdayStr, tomorrow: tomorrowStr };
};

const HomePage = () => {
  const [allMergedNews, setAllMergedNews] = useState([]);
  const [displayedNews, setDisplayedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [dateFilter, setDateFilter] = useState('All');
  const [sortBy, setSortBy] = useState('-published_at');
  const [searchQuery, setSearchQuery] = useState('');

  const [counts, setCounts] = useState({ today: 0, yesterday: 0, all: 0 });
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const fetchReporterNews = async (filterStr) => {
    console.log('[HomePage] 📡 Fetching reporter_news with filter:', filterStr);
    try {
      const res = await pb.collection('reporter_news').getList(1, 500, {
        filter: filterStr || 'status = "approved"',
        sort: '-created',
        $autoCancel: false
      });
      console.log(`[HomePage] ✅ reporter_news fetch success: ${res.items.length} items`);
      return res.items.map(item => ({
        ...item,
        content: item.content || '',
        image: item.image,
        published_at: item.published_at || item.created_at || item.created
      }));
    } catch (err) {
      console.error('[HomePage] ❌ reporter_news fetch ERROR:', err.status, err.message, err.data);
      return [];
    }
  };

  const fetchNewsCollection = async (filterStr) => {
    console.log('[HomePage] 📡 Fetching news with filter:', filterStr);
    try {
      const res = await pb.collection('news').getList(1, 500, {
        filter: filterStr || '',
        sort: '-created',
        $autoCancel: false
      });
      console.log(`[HomePage] ✅ news fetch success: ${res.items.length} items`);
      return res.items.map(item => ({
        ...item,
        content: item.description || item.content || '',
        image: item.photo1,
        published_at: item.created_at || item.created
      }));
    } catch (err) {
      console.error('[HomePage] ❌ news fetch ERROR:', err.status, err.message, err.data);
      return [];
    }
  };

  const fetchPublishedNewsCollection = async (filterStr) => {
    console.log('[HomePage] 📡 Fetching published_news with filter:', filterStr);
    try {
      const res = await pb.collection('published_news').getList(1, 500, {
        filter: filterStr || '',
        sort: '-published_at',
        $autoCancel: false
      });
      console.log(`[HomePage] ✅ published_news fetch success: ${res.items.length} items`);
      return res.items.map(item => ({
        ...item,
        title: item.headline || item.title,
        content: item.content || item.excerpt || '',
        image: item.image,
        published_at: item.published_at || item.created,
        category: item.category
      }));
    } catch (err) {
      console.error('[HomePage] ❌ published_news fetch ERROR:', err.status, err.message, err.data);
      return [];
    }
  };

  useEffect(() => {
    const fetchTabCounts = async () => {
      const dates = getDateStrings();

      // Build base filters
      let rnFilters = ['status = "approved"'];
      if (activeCategory !== 'All Categories') {
        rnFilters.push(`category = "${activeCategory}"`);
      }
      if (searchQuery.trim()) {
        rnFilters.push(`(title ~ "${searchQuery.trim()}" || content ~ "${searchQuery.trim()}")`);
      }
      const rnBaseStr = rnFilters.join(' && ');

      let nFilters = [];
      if (activeCategory !== 'All Categories') {
        nFilters.push(`category = "${activeCategory}"`);
      }
      if (searchQuery.trim()) {
        nFilters.push(`(title ~ "${searchQuery.trim()}" || description ~ "${searchQuery.trim()}")`);
      }
      const nBaseStr = nFilters.length > 0 ? nFilters.join(' && ') : '';

      let pnFilters = [];
      if (activeCategory !== 'All Categories') {
        pnFilters.push(`category = "${activeCategory}"`);
      }
      if (searchQuery.trim()) {
        pnFilters.push(`(headline ~ "${searchQuery.trim()}" || content ~ "${searchQuery.trim()}")`);
      }
      const pnBaseStr = pnFilters.length > 0 ? pnFilters.join(' && ') : '';

      const todayFilter = `created >= "${dates.today} 00:00:00" && created < "${dates.tomorrow} 00:00:00"`;
      const yesterdayFilter = `created >= "${dates.yesterday} 00:00:00" && created < "${dates.today} 00:00:00"`;

      try {
        const results = await Promise.allSettled([
          pb.collection('reporter_news').getList(1, 1, { filter: `${rnBaseStr} && ${todayFilter}`, $autoCancel: false }),
          pb.collection('reporter_news').getList(1, 1, { filter: `${rnBaseStr} && ${yesterdayFilter}`, $autoCancel: false }),
          pb.collection('reporter_news').getList(1, 1, { filter: rnBaseStr, $autoCancel: false }),
          
          pb.collection('news').getList(1, 1, { filter: nBaseStr ? `${nBaseStr} && ${todayFilter}` : todayFilter, $autoCancel: false }),
          pb.collection('news').getList(1, 1, { filter: nBaseStr ? `${nBaseStr} && ${yesterdayFilter}` : yesterdayFilter, $autoCancel: false }),
          pb.collection('news').getList(1, 1, { filter: nBaseStr, $autoCancel: false }),

          pb.collection('published_news').getList(1, 1, { filter: pnBaseStr ? `${pnBaseStr} && ${todayFilter}` : todayFilter, $autoCancel: false }),
          pb.collection('published_news').getList(1, 1, { filter: pnBaseStr ? `${pnBaseStr} && ${yesterdayFilter}` : yesterdayFilter, $autoCancel: false }),
          pb.collection('published_news').getList(1, 1, { filter: pnBaseStr, $autoCancel: false })
        ]);

        const getCount = (res) => res.status === 'fulfilled' ? res.value.totalItems : 0;

        const newCounts = {
          today: getCount(results[0]) + getCount(results[3]) + getCount(results[6]),
          yesterday: getCount(results[1]) + getCount(results[4]) + getCount(results[7]),
          all: getCount(results[2]) + getCount(results[5]) + getCount(results[8])
        };

        setCounts(newCounts);
      } catch (err) {
        console.error('[HomePage] ❌ Failed to fetch tab counts:', err);
      }
    };

    fetchTabCounts();
  }, [activeCategory, searchQuery]);

  const fetchNewsData = useCallback(async () => {
    console.log('[HomePage] 🔄 Starting fetchNewsData with filters:', { activeCategory, dateFilter, sortBy, searchQuery });
    
    setLoading(true);
    setError(null);

    const dates = getDateStrings();

    // Filters for reporter_news
    let rnFilters = ['status = "approved"'];
    if (activeCategory !== 'All Categories') rnFilters.push(`category = "${activeCategory}"`);
    if (searchQuery.trim()) rnFilters.push(`(title ~ "${searchQuery.trim()}" || content ~ "${searchQuery.trim()}")`);
    if (dateFilter === 'Today') rnFilters.push(`created >= "${dates.today} 00:00:00" && created < "${dates.tomorrow} 00:00:00"`);
    if (dateFilter === 'Yesterday') rnFilters.push(`created >= "${dates.yesterday} 00:00:00" && created < "${dates.today} 00:00:00"`);
    const rnFilter = rnFilters.join(' && ');

    // Filters for news
    let nFilters = [];
    if (activeCategory !== 'All Categories') nFilters.push(`category = "${activeCategory}"`);
    if (searchQuery.trim()) nFilters.push(`(title ~ "${searchQuery.trim()}" || description ~ "${searchQuery.trim()}")`);
    if (dateFilter === 'Today') nFilters.push(`created >= "${dates.today} 00:00:00" && created < "${dates.tomorrow} 00:00:00"`);
    if (dateFilter === 'Yesterday') nFilters.push(`created >= "${dates.yesterday} 00:00:00" && created < "${dates.today} 00:00:00"`);
    const nFilter = nFilters.length > 0 ? nFilters.join(' && ') : '';

    // Filters for published_news
    let pnFilters = [];
    if (activeCategory !== 'All Categories') pnFilters.push(`category = "${activeCategory}"`);
    if (searchQuery.trim()) pnFilters.push(`(headline ~ "${searchQuery.trim()}" || content ~ "${searchQuery.trim()}")`);
    if (dateFilter === 'Today') pnFilters.push(`created >= "${dates.today} 00:00:00" && created < "${dates.tomorrow} 00:00:00"`);
    if (dateFilter === 'Yesterday') pnFilters.push(`created >= "${dates.yesterday} 00:00:00" && created < "${dates.today} 00:00:00"`);
    const pnFilter = pnFilters.length > 0 ? pnFilters.join(' && ') : '';

    try {
      const [rnRes, nRes, pnRes] = await Promise.allSettled([
        fetchReporterNews(rnFilter),
        fetchNewsCollection(nFilter),
        fetchPublishedNewsCollection(pnFilter)
      ]);

      let merged = [];

      if (rnRes.status === 'fulfilled') merged.push(...rnRes.value);
      if (nRes.status === 'fulfilled') merged.push(...nRes.value);
      if (pnRes.status === 'fulfilled') merged.push(...pnRes.value);

      if (rnRes.status === 'rejected' && nRes.status === 'rejected' && pnRes.status === 'rejected') {
        throw new Error('Failed to fetch news from all sources. Please check your network connection.');
      }

      // Deduplicate by ID
      const uniqueMerged = Array.from(new Map(merged.map(item => [item.id, item])).values());

      // Sort
      uniqueMerged.sort((a, b) => {
        const dateA = new Date(a.published_at || a.created).getTime();
        const dateB = new Date(b.published_at || b.created).getTime();
        return sortBy.startsWith('-') ? dateB - dateA : dateA - dateB;
      });

      console.log(`[HomePage] 🎉 Successfully merged and sorted ${uniqueMerged.length} unique articles.`);
      setAllMergedNews(uniqueMerged);
      setDisplayedNews(uniqueMerged.slice(0, ITEMS_PER_PAGE));
      setPage(1);

    } catch (err) {
      console.error('[HomePage] ❌ Critical failure in fetchNewsData:', err);
      setError('Unable to connect to the news database. Please check your connection and try again.');
      toast.error('Failed to load news. Showing available content.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, dateFilter, sortBy, searchQuery]);

  useEffect(() => {
    fetchNewsData();
  }, [fetchNewsData]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    const newDisplayed = allMergedNews.slice(0, nextPage * ITEMS_PER_PAGE);
    setDisplayedNews(newDisplayed);
    setPage(nextPage);
  };

  const handleHeroSearch = (query) => {
    setSearchQuery(query);
    document.getElementById('latest-news')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Navdhriti Samachar - Sach Saahas Nyaay Kee Khabar</title>
        <meta name="description" content="Your trusted source for daily news. Bringing truth, courage, and justice to every story." />
      </Helmet>

      <Header />

      <main className="flex-1">
        <HeroSection onSearch={handleHeroSearch} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdsDisplay />
        </div>
       
        <section id="latest-news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest News Stories'}
              </h2>
            </div>
            {/*🎬 AUTO YOUTUBE CHANNEL VIDEO */}
            <iframe width="560" height="315" src="https://www.youtube.com/embed/KrBK8VJ0nw4?si=2I8YI8DriKI6LUZP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-published_at">Latest First</SelectItem>
                  <SelectItem value="+published_at">Oldest First</SelectItem>
                  <SelectItem value="-created_at">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-muted-foreground mr-1" />
            {['Today', 'Yesterday', 'All'].map(tab => {
              const isActive = dateFilter === tab;
              const count = counts[tab.toLowerCase()];
              return (
                <button
                  key={tab}
                  onClick={() => setDateFilter(tab)}
                  className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${isActive
                      ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                      : 'bg-muted text-foreground font-medium hover:bg-muted/80'
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="mb-10">
            <CategoryFilter
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setSearchQuery('');
              }}
            />
          </div>

          {loading && page === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-56 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-32 mt-4" />
                </div>
              ))}
            </div>
          ) : error && displayedNews.length === 0 ? (
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-bold text-destructive mb-2">Database Connection Error</h3>
              <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
              <Button onClick={fetchNewsData} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          ) : displayedNews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedNews.map(article => (
                  <NewsCard
                    key={article.id}
                    news={article}
                  />
                ))}
              </div>

              {displayedNews.length < allMergedNews.length && (
                <div className="mt-16 flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="rounded-full px-12 py-6 text-lg font-bold shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" /> Loading...
                      </span>
                    ) : (
                      'Load More News'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileQuestion className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No News Available</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                {searchQuery
                  ? `We couldn't find any news matching "${searchQuery}".`
                  : `There are currently no news articles available for the selected filters.`}
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setActiveCategory('All Categories');
                setDateFilter('All');
              }} variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                Clear All Filters
              </Button>
            </div>
          )}
        </section>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <AdsDisplay />
        </div>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 border-t border-border">
          <WeatherSection />
          <AstrologySection />
          <MarketUpdatesSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;