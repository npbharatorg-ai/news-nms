import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const RazorpayPaymentModal = ({ amount, orderId, onSuccess, onFailure, prefillData }) => {
  useEffect(() => {
    if (!window.Razorpay) {
      onFailure('Razorpay SDK failed to load. Please check your connection.');
      return;
    }

    const options = {
      key: 'rzp_test_SXoWWjFZ4hFgwd', // Test key from environment requirements
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Navdhriti Manawadhikar',
      description: 'Reporter Registration Fee',
      order_id: orderId,
      handler: function (response) {
        onSuccess(response.razorpay_payment_id, response.razorpay_signature);
      },
      prefill: {
        name: prefillData?.name || '',
        email: prefillData?.email || '',
        contact: prefillData?.phone || ''
      },
      theme: {
        color: '#0f172a' // Matches brand primary/dark
      },
      modal: {
        ondismiss: function() {
          onFailure('Payment cancelled by user.');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
      onFailure(response.error.description || 'Payment failed');
    });

    rzp.open();

    // Cleanup
    return () => {
      // Razorpay handles its own cleanup on close
    };
  }, [amount, orderId, onSuccess, onFailure, prefillData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card p-8 rounded-2xl shadow-lg flex flex-col items-center max-w-sm text-center border">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-bold mb-2">Opening Secure Payment Gateway</h3>
        <p className="text-muted-foreground text-sm">Please do not close or refresh this window.</p>
      </div>
    </div>
  );
};

export default RazorpayPaymentModal;