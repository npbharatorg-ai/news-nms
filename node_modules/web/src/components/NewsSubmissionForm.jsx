import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UploadCloud, AlertCircle, Lock, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { applyWatermark } from '@/utils/watermarkImage.js';
import { convertAVIFToWebP, compressImage } from '@/utils/imageConverter.js';

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
  { value: 'RBI BANKING', label: 'RBI BANKING (बैंकिंग)' },
  { value: 'SHARE MARKET', label: 'SHARE MARKET (शेयर मार्केट)' },
  { value: 'ELECTION ', label: 'ELECTION (चुनाव)' },
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

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(150, 'Title cannot exceed 150 characters'),
  category: z.string().min(1, 'कृपया Category चुनें / Please select a category'),
  state: z.string().optional(),
  location: z.string().optional(),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  source_link: z.string().url('Invalid URL').optional().or(z.literal('')),
}).refine((data) => {
  if (data.category === 'State News') {
    return data.state && data.state.length > 0;
  }
  return true;
}, {
  message: 'कृपया State चुनें / Please select a state',
  path: ['state']
}).refine((data) => {
  if (data.state && data.state.length > 0) {
    return data.location && data.location.length >= 2 && data.location.length <= 100;
  }
  return true;
}, {
  message: 'कृपया Location भरें (2-100 characters) / Please enter location',
  path: ['location']
});

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

const NewsSubmissionForm = ({ onSuccess }) => {
  const { currentUser, checkExpiry } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [photo1, setPhoto1] = useState(null);
  const [photo1Preview, setPhoto1Preview] = useState(null);
  const [isProcessing1, setIsProcessing1] = useState(false);
  const [processMessage1, setProcessMessage1] = useState('');
  const [dragActive1, setDragActive1] = useState(false);
  
  const [reporterStatus, setReporterStatus] = useState('loading');
  const [statusMessage, setStatusMessage] = useState('');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      state: '',
      location: '',
      content: '',
      source_link: '',
    },
  });

  const selectedCategory = form.watch('category');
  const selectedState = form.watch('state');
  const selectedLocation = form.watch('location');
  
  const showStateField = selectedCategory === 'State News';
  const showLocationField = showStateField && selectedState && selectedState.length > 0;

  // Debug logging
  useEffect(() => {
    console.log('Selected category:', selectedCategory);
    console.log('Show state field:', showStateField);
  }, [selectedCategory, showStateField]);

  useEffect(() => {
    console.log('Selected state:', selectedState);
    console.log('Show location field:', showLocationField);
  }, [selectedState, showLocationField]);

  useEffect(() => {
    console.log('Location:', selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    if (!showStateField) {
      console.log('Clearing state and location fields (category changed)');
      form.setValue('state', '');
      form.setValue('location', '');
    }
  }, [showStateField, form]);

  useEffect(() => {
    if (!showLocationField) {
      console.log('Clearing location field (state changed)');
      form.setValue('location', '');
    }
  }, [showLocationField, form]);

  useEffect(() => {
    const verifyStatus = async () => {
      if (!currentUser?.id) return;
      try {
        const reporter = await pb.collection('reporter_registrations').getOne(currentUser.id, { $autoCancel: false });
        const checkedReporter = await checkExpiry(reporter);
        
        setReporterStatus(checkedReporter.status || 'PENDING');
        
        if (checkedReporter.status === 'INACTIVE') {
          setStatusMessage('Your press ID has expired. Please renew your subscription to continue publishing.');
        } else if (checkedReporter.status !== 'ACTIVE') {
          setStatusMessage('Your account is not active. Please wait for admin approval.');
        }
      } catch (error) {
        console.error("Failed to verify reporter status:", error);
        setReporterStatus('ERROR');
      }
    };
    
    verifyStatus();
  }, [currentUser, checkExpiry]);

  const processFile = async (file, setFile, setPreview, setIsProcessing, setProcessMessage) => {
    if (!file) return;

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast.error('Unsupported file format. Please use JPEG, PNG, GIF, WebP, or AVIF.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setIsProcessing(true);
    try {
      let currentFile = file;

      if (currentFile.type === 'image/avif') {
        setProcessMessage('Converting AVIF to WebP...');
        currentFile = await convertAVIFToWebP(currentFile);
      }

      setProcessMessage('Compressing image...');
      currentFile = await compressImage(currentFile, 0.85);

      setProcessMessage('Applying watermark...');
      const { file: watermarkedFile, previewUrl } = await applyWatermark(currentFile);
      
      setFile(watermarkedFile);
      setPreview(previewUrl);
      toast.success('Image processed and watermarked successfully');
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error(error.message || 'Failed to process image. Using original.');
      if (file.type !== 'image/avif') {
        setFile(file);
        setPreview(URL.createObjectURL(file));
      }
    } finally {
      setIsProcessing(false);
      setProcessMessage('');
    }
  };

  const handleFileChange = (e, setFile, setPreview, setIsProcessing, setProcessMessage) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, setFile, setPreview, setIsProcessing, setProcessMessage);
    }
    e.target.value = '';
  };

  const handleDrag = useCallback((e, setDragActive) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e, setDragActive, setFile, setPreview, setIsProcessing, setProcessMessage) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], setFile, setPreview, setIsProcessing, setProcessMessage);
    }
  }, []);

  const onSubmit = async (values) => {
    console.log('Form submission started with values:', values);
    
    if (reporterStatus !== 'ACTIVE') {
      toast.error(statusMessage || 'Account not active');
      return;
    }

    if (!photo1) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);
    try {
      const reporter = await pb.collection('reporter_registrations').getOne(currentUser.id, { $autoCancel: false });
      const checkedReporter = await checkExpiry(reporter);
      
      if (checkedReporter.status !== 'ACTIVE') {
        setReporterStatus(checkedReporter.status);
        toast.error('Your account is no longer active or has expired.');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('category', values.category);
      formData.append('content', values.content);
      formData.append('reporter_id', currentUser.id);
      formData.append('status', 'pending_approval');
      
      if (values.state) {
        console.log('Adding state to form data:', values.state);
        formData.append('state', values.state);
      }
      
      if (values.location) {
        console.log('Adding location to form data:', values.location);
        formData.append('location', values.location);
      }
      
      if (values.source_link) {
        console.log('Adding source_link to form data:', values.source_link);
        formData.append('source_link', values.source_link);
      }
      
      if (photo1) formData.append('image', photo1);

      console.log('Submitting to PocketBase...');
      const record = await pb.collection('reporter_news').create(formData, { $autoCancel: false });
      console.log('News submitted successfully:', record);
      
      toast.success('News submitted successfully! Waiting for admin approval.');
      form.reset();
      setPhoto1(null);
      setPhoto1Preview(null);
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit news. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (reporterStatus === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reporterStatus !== 'ACTIVE') {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
        <Lock className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">Submission Disabled</AlertTitle>
        <AlertDescription className="mt-2 text-sm">
          {statusMessage}
          {reporterStatus === 'INACTIVE' && (
            <div className="mt-4">
              <Button onClick={() => navigate('/reporter/renewal')} variant="outline" className="bg-white text-red-700 border-red-200 hover:bg-red-50">
                Renew Subscription Now
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Headline / Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a catchy headline..." {...field} className="text-foreground" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Story Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your full news story here..." 
                  className="min-h-[200px] resize-y text-foreground"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Primary Image (Required)</Label>
          <div 
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors relative overflow-hidden ${
              dragActive1 ? 'border-primary bg-primary/5' : 'border-slate-300 hover:bg-slate-50'
            } ${isProcessing1 ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}`}
            onDragEnter={(e) => handleDrag(e, setDragActive1)}
            onDragLeave={(e) => handleDrag(e, setDragActive1)}
            onDragOver={(e) => handleDrag(e, setDragActive1)}
            onDrop={(e) => handleDrop(e, setDragActive1, setPhoto1, setPhoto1Preview, setIsProcessing1, setProcessMessage1)}
          >
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/gif, image/webp, image/avif" 
              onChange={(e) => handleFileChange(e, setPhoto1, setPhoto1Preview, setIsProcessing1, setProcessMessage1)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isProcessing1}
            />
            
            {isProcessing1 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-sm font-medium text-primary">{processMessage1}</p>
              </div>
            ) : photo1Preview ? (
              <div className="relative aspect-video w-full">
                <img src={photo1Preview} alt="Preview" className="object-contain w-full h-full rounded-md" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Click or drag to change</p>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <UploadCloud className={`h-10 w-10 mx-auto mb-3 ${dragActive1 ? 'text-primary' : 'text-slate-400'}`} />
                <p className="text-sm font-medium text-slate-700">Click or drag image here</p>
                <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP, AVIF (Max 10MB)</p>
                <div className="flex items-center justify-center gap-1 mt-3 text-[10px] text-slate-400 bg-slate-100 w-fit mx-auto px-2 py-1 rounded-full">
                  <ImageIcon className="w-3 h-3" /> Auto-converts AVIF & applies watermark
                </div>
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (श्रेणी)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="text-foreground">
                    <SelectValue placeholder="Select a category / श्रेणी चुनें" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showStateField && (
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="animate-in slide-in-from-top-2 duration-300">
                <FormLabel>State (राज्य)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select a state / राज्य चुनें" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATES.map(state => (
                      <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showLocationField && (
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="animate-in slide-in-from-top-2 duration-300">
                <FormLabel>Location (स्थान)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="यहां शहर, गांव, जिला, तहसील या स्थान का नाम लिखें" 
                    maxLength={100}
                    className="text-foreground"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="source_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Link (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="url"
                  placeholder="https://example.com/source-article" 
                  className="text-foreground"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-sm text-blue-800 border border-blue-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>All submissions are reviewed by our editorial team before publishing. Ensure your content follows our journalistic guidelines.</p>
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || isProcessing1}>
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            'Submit for Review'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default NewsSubmissionForm;