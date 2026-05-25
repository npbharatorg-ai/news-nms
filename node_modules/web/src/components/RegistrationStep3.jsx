import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, ArrowRight, ArrowLeft, Loader2, IndianRupee } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const RegistrationStep3 = ({ registrationId, formData, documents, onNext, onBack, onEditStep }) => {
  const [loading, setLoading] = useState(false);

  const DetailRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-border last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-foreground sm:text-right">{value || '-'}</span>
    </div>
  );

  const handleConfirm = async () => {
    if (!registrationId) {
      toast.error('Registration ID is missing. Please go back to step 1.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_address: formData.full_address,
        father_name: formData.father_name
      };

      const res = await apiServerClient.fetch(`/registration/step3/${registrationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to confirm details');
      }

      toast.success('Details confirmed successfully');
      onNext();
    } catch (error) {
      console.error('Step 3 error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2 mb-8">
        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
          <span>Step 3 of 4</span>
          <span>75% Complete</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500 w-[75%]" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mt-4">Review Application</h2>
        <p className="text-muted-foreground">Review your information before proceeding to payment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">Personal Details</h3>
                <Button variant="ghost" size="sm" onClick={() => onEditStep(1)} disabled={loading} className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10">
                  <Edit2 className="w-3 h-3" /> Edit
                </Button>
              </div>
              <div className="space-y-1">
                <DetailRow label="Full Name" value={formData.full_name} />
                <DetailRow label="Phone Number" value={formData.phone_number} />
                <DetailRow label="Email Address" value={formData.email} />
                <DetailRow label="Date of Birth" value={formData.date_of_birth} />
                <DetailRow label="Father's Name" value={formData.father_name} />
                <DetailRow label="Full Address" value={formData.full_address} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">Uploaded Documents</h3>
                <Button variant="ghost" size="sm" onClick={() => onEditStep(2)} disabled={loading} className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10">
                  <Edit2 className="w-3 h-3" /> Edit
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(documents || {}).map(([key, file]) => (
                  <div key={key} className="space-y-2">
                    <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                      {file && <img src={URL.createObjectURL(file)} alt={key} className="w-full h-full object-cover" />}
                    </div>
                    <p className="text-xs text-center text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-primary/20 shadow-md bg-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
                <IndianRupee className="w-5 h-5 text-primary" />
                Fee Breakdown
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Registration Fee</span>
                  <span className="font-medium text-foreground">₹5,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-medium text-foreground">₹0</span>
                </div>
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-lg text-foreground">Total</span>
                  <span className="font-extrabold text-2xl text-primary">₹5,000</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleConfirm} disabled={loading} className="w-full gap-2" size="lg">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Payment...</>
                  ) : (
                    <>Confirm & Proceed to Payment <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
                <Button variant="outline" onClick={onBack} disabled={loading} className="w-full">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default RegistrationStep3;