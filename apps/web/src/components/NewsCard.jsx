import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Image as ImageIcon, Flag } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ReportNewsModal from '@/components/ReportNewsModal.jsx';

const CATEGORY_COLORS = {
  Politics: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Sports: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Business: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Health: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Technology: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  Default: 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground'
};

const NewsCard = ({ news }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  if (!news) return null;

  const imageUrl = news.image ? pb.files.getUrl(news, news.image) : 
                   news.photo1 ? pb.files.getUrl(news, news.photo1) : null;
                   
  const date = new Date(news.published_at || news.created_at || news.created).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const categoryColorClass = CATEGORY_COLORS[news.category] || CATEGORY_COLORS.Default;
  
  const rawExcerpt = news.content || news.description || news.excerpt || '';
  const excerpt = rawExcerpt.length > 100 ? `${rawExcerpt.substring(0, 100)}...` : rawExcerpt;

  return (
    <>
      <article className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
        
        {/* Thumbnail 16:9 */}
        <div className="relative w-full pt-[56.25%] bg-muted overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={news.title || news.headline || 'News Image'} 
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-sm font-medium">No image available</span>
            </div>
          )}
          
          {/* Category Badge overlay */}
          {news.category && (
            <div className="absolute top-4 left-4 z-10">
              <Badge className={`px-3 py-1 text-xs font-bold border-none uppercase tracking-wider ${categoryColorClass} bg-opacity-90 backdrop-blur-sm`}>
                {news.category}
              </Badge>
            </div>
          )}

          {/* Report Button Overlay */}
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowReportModal(true);
              }}
              title="Report this article"
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          
          {/* Meta Info - Date only, no reporter name */}
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={news.published_at || news.created}>{date}</time>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-card-foreground leading-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            <Link to={`/news/${news.id}`} className="focus:outline-none">
              {news.title || news.headline || 'Untitled News'}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
            {excerpt}
          </p>

          {/* Read More Action */}
          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
            <Link 
              to={`/news/${news.id}`} 
              className="inline-flex items-center text-sm font-bold text-primary hover:text-secondary transition-colors"
            >
              Read More
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            {/* Mobile Report Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden text-muted-foreground hover:text-destructive h-8 px-2"
              onClick={(e) => {
                e.preventDefault();
                setShowReportModal(true);
              }}
            >
              <Flag className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs">Report</span>
            </Button>
          </div>
        </div>
      </article>

      <ReportNewsModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        newsId={news.id} 
      />
    </>
  );
};

export default NewsCard;