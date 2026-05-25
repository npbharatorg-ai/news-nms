import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { applyWatermark } from '@/utils/watermarkImage.js';

const CATEGORIES = [
  { value: 'Politics', label: 'Politics (राजनीति)' },
  { value: 'National News', label: 'National News (देश)' },
  { value: 'International News', label: 'International News (विदेश)' },
  { value: 'Crime', label: 'Crime (अपराध)' },
  { value: 'Education', label: 'Education (शिक्षा)' },
  { value: 'Health', label: 'Health (स्वास्थ्य)' },
  { value: 'Employment', label: 'Employment (रोजगार)' },
  { value: 'Business', label: 'Business (व्यापार)' },
  { value: 'Technology', label: 'Technology (टेक्नोलॉजी)' },
  { value: 'Sports', label: 'Sports (खेल)' },
  { value: 'Entertainment', label: 'Entertainment (मनोरंजन)' },
  { value: 'Religion', label: 'Religion (धर्म)' },
  { value: 'Agriculture', label: 'Agriculture (कृषि)' },
  { value: 'Weather', label: 'Weather (मौसम)' },
  { value: 'Horoscope', label: 'Horoscope (राशिफल)' },
  { value: 'Automobile', label: 'Automobile (ऑटोमोबाइल)' },
  { value: 'Lifestyle', label: 'Lifestyle (लाइफस्टाइल)' },
  { value: 'Women', label: 'Women (महिला)' },
  { value: 'Youth', label: 'Youth (युवा)' },
  { value: 'Social Issues', label: 'Social Issues (सामाजिक मुद्दे)' },
  { value: 'Government Schemes', label: 'Government Schemes (सरकारी योजना)' },
  { value: 'Court / Judiciary', label: 'Court / Judiciary (न्यायालय)' },
  { value: 'Police Administration', label: 'Police Administration (पुलिस प्रशासन)' },
  { value: 'Local News', label: 'Local News (स्थानीय समाचार)' },
  { value: 'District News', label: 'District News (जिला समाचार)' },
  { value: 'State News', label: 'State News (राज्य समाचार)' },
  { value: 'RBI BANKING', label: 'RBI BANKING (बैंकिंग)' },
  { value: 'SHARE MARKET', label: 'SHARE MARKET (शेयर मार्केट)' },
  { value: 'ELECTION ', label: 'ELECTION (चुनाव)' },
  { value: 'Breaking News', label: 'Breaking News (ब्रेकिंग न्यूज़)' }
];

