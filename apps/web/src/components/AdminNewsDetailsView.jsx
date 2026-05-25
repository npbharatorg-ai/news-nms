import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import pb from '@/lib/pocketbaseClient.js';
import { Calendar, Folder, ExternalLink, CheckCircle, XCircle, User, Loader2 } from 'lucide-react';

const AdminNewsDetailsView = ({ isOpen, onClose, news, reporterName, onApprove, onReject }) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!news) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    await onApprove(news.id, news.reporter_id);
    setIsSubmitting(false);
  };

  const handleRejectSubmit = async () => {
    if (!rejectComment.trim()) return;
    setIsSubmitting(true);
    await onReject(news.id, rejectComment);
    setIsSubmitting(false);
    setIsRejecting(false);
    setRejectComment('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-500">Approved</Badge>;
      case 'pending_approval': return <Badge className="bg-amber-500">Pending Approval</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setIsRejecting(false);
        setRejectComment('');
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b shrink-0 bg-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl leading-snug pr-8 mb-2">
                {news.title}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center text-foreground font-medium">
                  <User className="w-4 h-4 mr-1.5 text-muted-foreground" /> 
                  {reporterName || 'Unknown Reporter'}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" /> 
                  {new Date(news.created_at || news.created).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Folder className="w-4 h-4 mr-1.5" /> 
                  {news.category}
                </span>
                {getStatusBadge(news.status)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-8">
            {news.image && (
              <div className="w-full rounded-xl overflow-hidden bg-muted border shadow-sm">
                <img 
                  src={pb.files.getUrl(news, news.image)} 
                  alt={news.title}
                  className="w-full h-auto max-h-[450px] object-contain bg-black/5"
                />
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-lg">
                {news.content}
              </p>
            </div>

            {news.source_link && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 p-3 rounded-lg border border-primary/10">
                <ExternalLink className="w-4 h-4 shrink-0" />
                <a href={news.source_link} target="_blank" rel="noopener noreferrer" className="hover:underline break-all font-medium">
                  {news.source_link}
                </a>
              </div>
            )}
            
            {news.status === 'rejected' && news.admin_comments && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <h4 className="text-destructive font-semibold mb-1 text-sm uppercase tracking-wider">Previous Rejection Reason</h4>
                <p className="text-destructive/90 text-sm">{news.admin_comments}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />
        
        <DialogFooter className="px-6 py-4 shrink-0 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          {isRejecting ? (
            <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <Label htmlFor="reject-reason" className="text-destructive font-semibold">Reason for Rejection</Label>
                <Textarea 
                  id="reject-reason"
                  placeholder="Explain why this news is being rejected. This will be visible to the reporter."
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="min-h-[80px] border-destructive/50 focus-visible:ring-destructive"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRejecting(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleRejectSubmit} disabled={!rejectComment.trim() || isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Close
              </Button>
              
              {news.status === 'pending_approval' && (
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button 
                    variant="destructive" 
                    className="flex-1 sm:flex-none"
                    onClick={() => setIsRejecting(true)}
                    disabled={isSubmitting}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button 
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleApprove}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Approve & Publish
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminNewsDetailsView;