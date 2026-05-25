import React, { useState } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, Globe, Trash2, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import RejectionReasonModal from '@/components/RejectionReasonModal.jsx';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.jsx';

const NewsDetailModal = ({ isOpen, onClose, newsItem, onStatusChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!newsItem) return null;

  const imageUrl = newsItem.image ? pb.files.getUrl(newsItem, newsItem.image) : 
                   newsItem.photo1 ? pb.files.getUrl(newsItem, newsItem.photo1) : null;
                   
  const date = new Date(newsItem.created_at || newsItem.created).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleAction = async (action, extraData = {}) => {
    setIsSubmitting(true);
    try {
      let updates = {};
      let successMessage = '';

      switch (action) {
        case 'approve':
          updates = { status: 'approved' };
          successMessage = 'News approved successfully.';
          break;
        case 'publish':
          updates = { status: 'published', published_at: new Date().toISOString() };
          successMessage = 'News published successfully.';
          break;
        case 'reject':
          updates = { status: 'rejected', admin_comments: extraData.reason };
          successMessage = 'News rejected successfully.';
          break;
        case 'delete':
          await pb.collection('reporter_news').delete(newsItem.id, { $autoCancel: false });
          toast.success('News deleted successfully.');
          onStatusChange();
          onClose();
          return;
        default:
          return;
      }

      if (action !== 'delete') {
        await pb.collection('reporter_news').update(newsItem.id, updates, { $autoCancel: false });
        toast.success(successMessage);
        onStatusChange();
        if (action === 'reject') setShowRejectModal(false);
      }
    } catch (error) {
      console.error(`Failed to ${action} news:`, error);
      toast.error(`Failed to ${action} news. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'published': return <Badge className="bg-blue-500 hover:bg-blue-600">Published</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      case 'pending_approval': return <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>;
      default: return <Badge variant="secondary">{status || 'Draft'}</Badge>;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-xl font-bold line-clamp-1 pr-4">
                {newsItem.title || newsItem.headline}
              </DialogTitle>
              {getStatusBadge(newsItem.status)}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Meta Info - No reporter name */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <Badge variant="secondary">{newsItem.category || 'Uncategorized'}</Badge>
                </div>
              </div>

              {/* Image */}
              {imageUrl ? (
                <div className="w-full rounded-xl overflow-hidden border bg-muted">
                  <img src={imageUrl} alt="News" className="w-full h-auto max-h-[400px] object-contain" />
                </div>
              ) : (
                <div className="w-full h-48 rounded-xl border border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <span>No image provided</span>
                </div>
              )}

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Article Content</h3>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {newsItem.content || newsItem.description || 'No content available.'}
                </div>
              </div>

              {/* Admin Comments (if rejected) */}
              {newsItem.status === 'rejected' && newsItem.admin_comments && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-6">
                  <h4 className="text-sm font-bold text-destructive mb-1">Rejection Reason:</h4>
                  <p className="text-sm text-destructive/90">{newsItem.admin_comments}</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t bg-muted/10 flex-wrap gap-2 sm:justify-between">
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isSubmitting} className="gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
            
            <div className="flex gap-2">
              {newsItem.status !== 'rejected' && (
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setShowRejectModal(true)} disabled={isSubmitting}>
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
              )}
              
              {newsItem.status !== 'approved' && newsItem.status !== 'published' && (
                <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleAction('approve')} disabled={isSubmitting}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
              )}
              
              {newsItem.status !== 'published' && (
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAction('publish')} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
                  Publish Now
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RejectionReasonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={(reason) => handleAction('reject', { reason })}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handleAction('delete')}
        loading={isSubmitting}
        title="Delete News Article"
        description="Are you sure you want to permanently delete this news article? This action cannot be undone."
      />
    </>
  );
};

export default NewsDetailModal;