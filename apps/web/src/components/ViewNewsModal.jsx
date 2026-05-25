import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const ViewNewsModal = ({ isOpen, onClose, newsItem, reporterName }) => {
  const [loading, setLoading] = useState(false);
  const [displayData, setDisplayData] = useState(null);

  useEffect(() => {
    if (!newsItem || !isOpen) {
      setDisplayData(null);
      return;
    }

    // Validate that newsItem has an ID
    if (!newsItem.id) {
      toast.error('Article not found.');
      onClose();
      return;
    }

    const loadNewsData = async () => {
      setLoading(true);
      try {
        // Try to fetch from published_news first
        let record;
        try {
          record = await pb.collection('published_news').getOne(newsItem.id, { $autoCancel: false });
        } catch (publishedErr) {
          // If 404, try fallback to news collection
          if (publishedErr.status === 404) {
            try {
              record = await pb.collection('news').getOne(newsItem.id, { $autoCancel: false });
            } catch (fallbackErr) {
              if (fallbackErr.status === 404) {
                toast.error('Article not found.');
                onClose();
                return;
              }
              throw fallbackErr;
            }
          } else {
            throw publishedErr;
          }
        }

        // Normalize the record data
        const normalizedData = {
          headline: record.headline || record.title,
          content: record.content || record.description,
          image: record.image || record.photo1,
          author_name: record.author_name || reporterName || 'Unknown Reporter',
          published_at: record.published_at || record.created,
          category: record.category,
          excerpt: record.excerpt,
          status: record.status,
          admin_notes: record.admin_notes,
          ...record
        };

        setDisplayData(normalizedData);
      } catch (error) {
        console.error('Error loading article:', error);
        
        // Handle 404 errors gracefully
        if (error.status === 404) {
          toast.error('Article not found.');
        } else {
          toast.error('Unable to load article.');
        }
        onClose();
      } finally {
        setLoading(false);
      }
    };

    loadNewsData();
  }, [newsItem, isOpen, reporterName, onClose]);

  if (!displayData) return null;

  const headline = displayData.headline || 'Untitled';
  const content = displayData.content || 'No content available.';
  const image = displayData.image;
  const author = displayData.author_name || 'Unknown Reporter';
  const date = displayData.published_at || displayData.created;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold leading-tight">{headline}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 mt-2 text-sm">
            {displayData.category && <Badge variant="outline" className="bg-muted">{displayData.category}</Badge>}
            <span className="font-medium text-foreground">By {author}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{date ? new Date(date).toLocaleDateString() : 'Unknown date'}</span>
            {displayData.status && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant={
                  displayData.status === 'approved' || displayData.status === 'published' ? 'default' : 
                  displayData.status === 'rejected' ? 'destructive' : 'secondary'
                } className={displayData.status === 'approved' || displayData.status === 'published' ? 'bg-green-600 hover:bg-green-700' : ''}>
                  {displayData.status?.toUpperCase()}
                </Badge>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {image && (
            <div className="rounded-xl overflow-hidden border bg-muted">
              <img 
                src={pb.files.getUrl(displayData, image)} 
                alt={headline} 
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>
          )}
          
          {displayData.excerpt && (
            <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary italic text-muted-foreground">
              {displayData.excerpt}
            </div>
          )}
          
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none whitespace-pre-wrap">
            {content}
          </div>

          {displayData.admin_notes && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-1">Admin Notes:</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{displayData.admin_notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNewsModal;