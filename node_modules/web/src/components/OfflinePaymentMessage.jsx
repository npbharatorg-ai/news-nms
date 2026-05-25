import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const OfflinePaymentMessage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto bg-card rounded-2xl border shadow-sm">
      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
        <Clock className="w-8 h-8" />
      </div>
      
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-4">
        Status: Pending
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Registration Submitted</h2>
      
      <p className="text-lg font-medium text-foreground mb-2">
        Admin 24-48 घंटे में आपके payment को approve करेगा
      </p>
      
      <p className="text-muted-foreground mb-8">
        Your registration is pending. Admin will approve within 24-48 hours after verifying your offline payment.
      </p>
      
      <Button onClick={() => navigate('/reporter-login')} className="w-full gap-2">
        Go to Login <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default OfflinePaymentMessage;