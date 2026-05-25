import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PaymentProofUpload = ({ onUpload, isSubmitting }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/jpeg') && !selectedFile.type.startsWith('image/png')) {
      toast.error('Invalid file type. Please upload a JPG or PNG image.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }
    onUpload(file);
  };

  return (
    <div className="space-y-6">
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ease-in-out flex flex-col items-center justify-center min-h-[240px]",
          dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-slate-300 bg-slate-50 hover:bg-slate-100",
          preview ? "border-solid border-slate-200 p-4" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
              <img src={preview} alt="Payment Proof Preview" className="w-full h-auto max-h-[300px] object-contain" />
              <button 
                onClick={clearFile}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-700 mt-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" /> {file.name}
            </p>
          </div>
        ) : (
          <>
            <input 
              ref={inputRef}
              type="file" 
              accept="image/jpeg, image/png" 
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isSubmitting}
            />
            <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Upload Payment Proof</h3>
            <p className="text-sm text-slate-500 text-center max-w-[250px]">
              Drag and drop your screenshot here, or click to browse
            </p>
            <div className="flex items-center gap-4 mt-6 text-xs font-medium text-slate-400 uppercase tracking-wider">
              <span>JPG, PNG</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Max 5MB</span>
            </div>
          </>
        )}
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={!file || isSubmitting}
        className="w-full h-12 text-base font-semibold shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
            Uploading Proof...
          </>
        ) : (
          "Submit Payment Proof"
        )}
      </Button>
    </div>
  );
};

export default PaymentProofUpload;