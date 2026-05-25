import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Loader2, Calendar, Folder, ExternalLink, Send, Edit, Trash2, AlertCircle, IndianRupee } from 'lucide-react';

const NewsDetailsView = ({ news, isOpen, onClose, onRefresh, onEdit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!news) return null;

  const handleSubmitApproval = async () => {
    setIsSubmitting(true);
    try {
      await pb.collection('reporter_news').update(news.id, {
        status: 'pending_approval'
      }, { $autoCancel: false });
      toast.success('News submitted for approval!');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to submit news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this news draft?')) return;
    
    setIsSubmitting(true);
    try {
      await pb.collection('reporter_news').delete(news.id, { $autoCancel: false });
      toast.success('News deleted successfully');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Deletion failed:', error);
      toast.error('Failed to delete news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>;
      case 'pending_approval': return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const isDraftOrRejected = news.status === 'draft' || news.status === 'rejected';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl leading-snug line-clamp-2 pr-8">
              {news.title}
            </DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-3 mt-2 text-sm">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(news.created_at || news.created).toLocaleDateString()}</span>
            <span className="flex items-center"><Folder className="w-4 h-4 mr-1" /> {news.category}</span>
            {getStatusBadge(news.status)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            
            {news.status === 'rejected' && news.admin_comments && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Rejection Reason:</p>
                  <p className="opacity-90">{news.admin_comments}</p>
                </div>
              </div>
            )}

            {news.status === 'approved' && news.earnings > 0 && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  <span className="font-semibold">Earnings Awarded</span>
                </div>
                <span className="text-xl font-bold font-mono">₹{news.earnings}</span>
              </div>
            )}

            {news.image && (
              <div className="w-full rounded-xl overflow-hidden bg-muted">
                <img 
                  src={pb.files.getUrl(news, news.image)} 
                  alt={news.title}
                  className="w-full h-auto max-h-[400px] object-cover"
                />
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                {news.content}
              </p>
            </div>

            {news.source_link && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <ExternalLink className="w-4 h-4" />
                <a href={news.source_link} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                  {news.source_link}
                </a>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />
        
        <DialogFooter className="px-6 py-4 shrink-0 bg-muted/20 flex flex-row items-center justify-between sm:justify-between">
          <div className="flex gap-2">
            {isDraftOrRejected && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {isDraftOrRejected && (
              <Button 
                variant="outline" 
                onClick={() => { onClose(); onEdit(news); }}
                disabled={isSubmitting}
              >
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            )}
            
            {news.status === 'draft' && (
              <Button 
                onClick={handleSubmitApproval}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit for Approval
              </Button>
            )}
            
            {news.status !== 'draft' && (
              <Button variant="secondary" onClick={onClose}>Close</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailsView;