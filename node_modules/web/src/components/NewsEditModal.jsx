import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const CATEGORIES = ['National', 'State', 'District'];

const NewsEditModal = ({ isOpen, onClose, newsItem, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    headline: '',
    content: '',
    category: '',
    excerpt: '',
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (newsItem && isOpen) {
      // Validate that newsItem has an ID before attempting to use it
      if (!newsItem.id) {
        toast.error('Invalid record. Please refresh and try again.');
        onClose();
        return;
      }

      setFormData({
        headline: newsItem.headline || '',
        content: newsItem.content || '',
        category: newsItem.category || '',
        excerpt: newsItem.excerpt || '',
      });
      setImageFile(null);
    }
  }, [newsItem, isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.headline || !formData.content || !formData.category || !formData.excerpt) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (!newsItem || !newsItem.id) {
      toast.error('Record not found. Please refresh and try again.');
      onClose();
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('headline', formData.headline);
      submitData.append('content', formData.content);
      submitData.append('category', formData.category);
      submitData.append('excerpt', formData.excerpt);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await pb.collection('news_submissions').update(newsItem.id, submitData, { $autoCancel: false });
      
      toast.success('News updated successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      
      // Handle 404 errors gracefully
      if (error.status === 404) {
        toast.error('Record not found or has been deleted.');
        onClose();
        if (onSuccess) onSuccess(); // Refresh parent list
      } else {
        toast.error(error.message || 'Failed to update news.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit News Submission</DialogTitle>
          <DialogDescription>
            Update the details of this news article.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-headline">Headline <span className="text-destructive">*</span></Label>
            <Input 
              id="edit-headline" 
              name="headline" 
              value={formData.headline} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category <span className="text-destructive">*</span></Label>
            <Select value={formData.category} onValueChange={handleCategoryChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-excerpt">Excerpt (Short Summary) <span className="text-destructive">*</span></Label>
            <Textarea 
              id="edit-excerpt" 
              name="excerpt" 
              value={formData.excerpt} 
              onChange={handleInputChange} 
              className="min-h-[80px]"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-content">Full Content <span className="text-destructive">*</span></Label>
            <Textarea 
              id="edit-content" 
              name="content" 
              value={formData.content} 
              onChange={handleInputChange} 
              className="min-h-[200px]"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image">Update Image</Label>
            <Input 
              id="edit-image" 
              name="image" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <p className="text-xs text-muted-foreground">Leave empty to keep current image</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand-blue hover:bg-brand-blue/90 text-white">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewsEditModal;