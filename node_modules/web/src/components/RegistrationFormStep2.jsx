import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, UploadCloud, X } from 'lucide-react';

const FileUploadZone = ({ id, label, file, preview, onChange, onRemove, error, description }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      
      {preview ? (
        <div className="relative rounded-xl border overflow-hidden bg-slate-50 group">
          <img src={preview} alt={`${label} preview`} className="w-full h-48 object-contain p-2" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button type="button" variant="destructive" size="sm" onClick={onRemove} className="gap-2">
              <X className="w-4 h-4" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className={`border-2 border-dashed rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative ${error ? 'border-destructive bg-destructive/5' : 'border-slate-300'}`}>
          <input 
            type="file" 
            id={id} 
            accept="image/jpeg, image/png, image/webp" 
            onChange={onChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className={`h-8 w-8 mx-auto mb-3 ${error ? 'text-destructive' : 'text-slate-400'}`} />
          <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500 mt-1">JPEG, PNG up to 5MB</p>
        </div>
      )}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};

const RegistrationFormStep2 = ({ formData, setFormData, previews, setPreviews, onNext, onBack }) => {
  const [errors, setErrors] = useState({});

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [field]: "Please upload an image file (JPEG, PNG)." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [field]: "File size must be less than 5MB." }));
      return;
    }

    setErrors(prev => ({ ...prev, [field]: null }));
    setFormData(prev => ({ ...prev, [field]: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (field) => () => {
    setFormData(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => ({ ...prev, [field]: null }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.photo) newErrors.photo = "Passport size photo is required.";
    if (!formData.aadhar_front) newErrors.aadhar_front = "Aadhar Card Front is required.";
    if (!formData.aadhar_back) newErrors.aadhar_back = "Aadhar Card Back is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Required Documents</h3>
        <p className="text-sm text-muted-foreground">Please upload clear images of your documents for verification and ID card generation.</p>
        
        <FileUploadZone 
          id="photo"
          label="Passport Size Photo"
          description="Clear, recent passport size photograph for your Press ID."
          file={formData.photo}
          preview={previews.photo}
          onChange={handleFileChange('photo')}
          onRemove={handleRemoveFile('photo')}
          error={errors.photo}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploadZone 
            id="aadhar_front"
            label="Aadhar Card (Front)"
            description="Clear image of the front side of your Aadhar card."
            file={formData.aadhar_front}
            preview={previews.aadhar_front}
            onChange={handleFileChange('aadhar_front')}
            onRemove={handleRemoveFile('aadhar_front')}
            error={errors.aadhar_front}
          />

          <FileUploadZone 
            id="aadhar_back"
            label="Aadhar Card (Back)"
            description="Clear image of the back side of your Aadhar card."
            file={formData.aadhar_back}
            preview={previews.aadhar_back}
            onChange={handleFileChange('aadhar_back')}
            onRemove={handleRemoveFile('aadhar_back')}
            error={errors.aadhar_back}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNext} className="gap-2">
          Review Details <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RegistrationFormStep2;