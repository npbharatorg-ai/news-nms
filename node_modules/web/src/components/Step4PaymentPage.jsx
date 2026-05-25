import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, CreditCard, Upload, QrCode, ArrowLeft, CheckCircle2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const Step4PaymentPage = ({ registrationId, onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [offlineData, setOfflineData] = useState({
    transactionId: '',
    screenshot: null
  });

  const handleOnlinePayment = async () => {
    if (!registrationId) {
      toast.error('Registration ID is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiServerClient.fetch('/new-registration/payment/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, amount: 5000 })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to create payment order');
      }

      const options = {
        key: result.key,
        amount: result.amount,
        currency: result.currency,
        order_id: result.orderId,
        name: 'News Media Service',
        description: 'Reporter Registration Fee',
        handler: async function (response) {
          await verifyPayment(response);
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#DC143C'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (razorpayResponse) => {
    setLoading(true);
    
    try {
      const res = await apiServerClient.fetch('/new-registration/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId,
          razorpayPaymentId: razorpayResponse.razorpay_payment_id,
          razorpayOrderId: razorpayResponse.razorpay_order_id,
          razorpaySignature: razorpayResponse.razorpay_signature
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Payment verification failed');
      }

      toast.success('Payment successful! User ID generated.');
      navigate('/new-reporter-registration/success', { 
        state: { userId: result.userId, registrationId } 
      });
      
    } catch (err) {
      console.error('Verification error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOfflinePayment = async () => {
    if (!offlineData.screenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('registrationId', registrationId);
      formData.append('paymentScreenshot', offlineData.screenshot);
      if (offlineData.transactionId) {
        formData.append('transactionId', offlineData.transactionId);
      }

      const res = await apiServerClient.fetch('/new-registration/payment/offline', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to submit offline payment');
      }

      toast.success('Payment submitted for verification');
      navigate('/new-reporter-registration/success', { 
        state: { registrationId, pendingApproval: true } 
      });
      
    } catch (err) {
      console.error('Offline payment error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Choose Payment Method</h3>
        
        <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="online" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Online Payment
            </TabsTrigger>
            <TabsTrigger value="offline" className="gap-2">
              <Upload className="w-4 h-4" />
              Offline Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="online" className="space-y-4 mt-6">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Pay ₹5,000 via Razorpay</p>
              <p className="text-xs text-muted-foreground">Secure payment gateway. Instant verification.</p>
            </div>
            <Button 
              onClick={handleOnlinePayment} 
              disabled={loading} 
              size="lg" 
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay ₹5,000 Now
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="offline" className="space-y-4 mt-6">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <p className="text-sm font-medium">Bank Transfer Details</p>
              <div className="text-xs space-y-1">
                <p><strong>Account Name:</strong> News Media Service</p>
                <p><strong>Account Number:</strong> 1234567890</p>
                <p><strong>IFSC Code:</strong> SBIN0001234</p>
                <p><strong>Amount:</strong> ₹5,000</p>
              </div>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-lg">
              <div className="text-center">
                <QrCode className="w-32 h-32 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Scan to pay via UPI</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                <Input 
                  id="transactionId"
                  placeholder="Enter transaction ID"
                  value={offlineData.transactionId}
                  onChange={(e) => setOfflineData(prev => ({ ...prev, transactionId: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div>
                <Label htmlFor="screenshot">Payment Screenshot <span className="text-destructive">*</span></Label>
                <Input 
                  id="screenshot"
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => setOfflineData(prev => ({ ...prev, screenshot: e.target.files?.[0] || null }))}
                  className="form-input"
                />
                {offlineData.screenshot && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    {offlineData.screenshot.name}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleOfflinePayment} 
                disabled={loading || !offlineData.screenshot} 
                size="lg" 
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Submit for Verification
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="flex justify-start pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={loading} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
    </div>
  );
};

export default Step4PaymentPage;