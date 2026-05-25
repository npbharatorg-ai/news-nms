import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CreditCard, Building, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RenewalPage = () => {
  const { currentUser, checkExpiry } = useAuth();
  const navigate = useNavigate();
  const [reporter, setReporter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchReporter = async () => {
      if (!currentUser?.id) {
        navigate('/reporter-login');
        return;
      }
      
      try {
        const data = await pb.collection('reporters').getOne(currentUser.id, { $autoCancel: false });
        const checkedData = await checkExpiry(data);
        setReporter(checkedData);
        
        // If not inactive, they don't need to be here
        if (checkedData.status !== 'INACTIVE' && checkedData.status !== 'ACTIVE') {
          toast.info("Your account does not require renewal at this time.");
          navigate('/reporter-dashboard');
        }
      } catch (error) {
        console.error("Error fetching reporter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReporter();
  }, [currentUser, navigate, checkExpiry]);

  const handleSelectPlan = async (method) => {
    if (!reporter?.id) return;

    setIsProcessing(true);
    try {
      // Create a pending renewal payment record
      const paymentRecord = await pb.collection('payments').create({
        reporter_id: reporter.id,
        plan_type: 'premium', // Renewal is for premium
        payment_method: method,
        payment_amount: 5000,
        payment_status: 'pending',
        payment_date: new Date().toISOString(),
        admin_notes: 'Renewal Request'
      }, { $autoCancel: false });

      // Navigate to specific payment page with the payment record ID
      navigate(`/payment/${method}/${reporter.id}?paymentId=${paymentRecord.id}`);
    } catch (error) {
      console.error("Error creating renewal payment record:", error);
      toast.error("Failed to initiate renewal. Please try again.");
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Renew Subscription - Navdhriti Manawadhikar</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/reporter-dashboard')} className="mb-6 gap-2 text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full font-semibold mb-6 border border-red-100">
              <AlertCircle className="w-5 h-5" />
              Subscription Expired
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Renew Your Press ID
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Your previous subscription expired on {reporter?.expiry_date ? new Date(reporter.expiry_date).toLocaleDateString() : 'N/A'}. 
              Renew now to reactivate your Press ID and continue publishing articles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-3xl mx-auto">
            
            {/* Premium Online (Razorpay) */}
            <Card className="relative flex flex-col h-full border-primary shadow-lg scale-105 z-10 bg-white">
              <div className="absolute top-0 inset-x-0 transform -translate-y-1/2 flex justify-center">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm uppercase tracking-wider font-bold">
                  Instant Renewal
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Online Payment
                </CardTitle>
                <CardDescription>1 Year Extension</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                  ₹5000
                  <span className="ml-1 text-xl font-medium text-slate-500">/yr</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium text-slate-900">Extends expiry by 365 days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium text-slate-900">Instant account reactivation</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-lg h-12" 
                  onClick={() => handleSelectPlan('online')}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />} 
                  Pay Online Now
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Offline (Bank Transfer) */}
            <Card className="relative flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">Offline Payment</CardTitle>
                <CardDescription>Manual bank transfer / UPI</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                  ₹5000
                  <span className="ml-1 text-xl font-medium text-slate-500">/yr</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="font-medium text-slate-900">Extends expiry by 365 days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="font-medium text-slate-900">Manual verification required (24 hrs)</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="secondary" 
                  className="w-full text-lg h-12" 
                  onClick={() => handleSelectPlan('offline')}
                  disabled={isProcessing}
                >
                  <Building className="mr-2 h-5 w-5" /> Bank Transfer
                </Button>
              </CardFooter>
            </Card>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RenewalPage;