import React, { useState } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const ReportNewsModal = ({ isOpen, onClose, newsId }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason for reporting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reporterId = pb.authStore.model?.id || 'anonymous';
      
      await pb.collection('news_reports').create({
        news_id: newsId,
        reporter_id: reporterId,
        reason: reason,
        description: description,
        status: 'pending'
      }, { $autoCancel: false });

      toast.success('Report submitted successfully. Our team will review it shortly.');
      setReason('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Report News Article
          </DialogTitle>
          <DialogDescription>
            If you believe this article violates our community guidelines, please report it below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="reason" className="text-foreground">Reason for Reporting <span className="text-destructive">*</span></Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger id="reason" className="w-full bg-background text-foreground">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spam">Spam or Misleading</SelectItem>
                <SelectItem value="Offensive">Offensive Content</SelectItem>
                <SelectItem value="Misinformation">Misinformation / Fake News</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-foreground">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Please provide more context about why you are reporting this article..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] bg-background text-foreground resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting || !reason}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportNewsModal;