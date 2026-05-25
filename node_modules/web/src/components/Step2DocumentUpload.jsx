import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadCloud, X, FileImage, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const FileUploadZone = ({ label, file, onFileSelect, onRemove, uploading }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const validateAndSelect = (selectedFile) => {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Only JPEG and PNG images are allowed');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    onFileSelect(selectedFile);
  };

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{label} <span className="text-destructive">*</span></p>
      {!file ? (
        <div 
          className={`file-upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Click or drag file here</p>
          <p className="text-xs text-muted-foreground mt-1">JPEG or PNG, max 5MB</p>
          <input 
            type="file" 
            ref={inputRef} 
            className="hidden" 
            accept="image/jpeg, image/png"
            onChange={(e) => e.target.files?.[0] && validateAndSelect(e.target.files[0])}
            disabled={uploading}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border bg-muted/30 group">
          <img src={URL.createObjectURL(file)} alt={label} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onRemove} 
              className="gap-2"
              disabled={uploading}
            >
              <X className="w-4 h-4" /> Remove
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-2 text-xs flex items-center gap-2 truncate">
            <FileImage className="w-3 h-3 shrink-0" />
            <span className="truncate">{file.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Step2DocumentUpload = ({ registrationId, onNext, onBack, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [docs, setDocs] = useState({
    photo: initialData?.photo || null,
    aadhaarFront: initialData?.aadhaarFront || null,
    aadhaarBack: initialData?.aadhaarBack || null
  });

  const isComplete = docs.photo && docs.aadhaarFront && docs.aadhaarBack;

  const handleNext = async () => {
    if (!isComplete) {
      toast.error('Please upload all required documents');
      return;
    }
    
    if (!registrationId) {
      toast.error('Registration ID is missing. Please go back to step 1.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('registrationId', registrationId);
      formData.append('photo', docs.photo);
      formData.append('aadhaarFront', docs.aadhaarFront);
      formData.append('aadhaarBack', docs.aadhaarBack);

      const res = await apiServerClient.fetch('/new-registration/step2', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to upload documents');
      }

      toast.success('Documents uploaded successfully');
      onNext(docs);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadZone 
          label="Passport Size Photo" 
          file={docs.photo} 
          onFileSelect={(f) => setDocs(p => ({ ...p, photo: f }))}
          onRemove={() => setDocs(p => ({ ...p, photo: null }))}
          uploading={loading}
        />
        <FileUploadZone 
          label="Aadhaar Card (Front)" 
          file={docs.aadhaarFront} 
          onFileSelect={(f) => setDocs(p => ({ ...p, aadhaarFront: f }))}
          onRemove={() => setDocs(p => ({ ...p, aadhaarFront: null }))}
          uploading={loading}
        />
        <FileUploadZone 
          label="Aadhaar Card (Back)" 
          file={docs.aadhaarBack} 
          onFileSelect={(f) => setDocs(p => ({ ...p, aadhaarBack: f }))}
          onRemove={() => setDocs(p => ({ ...p, aadhaarBack: null }))}
          uploading={loading}
        />
      </div>

      {isComplete && !loading && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 text-primary">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">All documents uploaded successfully</p>
          </div>
        </Card>
      )}

      <div className="flex justify-between pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={loading} 
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isComplete || loading} 
          className="gap-2" 
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </>
          ) : (
            'Continue to Review'
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step2DocumentUpload;