const STATES = [
  { value: 'Rajasthan', label: 'Rajasthan (राजस्थान)' },
  { value: 'Gujarat', label: 'Gujarat (गुजरात)' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh (उत्तर प्रदेश)' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh (मध्य प्रदेश)' },
  { value: 'Bihar', label: 'Bihar (बिहार)' },
  { value: 'Maharashtra', label: 'Maharashtra (महाराष्ट्र)' },
  { value: 'Delhi', label: 'Delhi (दिल्ली)' },
  { value: 'Punjab', label: 'Punjab (पंजाब)' },
  { value: 'Haryana', label: 'Haryana (हरियाणा)' },
  { value: 'Uttarakhand', label: 'Uttarakhand (उत्तराखंड)' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir (जम्मू कश्मीर)' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh (हिमाचल प्रदेश)' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh (छत्तीसगढ़)' },
  { value: 'Jharkhand', label: 'Jharkhand (झारखंड)' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu (तमिलनाडु)' },
  { value: 'Karnataka', label: 'Karnataka (कर्नाटक)' },
  { value: 'Telangana', label: 'Telangana (तेलंगाना)' },
  { value: 'Kerala', label: 'Kerala (केरल)' },
  { value: 'West Bengal', label: 'West Bengal (पश्चिम बंगाल)' },
  { value: 'Assam', label: 'Assam (असम)' },
  { value: 'Odisha', label: 'Odisha (ओडिशा)' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh (आंध्र प्रदेश)' },
  { value: 'Goa', label: 'Goa (गोवा)' },
  { value: 'Manipur', label: 'Manipur (मणिपुर)' },
  { value: 'Meghalaya', label: 'Meghalaya (मेघालय)' },
  { value: 'Mizoram', label: 'Mizoram (मिजोरम)' },
  { value: 'Nagaland', label: 'Nagaland (नागालैंड)' },
  { value: 'Sikkim', label: 'Sikkim (सिक्किम)' },
  { value: 'Tripura', label: 'Tripura (त्रिपुरा)' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh (अरुणाचल प्रदेश)' },
  { value: 'Ladakh', label: 'Ladakh (लद्दाख)' },
  { value: 'Puducherry', label: 'Puducherry (पुडुचेरी)' },
  { value: 'Chandigarh', label: 'Chandigarh (चंडीगढ़)' },
  { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands (अंडमान और निकोबार द्वीप समूह)' },
  { value: 'Daman and Diu', label: 'Daman and Diu (दमन और दीव)' },
  { value: 'Dadra and Nagar Haveli', label: 'Dadra and Nagar Haveli (दादरा और नगर हवेली)' },
  { value: 'Lakshadweep', label: 'Lakshadweep (लक्षद्वीप)' }
];

const NewsUploadForm = ({ editItem, onSuccess, onCancelEdit }) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    state: '',
    district: '',
    location: '',
    content: '',
    source_link: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title || '',
        category: editItem.category || '',
        state: editItem.state || '',
        district: editItem.district || '',
        location: editItem.location || '',
        content: editItem.content || '',
        source_link: editItem.source_link || '',
      });
      if (editItem.image) {
        setImagePreview(pb.files.getUrl(editItem, editItem.image));
      }
    }
  }, [editItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image size must be less than 20MB');
      return;
    }

    setIsProcessingImage(true);
    try {
      // Apply watermark to the image
      const { file: watermarkedFile, previewUrl } = await applyWatermark(file);
      setImageFile(watermarkedFile);
      setImagePreview(previewUrl);
      toast.success('Image watermarked successfully');
    } catch (error) {
      console.error('Watermark error:', error);
      toast.error('Failed to apply watermark. Using original image.');
      // Fallback to original image if watermark fails
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(editItem?.image ? pb.files.getUrl(editItem, editItem.image) : null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      state: '',
      district: '',
      location: '',
      content: '',
      source_link: '',
    });
    setImageFile(null);
    setImagePreview(null);
    if (onCancelEdit) onCancelEdit();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (!formData.state) {
      toast.error('State is required');
      return;
    }
    if (!formData.district.trim()) {
      toast.error('District is required');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }
    if (!editItem && !imageFile) {
      toast.error('News image is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('state', formData.state);
      submitData.append('district', formData.district);
      submitData.append('location', formData.location);
      submitData.append('content', formData.content);
      if (formData.source_link) {
        submitData.append('source_link', formData.source_link);
      }
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      
      if (editItem) {
        submitData.append('status', 'draft');
        await pb.collection('reporter_news').update(editItem.id, submitData, { $autoCancel: false });
        toast.success('Draft updated successfully');
      } else {
        submitData.append('reporter_id', currentUser.id);
        submitData.append('status', 'draft');
        await pb.collection('reporter_news').create(submitData, { $autoCancel: false });
        toast.success('Draft saved successfully');
      }

      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to submit news:', error);
      toast.error('Failed to save news. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLocationField = formData.state && formData.district;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{editItem ? 'Edit Draft' : 'Upload News'}</CardTitle>
        <CardDescription>
          Save your news as a draft. You can submit it for approval from the "My News" tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">News Title <span className="text-destructive">*</span></Label>
            <Input 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Enter a compelling headline"
              disabled={isSubmitting}
              maxLength={200}
              className="text-base font-medium text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (श्रेणी) <span className="text-destructive">*</span></Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger id="category" className="text-foreground">
                <SelectValue placeholder="Category Select करें" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State (राज्य) <span className="text-destructive">*</span></Label>
            <Select
              value={formData.state}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  state: value,
                  district: '',
                  location: ''
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="state" className="text-foreground">
                <SelectValue placeholder="राज्य चुनें" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District (जिला) <span className="text-destructive">*</span></Label>
            <Input
              id="district"
              name="district"
              value={formData.district}
              placeholder="जिला लिखें"
              onChange={handleChange}
              disabled={isSubmitting}
              className="text-foreground"
            />
          </div>

          {showLocationField && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="location">Location / Tehsil / Village (स्थान / तहसील / गांव)</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                placeholder="शहर, तहसील, गांव या स्थान लिखें"
                onChange={handleChange}
                disabled={isSubmitting}
                className="text-foreground"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">News Content <span className="text-destructive">*</span></Label>
            <Textarea 
              id="content" 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              placeholder="Write the full news story here..."
              disabled={isSubmitting}
              className="min-h-[200px] leading-relaxed resize-y text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_link">Source Link (Optional)</Label>
            <Input 
              id="source_link" 
              name="source_link" 
              type="url"
              value={formData.source_link} 
              onChange={handleChange} 
              placeholder="https://..."
              disabled={isSubmitting}
              className="text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label>Featured Image {!editItem && <span className="text-destructive">*</span>}</Label>
            <div className="mt-1">
              {imagePreview ? (
                <div className="relative w-full max-w-md rounded-lg overflow-hidden border bg-muted group">
                  <img 
                    src={imagePreview} 
                    alt="News preview" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="sm" onClick={clearImage}>
                      <X className="w-4 h-4 mr-2" /> Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md">
                  <Label 
                    htmlFor="image-upload" 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {isProcessingImage ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <p className="text-sm font-medium text-primary">Applying watermark...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                        <UploadCloud className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium mb-1">Click to upload image</p>
                        <p className="text-xs">JPG, PNG, GIF, WEBP (Max 20MB)</p>
                        <p className="text-xs text-primary mt-1">Watermark will be applied automatically</p>
                      </div>
                    )}
                    <Input 
                      id="image-upload" 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp" 
                      className="hidden" 
                      onChange={handleImageChange}
                      disabled={isSubmitting || isProcessingImage}
                    />
                  </Label>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            {editItem && (
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting || isProcessingImage}>
                Cancel Edit
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isProcessingImage}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span>{editItem ? 'Update Draft' : 'Save as Draft'}</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsUploadForm;