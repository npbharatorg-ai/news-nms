import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, User, Mail, Phone, Calendar, Receipt } from 'lucide-react';

const RegistrationReview = ({ formData, previews, onBack, onSubmit, isSubmitting }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Please review your details carefully. These details will be used for your official Press ID card and cannot be easily changed later.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Personal Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{formData.name}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{formData.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium">{formData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formData.dob ? new Date(formData.dob).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold border-b pb-2 mt-8">Uploaded Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Photo</p>
              <div className="rounded-lg border overflow-hidden bg-slate-50 h-32">
                {previews.photo ? (
                  <img src={previews.photo} alt="Photo" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Missing</div>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Aadhar Front</p>
              <div className="rounded-lg border overflow-hidden bg-slate-50 h-32">
                {previews.aadhar_front ? (
                  <img src={previews.aadhar_front} alt="Aadhar Front" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Missing</div>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Aadhar Back</p>
              <div className="rounded-lg border overflow-hidden bg-slate-50 h-32">
                {previews.aadhar_back ? (
                  <img src={previews.aadhar_back} alt="Aadhar Back" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Missing</div>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold border-b pb-2 mt-8 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" /> Fee Breakdown
          </h3>
          
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-slate-600">
              <span>Premium Reporter Registration Fee</span>
              <span>₹5000.00</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Platform Processing Fee</span>
              <span>₹0.00</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center font-bold text-lg text-slate-900">
              <span>Total Amount Payable</span>
              <span>₹5000.00</span>
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Edit Details
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting} className="gap-2 bg-primary hover:bg-primary/90">
          {isSubmitting ? "Creating Account..." : "Confirm & Proceed to Payment"}
        </Button>
      </div>
    </div>
  );
};

export default RegistrationReview;