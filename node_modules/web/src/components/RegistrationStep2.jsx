import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, FileImage, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const FileUploadZone = ({ label, file, onFileSelect, onRemove }) => {
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
      toast.error('Only JPG and PNG images are allowed');
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
      <p className="font-medium text-sm text-foreground">{label} <span className="text-destructive">*</span></p>
      {!file ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50 bg-background'}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">Click or drag file here</p>
          <p className="text-xs text-muted-foreground mt-1">JPG or PNG, up to 5MB</p>
          <input 
            type="file" ref={inputRef} className="hidden" accept="image/jpeg, image/png"
            onChange={(e) => e.target.files?.[0] && validateAndSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 group">
          <img src={URL.createObjectURL(file)} alt={label} className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="gap-2">
              <X className="w-4 h-4" /> Remove
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-2 text-xs flex items-center gap-2 truncate text-foreground border-t border-border">
            <FileImage className="w-3 h-3 shrink-0 text-primary" />
            <span className="truncate">{file.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const RegistrationStep2 = ({ registrationId, documents, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState({
    passport_photo: documents?.passport_photo || null,
    aadhaar_front: documents?.aadhaar_front || null,
    aadhaar_back: documents?.aadhaar_back || null
  });

  const isComplete = docs.passport_photo && docs.aadhaar_front && docs.aadhaar_back;

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
    try {
      const formData = new FormData();
      formData.append('photo', docs.passport_photo);
      formData.append('aadhar_front', docs.aadhaar_front);
      formData.append('aadhar_back', docs.aadhaar_back);

      const res = await apiServerClient.fetch(`/registration/step2/${registrationId}`, {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to upload documents');
      }

      toast.success('Documents uploaded successfully');
      onNext(docs);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2 mb-8">
        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
          <span>Step 2 of 4</span>
          <span>50% Complete</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500 w-[50%]" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mt-4">Document Upload</h2>
        <p className="text-muted-foreground">Please provide clear copies of the required documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadZone 
          label="Passport Size Photo" 
          file={docs.passport_photo} 
          onFileSelect={(f) => setDocs(p => ({ ...p, passport_photo: f }))}
          onRemove={() => setDocs(p => ({ ...p, passport_photo: null }))}
        />
        <FileUploadZone 
          label="Aadhaar Card (Front)" 
          file={docs.aadhaar_front} 
          onFileSelect={(f) => setDocs(p => ({ ...p, aadhaar_front: f }))}
          onRemove={() => setDocs(p => ({ ...p, aadhaar_front: null }))}
        />
        <FileUploadZone 
          label="Aadhaar Card (Back)" 
          file={docs.aadhaar_back} 
          onFileSelect={(f) => setDocs(p => ({ ...p, aadhaar_back: f }))}
          onRemove={() => setDocs(p => ({ ...p, aadhaar_back: null }))}
        />
      </div>

      <div className="flex justify-between pt-6 border-t border-border mt-8">
        <Button variant="outline" onClick={onBack} disabled={loading} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!isComplete || loading} className="gap-2" size="lg">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
          ) : (
            <>Review Details <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RegistrationStep2;