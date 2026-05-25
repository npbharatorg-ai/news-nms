import React from 'react';
import { Card } from '@/components/ui/card';
import { CreditCard, Building2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PaymentMethodSelector = ({ onOnlinePayment, onOfflinePayment, disabled }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
      <Card 
        onClick={disabled ? undefined : onOnlinePayment}
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300 border-2 hover:border-primary hover:shadow-md group",
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Pay Online</h3>
          <p className="text-3xl font-extrabold text-primary mb-4">₹5000</p>
          <p className="text-sm text-muted-foreground mb-6 flex-1">
            Instant approval. Pay securely via UPI, Credit/Debit Card, or NetBanking.
          </p>
          <div className="flex items-center text-sm font-medium text-primary mt-auto">
            Proceed to Pay <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>

      <Card 
        onClick={disabled ? undefined : onOfflinePayment}
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300 border-2 hover:border-secondary hover:shadow-md group",
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Pay Offline</h3>
          <p className="text-xl font-semibold text-secondary mb-4">Bank Transfer / Cash</p>
          <p className="text-sm text-muted-foreground mb-6 flex-1">
            Manual verification required. Admin will approve your account within 24-48 hours after payment confirmation.
          </p>
          <div className="flex items-center text-sm font-medium text-secondary mt-auto">
            Submit Request <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentMethodSelector;