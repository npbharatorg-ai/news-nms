import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, ArrowLeft, FileText, User, Phone, Mail, Calendar, MapPin, IndianRupee } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const Step3ReviewApplication = ({ registrationId, formData, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationData, setValidationData] = useState(null);

  useEffect(() => {
    validateRegistration();
  }, []);

  const validateRegistration = async () => {
    if (!registrationId) {
      setError('Registration ID is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiServerClient.fetch('/new-registration/step3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to validate registration');
      }

      setValidationData(result);
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    onNext();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <p className="text-xs mt-1">Please go back and complete all required steps</p>
          </div>
        </div>
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6 bg-card">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Full Name</p>
            <p className="font-medium">{formData.fullName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone Number</p>
            <p className="font-medium flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {formData.phoneNumber}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {formData.email}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Date of Birth</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formData.dateOfBirth}
            </p>
          </div>
          {formData.fatherName && (
            <div>
              <p className="text-muted-foreground">Father's / Husband's Name</p>
              <p className="font-medium">{formData.fatherName}</p>
            </div>
          )}
          {formData.fullAddress && (
            <div className="md:col-span-2">
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium flex items-start gap-1">
                <MapPin className="w-3 h-3 mt-1 shrink-0" />
                {formData.fullAddress}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-card">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Documents Uploaded
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-full h-32 bg-muted rounded-lg mb-2 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Passport Photo</p>
          </div>
          <div className="text-center">
            <div className="w-full h-32 bg-muted rounded-lg mb-2 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Aadhaar Front</p>
          </div>
          <div className="text-center">
            <div className="w-full h-32 bg-muted rounded-lg mb-2 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Aadhaar Back</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-primary" />
          Fee Breakdown
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Registration Fee</span>
            <span className="font-medium">₹5,000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee</span>
            <span className="font-medium">₹0</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-primary">₹5,000</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleProceedToPayment} size="lg" className="gap-2">
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

export default Step3ReviewApplication;