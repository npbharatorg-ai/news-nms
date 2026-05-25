import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { cn } from '@/lib/utils.js';

const CustomAdForm = ({ isOpen, onClose, ad, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    is_enabled: true,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (ad) {
        setFormData({
          title: ad.title || '',
          description: ad.description || '',
          link: ad.link || '',
          is_enabled: ad.is_enabled !== false,
        });
        setPreview(ad.image ? pb.files.getUrl(ad, ad.image) : null);
        setFile(null);
      } else {
        setFormData({
          title: '',
          description: '',
          link: '',
          is_enabled: true,
        });
        setPreview(null);
        setFile(null);
      }
    }
  }, [isOpen, ad]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WEBP).');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error('File size exceeds 20MB limit.');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(ad?.image ? pb.files.getUrl(ad, ad.image) : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Ad title is required.');
      return;
    }

    if (!ad && !file) {
      toast.error('An image is required for new ads.');
      return;
    }

    if (formData.link && !/^https?:\/\//i.test(formData.link)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('ad_type', 'custom');
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('link', formData.link);
      data.append('is_enabled', formData.is_enabled);
      
      if (file) {
        data.append('image', file);
      }

      if (ad) {
        await pb.collection('ads').update(ad.id, data, { $autoCancel: false });
        toast.success('Ad updated successfully!');
      } else {
        await pb.collection('ads').create(data, { $autoCancel: false });
        toast.success('Ad created successfully!');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error(error.message || 'Failed to save ad. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ad ? 'Edit Custom Ad' : 'Create New Custom Ad'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {ad ? 'update the' : 'create a new'} custom advertisement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Ad Image <span className="text-destructive">*</span></Label>
            <div 
              className={cn(
                "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px]",
                preview ? "border-slate-200 bg-slate-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
              )}
            >
              {preview ? (
                <div className="relative w-full flex flex-col items-center">
                  <div className="relative w-full max-w-md rounded-lg overflow-hidden shadow-sm border border-slate-200 bg-white">
                    <img src={preview} alt="Ad Preview" className="w-full h-auto max-h-[250px] object-contain" />
                    <button 
                      onClick={clearFile}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {file && (
                    <p className="text-sm font-medium text-slate-700 mt-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" /> {file.name}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg, image/png, image/gif, image/webp" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isSubmitting}
                  />
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Click or drag image to upload</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG, GIF, WEBP up to 20MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ad Title <span className="text-destructive">*</span></Label>
              <Input 
                id="title" 
                placeholder="e.g., Summer Sale 50% Off" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Brief description of the ad..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Target URL (Optional)</Label>
              <Input 
                id="link" 
                type="url"
                placeholder="https://example.com/promo" 
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Ad</Label>
                <p className="text-sm text-muted-foreground">
                  Active ads will be displayed in the carousel.
                </p>
              </div>
              <Switch 
                checked={formData.is_enabled}
                onCheckedChange={(checked) => setFormData({...formData, is_enabled: checked})}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {ad ? 'Save Changes' : 'Create Ad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomAdForm;