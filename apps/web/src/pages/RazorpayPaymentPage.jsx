import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ShieldCheck, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayPaymentPage = () => {
  const { reporterId } = useParams();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const navigate = useNavigate();
  
  const [reporter, setReporter] = useState(null);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reporterData = await pb.collection('reporters').getOne(reporterId, { $autoCancel: false });
        setReporter(reporterData);
        
        if (paymentId) {
          const paymentData = await pb.collection('payments').getOne(paymentId, { $autoCancel: false });
          setPaymentRecord(paymentData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load payment details.");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (reporterId) fetchData();
  }, [reporterId, paymentId, navigate]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    const amountToCharge = paymentRecord?.payment_amount || 5000;

    try {
      toast.info("Initializing secure payment gateway...");
      
      const orderResponse = await apiServerClient.fetch('/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountToCharge,
          currency: 'INR',
          receipt: reporterId,
          description: 'Premium Plan Registration Fee'
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }
      
      const orderData = await orderResponse.json();

      const options = {
        key: 'rzp_live_RvKrWxNNYAPAYD',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Navdhriti Manavadhikar',
        description: 'Premium Reporter Registration',
        order_id: orderData.orderId,
        prefill: {
          name: reporter?.name || '',
          email: reporter?.email || '',
          contact: reporter?.phone || ''
        },
        theme: {
          color: '#0022B3'
        },
        handler: async function (response) {
          try {
            toast.info('Verifying payment...');
            
            const verifyResponse = await apiServerClient.fetch(
              `/razorpay/verify-payment?paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}&signature=${response.razorpay_signature}`
            );
            
            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }
            
            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              if (paymentId) {
                await pb.collection('payments').update(paymentId, {
                  payment_status: 'completed',
                  admin_notes: `Razorpay Payment ID: ${response.razorpay_payment_id} | Order ID: ${response.razorpay_order_id}`
                }, { $autoCancel: false });
              } else {
                await pb.collection('payments').create({
                  reporter_id: reporterId,
                  plan_type: 'premium',
                  payment_method: 'online',
                  payment_amount: amountToCharge,
                  payment_status: 'completed',
                  payment_date: new Date().toISOString(),
                  admin_notes: `Razorpay Payment ID: ${response.razorpay_payment_id}`
                }, { $autoCancel: false });
              }

              await pb.collection('reporters').update(reporterId, {
                payment_status: 'pending_approval',
                plan_type: 'premium'
              }, { $autoCancel: false });

              toast.success('Payment successful!');
              navigate(`/registration-confirmation/${reporterId}`);
            } else {
              throw new Error('Invalid payment signature');
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Payment verification failed. If amount was deducted, please contact support.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      paymentObject.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const displayAmount = paymentRecord?.payment_amount || 5000;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Secure Checkout - Navdhriti Manawadhikar</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/20be51816882891787f931475df292ab.jpg" 
              alt="Navdhriti Manavadhikar Foundation" 
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover shadow-lg border-2 border-slate-200"
            />
          </div>

          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2 text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Back to Plans
          </Button>

          <Card className="shadow-xl border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl">Checkout Summary</CardTitle>
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <CardDescription>Complete your payment to activate Premium features.</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-900">Registration Fee</span>
                  <span className="font-bold text-lg">₹{displayAmount}.00</span>
                </div>
                <p className="text-sm text-slate-600">Includes priority publishing and digital press ID.</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Billed To</h4>
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-900">{reporter?.name}</p>
                  <p>{reporter?.email}</p>
                  <p>{reporter?.phone}</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2 pb-8">
              <Button 
                className="w-full h-14 text-lg bg-[#3395FF] hover:bg-[#2b80db] text-white shadow-md transition-all active:scale-[0.98]" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="mr-2 h-5 w-5" /> Pay ₹{displayAmount} Securely</>
                )}
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Secure Payments by Razorpay</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RazorpayPaymentPage;