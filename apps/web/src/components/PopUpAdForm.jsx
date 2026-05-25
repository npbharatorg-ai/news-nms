import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const PopUpAdForm = ({ ad, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      link: '',
      start_date: '',
      end_date: '',
      active: true,
      display_frequency: 'once_per_day'
    }
  });

  useEffect(() => {
    if (ad) {
      form.reset({
        title: ad.title || '',
        description: ad.description || '',
        link: ad.link || '',
        start_date: ad.start_date ? ad.start_date.split('T')[0] : '',
        end_date: ad.end_date ? ad.end_date.split('T')[0] : '',
        active: ad.active ?? true,
        display_frequency: ad.display_frequency || 'once_per_day'
      });
      if (ad.image) {
        setImagePreview(pb.files.getUrl(ad, ad.image));
      }
    }
  }, [ad, form]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20971520) {
        toast.error('Image size must be less than 20MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (values) => {
    if (!values.title || !values.start_date || !values.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', values.title);
      data.append('description', values.description);
      data.append('link', values.link);
      
      const start = new Date(values.start_date);
      const end = new Date(values.end_date);
      data.append('start_date', start.toISOString());
      data.append('end_date', end.toISOString());
      
      data.append('active', values.active);
      data.append('display_frequency', values.display_frequency);

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (ad?.id) {
        await pb.collection('pop_up_ads').update(ad.id, data, { $autoCancel: false });
        toast.success('Pop-up ad updated successfully');
      } else {
        await pb.collection('pop_up_ads').create(data, { $autoCancel: false });
        toast.success('Pop-up ad created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving pop-up ad:', error);
      toast.error(error.message || 'Failed to save pop-up ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., Special Festival Offer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Image</FormLabel>
          {imagePreview ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                </div>
                <input type="file" className="hidden" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageChange} />
              </label>
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief description of the offer or announcement..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Link URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/offer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="display_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Frequency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="once_per_session">Once per session</SelectItem>
                    <SelectItem value="once_per_day">Once per day</SelectItem>
                    <SelectItem value="always">Always show</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-6">
                <div className="space-y-0.5">
                  <FormLabel>Status</FormLabel>
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
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {ad ? 'Update Ad' : 'Create Ad'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PopUpAdForm;