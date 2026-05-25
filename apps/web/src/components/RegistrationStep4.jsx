import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Building, UploadCloud, Loader2, CheckCircle2, QrCode } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const RegistrationStep4 = ({ registrationId, formData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [offlineData, setOfflineData] = useState({ screenshot: null, transactionId: '' });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleOnlinePayment = async () => {
    if (!registrationId) {
      toast.error('Registration ID is missing.');
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay Order
      const orderRes = await apiServerClient.fetch('/registration/payment/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, amount: 5000 })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const options = {
        key: 'rzp_live_SUweY79cY6Y0yv',
        amount: 500000, // 5000 INR in paise
        currency: "INR",
        name: "Navdhriti Manavadhikar Samachar",
        description: "Reporter Registration Fee",
        order_id: orderData.orderId || orderData.id,
        handler: async function (response) {
          try {
            // Verify Payment using Step 4 endpoint structure
            const verifyRes = await apiServerClient.fetch(`/registration/step4/${registrationId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                payment_method: 'online',
                amount: 5000,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
            
            toast.success('Payment successful! Your account is approved.');
            onSuccess(registrationId, 'online', verifyData.userId);
          } catch (err) {
            console.error('Verification error:', err);
            toast.error(err.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData?.full_name || '',
          email: formData?.email || '',
          contact: formData?.phone_number || ''
        },
        theme: { color: "#DC143C" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Could not initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineSubmit = async (e) => {
    e.preventDefault();
    if (!offlineData.screenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    if (!registrationId) {
      toast.error('Registration ID is missing.');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('payment_method', 'offline');
      form.append('amount', 5000);
      form.append('payment_proof', offlineData.screenshot);
      if (offlineData.transactionId) {
        form.append('transaction_id', offlineData.transactionId);
      }

      const res = await apiServerClient.fetch(`/registration/step4/${registrationId}`, {
        method: 'POST',
        body: form
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit offline payment');
      }
      
      toast.success('Payment submitted. It will be verified by admin within 24-48 hours.');
      onSuccess(registrationId, 'offline');
    } catch (error) {
      console.error('Offline payment error:', error);
      toast.error(error.message || 'Failed to submit payment details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-2 mb-8 text-center">
        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground text-left">
          <span>Step 4 of 4</span>
          <span>100% Complete</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden text-left">
          <div className="h-full bg-primary rounded-full transition-all duration-500 w-full" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mt-8">Complete Payment</h2>
        <p className="text-muted-foreground">Select your preferred payment method.</p>
      </div>

      <Tabs defaultValue="online" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted text-muted-foreground p-1">
          <TabsTrigger value="online" className="gap-2 py-3 data-[state=active]:bg-background data-[state=active]:text-foreground"><CreditCard className="w-4 h-4"/> Pay Online</TabsTrigger>
          <TabsTrigger value="offline" className="gap-2 py-3 data-[state=active]:bg-background data-[state=active]:text-foreground"><Building className="w-4 h-4"/> Pay Offline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="online">
          <Card className="border-primary/20 shadow-md bg-card">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Total Amount Payable</p>
                <p className="text-4xl font-extrabold text-foreground">₹5,000</p>
              </div>
              <div className="bg-muted p-4 rounded-xl text-sm text-left space-y-3">
                <p className="flex items-center gap-3 text-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/> Instant account activation</p>
                <p className="flex items-center gap-3 text-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/> Secure payment via Razorpay</p>
                <p className="flex items-center gap-3 text-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/> Supports UPI, Cards, NetBanking</p>
              </div>
              <Button onClick={handleOnlinePayment} disabled={loading} className="w-full h-12 text-lg font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Pay ₹5,000 Now
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="offline">
          <Card className="bg-card">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b border-border pb-2 text-foreground">Bank Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Bank:</span> <strong className="text-foreground">State Bank of India</strong></p>
                    <p><span className="text-muted-foreground">Account Name:</span> <strong className="text-foreground">Navdhriti Manavadhikar</strong></p>
                    <p><span className="text-muted-foreground">Account No:</span> <strong className="text-foreground font-mono">123456789012</strong></p>
                    <p><span className="text-muted-foreground">IFSC Code:</span> <strong className="text-foreground font-mono">SBIN0001234</strong></p>
                    <p><span className="text-muted-foreground">Amount:</span> <strong className="text-primary text-lg">₹5,000</strong></p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-muted/50 p-4 rounded-xl border border-border">
                  <p className="text-sm font-medium mb-3 text-foreground text-center">Scan to Pay via UPI</p>
                  <div className="bg-white p-2 rounded-lg">
                    <QrCode className="w-28 h-28 text-slate-800" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleOfflineSubmit} className="space-y-6 border-t border-border pt-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Upload Payment Screenshot <span className="text-destructive">*</span></Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/50 bg-background transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 5 * 1024 * 1024) {
                          toast.error('File size must be less than 5MB');
                          return;
                        }
                        setOfflineData(p => ({ ...p, screenshot: file }));
                      }}
                      required
                    />
                    {offlineData.screenshot ? (
                      <p className="text-sm font-medium text-primary flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {offlineData.screenshot.name}
                      </p>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground">Click to upload screenshot</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG or PNG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="txnId" className="text-foreground">Transaction ID / UTR (Optional)</Label>
                  <Input 
                    id="txnId" 
                    value={offlineData.transactionId}
                    onChange={(e) => setOfflineData(p => ({ ...p, transactionId: e.target.value }))}
                    placeholder="e.g. 123456789012"
                    className="bg-background text-foreground"
                  />
                </div>
                <Button type="submit" disabled={loading || !offlineData.screenshot} className="w-full size-lg text-base">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Submit for Verification
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegistrationStep4;