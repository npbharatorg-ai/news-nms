import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const CATEGORIES = ['National', 'State', 'District'];

const EditNewsModal = ({ isOpen, onClose, newsItem, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const form = useForm({
    defaultValues: {
      headline: '',
      content: '',
      category: '',
      excerpt: '',
      is_breaking: false,
    }
  });

  useEffect(() => {
    if (newsItem && isOpen) {
      form.reset({
        headline: newsItem.headline || newsItem.title || '',
        content: newsItem.content || newsItem.description || '',
        category: newsItem.category || '',
        excerpt: newsItem.excerpt || '',
        is_breaking: newsItem.is_breaking || false,
      });
      setImageFile(null);
    }
  }, [newsItem, isOpen, form]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values) => {
    if (!values.headline || !values.content || !values.category) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      
      // Handle different collection schemas
      const isNewsCollection = newsItem.collectionName === 'news';
      
      if (isNewsCollection) {
        submitData.append('title', values.headline);
        submitData.append('description', values.content);
        submitData.append('category', values.category);
        if (imageFile) submitData.append('photo1', imageFile);
      } else {
        submitData.append('headline', values.headline);
        submitData.append('content', values.content);
        submitData.append('category', values.category);
        submitData.append('excerpt', values.excerpt);
        submitData.append('is_breaking', values.is_breaking ? 'true' : 'false');
        if (imageFile) submitData.append('image', imageFile);
      }

      await pb.collection(newsItem.collectionName).update(newsItem.id, submitData, { $autoCancel: false });
      
      toast.success('News updated successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update news.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit News Article</DialogTitle>
          <DialogDescription>
            Update the details of this news article.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline / Title <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {newsItem?.collectionName !== 'news' && (
              <>
                <FormField
                  control={form.control}
                  name="is_breaking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mark as Breaking News</FormLabel>
                        <FormDescription>
                          Highlight this article prominently on the homepage.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt (Short Summary)</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Content <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[200px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Update Image</FormLabel>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <p className="text-xs text-muted-foreground">Leave empty to keep current image</p>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-blue hover:bg-brand-blue/90 text-white">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNewsModal;