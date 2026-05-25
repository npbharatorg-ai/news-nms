import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { useTimeAgo } from '@/hooks/useTimeAgo.js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Eye, User, ArrowLeft, AlertCircle, Grid, MapPin } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ShareButtons from '@/components/ShareButtons.jsx';
import ReporterCard from '@/components/ReporterCard.jsx';
import AdsDisplay from '@/components/AdsDisplay.jsx';
import { generateShareMetadata } from '@/lib/shareUtils.js';
import { generateWatermarkedImageUrl } from '@/utils/watermarkImage.js';
import { useSEO } from '@/hooks/useSEO.jsx';
import { generateNewsArticleSchema, generateBreadcrumbSchema } from '@/utils/schemaGenerator.js';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [reporter, setReporter] = useState(null);
  const [watermarkedImage, setWatermarkedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNewsAndReporter = async () => {
    if (!id) {
      setError('Invalid article ID.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('[NewsDetailPage] Fetching news with ID:', id);
      
      // Try reporter_news first, then fall back to news collection
      let record;
      let collectionName = 'reporter_news';
      
      try {
        record = await pb.collection('reporter_news').getOne(id, { $autoCancel: false });
        console.log('[NewsDetailPage] Found in reporter_news:', record);
      } catch (err) {
        console.log('[NewsDetailPage] Not found in reporter_news, trying news collection');
        if (err.status === 404) {
          try {
            record = await pb.collection('news').getOne(id, { $autoCancel: false });
            collectionName = 'news';
            console.log('[NewsDetailPage] Found in news:', record);
          } catch (newsErr) {
            console.error('[NewsDetailPage] Not found in news either:', newsErr);
            throw newsErr;
          }
        } else {
          throw err;
        }
      }

      setNews(record);
      
      // Increment views
      try {
      //  const currentViews = record.views || record.views_count || 0;
      //  const updateData = { views: currentViews + 1 };
      //  await pb.collection(collectionName).update(id, updateData, { $autoCancel: false });
        console.log('[NewsDetailPage] Views incremented');
      } catch (e) {
        console.error('[NewsDetailPage] Error incrementing views:', e);
      }

      // Generate watermarked image
      const imageField = record.image || record.photo1;
      if (imageField) {
        const rawUrl = pb.files.getUrl(record, imageField);
        try {
          const watermarkedUrl = await generateWatermarkedImageUrl(rawUrl);
          setWatermarkedImage(watermarkedUrl);
        } catch (e) {
          console.error('[NewsDetailPage] Error generating watermark:', e);
          setWatermarkedImage(rawUrl);
        }
      }

      // Fetch reporter information
      if (record.reporter_id) {
        console.log('[NewsDetailPage] Fetching reporter with ID:', record.reporter_id);
        try {
          const reporterRecord = await pb.collection('reporter_registrations').getOne(record.reporter_id, { $autoCancel: false });
          console.log('[NewsDetailPage] Reporter found:', reporterRecord);
          setReporter(reporterRecord);
        } catch (reporterErr) {
          console.error('[NewsDetailPage] Reporter fetch error:', reporterErr);
          // Try reporters collection as fallback
          try {
            const reporterRecord = await pb.collection('reporters').getOne(record.reporter_id, { $autoCancel: false });
            console.log('[NewsDetailPage] Reporter found in reporters collection:', reporterRecord);
            setReporter(reporterRecord);
          } catch (fallbackErr) {
            console.error('[NewsDetailPage] Reporter not found in either collection:', fallbackErr);
            setReporter(null);
          }
        }
      } else {
        console.log('[NewsDetailPage] No reporter_id in news record');
      }

    } catch (err) {
      console.error('[NewsDetailPage] Error fetching news:', err);
      if (err.status === 404) {
        setError('The article you are looking for does not exist or has been removed.');
      } else {
        setError('Unable to load the article. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsAndReporter();
  }, [id]);

  const timeAgo = useTimeAgo(news?.created_at || news?.created);

  const headline = news?.title || news?.headline || 'Untitled';
  const content = news?.content || news?.description || '';
  const category = news?.category || 'News';
  const imageField = news?.image || news?.photo1;
  const rawImageUrl = news && imageField ? pb.files.getUrl(news, imageField) : null;
  const displayImageUrl = watermarkedImage || rawImageUrl;
  const reporterName = reporter?.name || 'Navdhriti Samachar';
  
  const shareMeta = generateShareMetadata({
    headline,
    excerpt: content.substring(0, 200),
    id: news?.id
  });

  const seoTags = useSEO({
  title: headline,
  description: content.substring(0, 160),
  image: rawImageUrl,
  url: `https://new.nms.news/news/${id}`,
  type: 'article',

  openGraph: {
    title: headline,
    description: content.substring(0, 160),
    image: rawImageUrl,
    url: `https://new.nms.news/news/${id}`,
    type: 'article'
  },

  twitter: {
    card: 'summary_large_image',
    title: headline,
    description: content.substring(0, 160),
    image: rawImageUrl
  },

  schemas: news ? [
    generateNewsArticleSchema(news, `https://new.nms.news/news/${id}`),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://new.nms.news/' },
      { name: category, url: `https://new.nms.news/categories?category=${category}` },
      { name: headline, url: `https://new.nms.news/news/${id}` }
    ])
  ] : []
});

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-24">
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">News Not Found</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/')} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Button>
              <Button variant="outline" onClick={() => navigate('/categories')} className="gap-2">
                <Grid className="w-4 h-4" /> Browse Categories
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {seoTags}
      <Header />

      <main className="flex-1">
        {/* Top Ad */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdsDisplay />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-8 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Article Content */}
            <article className="lg:col-span-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                    {category}
                  </Badge>
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">
                    Report by {reporterName}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 text-foreground" style={{ letterSpacing: '-0.02em' }}>
                  {headline}
                </h1>
                
                <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary overflow-hidden">
                        {reporter?.photo ? (
                          <img src={pb.files.getUrl(reporter, reporter.photo)} alt={reporterName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-base">{reporterName}</p>
                        <p className="text-xs">{reporter?.designation || 'Navdhriti Manavadhikar Samachar'}</p>
                      </div>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-border"></div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {timeAgo}
                      </span>
                      {/*
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" /> {news.views || news.views_count || 0} views
                      </span>
                      */}
                    </div>
                  </div>
                  
                  <ShareButtons 
                    articleTitle={headline} 
                    articleDescription={content.substring(0, 200)} 
                    articleUrl={shareMeta?.url} 
                    reporterName={reporterName}
                  />
                </div>
              </div>

              {displayImageUrl && (
                <figure className="mb-10 relative rounded-2xl overflow-hidden shadow-md bg-muted group">
                  <img 
                    src={displayImageUrl} 
                    alt={headline} 
                    className="w-full object-cover max-h-[600px]"
                  />
                </figure>
              )}

              {/* Location Information Section */}
              {(news.state || news.district || news.location) && (
                <div className="mb-10 bg-muted/30 dark:bg-muted/20 rounded-xl p-6 border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Location Information / स्थान की जानकारी</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {news.state && (
                      <div className="bg-card rounded-lg p-4 border border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          State / राज्य
                        </p>
                        <p className="text-base font-medium text-card-foreground">
                          {news.state}
                        </p>
                      </div>
                    )}
                    
                    {news.district && (
                      <div className="bg-card rounded-lg p-4 border border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          District / जिला
                        </p>
                        <p className="text-base font-medium text-card-foreground">
                          {news.district}
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Location / स्थान
                      </p>
                      <p className="text-base font-medium text-card-foreground">
                        {news.location || <span className="text-muted-foreground italic">Not specified / निर्दिष्ट नहीं</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="prose prose-lg dark:prose-invert max-w-none mb-12 article-content">
                {content ? content.split('\n').map((paragraph, idx) => (
                  paragraph.trim() ? <p key={idx} className="mb-4 leading-relaxed text-foreground/90">{paragraph}</p> : <br key={idx} />
                )) : <p>No content available.</p>}
              </div>

              {reporter && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h2 className="text-2xl font-bold mb-4">About the Reporter</h2>
                  <ReporterCard reporter={reporter} />
                </div>
              )}

              <div className="border-t border-border pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Published on {news.created_at || news.published_at ? new Date(news.created_at || news.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date'}
                </p>
                <ShareButtons 
                  articleTitle={headline} 
                  articleDescription={content.substring(0, 200)} 
                  articleUrl={shareMeta?.url} 
                  reporterName={reporterName}
                />
              </div>
            </article>

            {/* Sidebar with Ads */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="sticky top-24">
                <h2 className="text-lg font-bold mb-4 text-muted-foreground uppercase tracking-wider">Sponsored</h2>
                <AdsDisplay />
              </div>
            </aside>
          </div>
        </div>

        {/* Bottom Ad */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border">
          <AdsDisplay />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;