import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Check, Zap, Building, CreditCard, User, Mail, Phone, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PaymentOptionsPage = () => {
  const { reporterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [reporter, setReporter] = useState(null);
  
  const feeAmount = location.state?.feeAmount || 5000;

  useEffect(() => {
    const fetchReporter = async () => {
      try {
        const data = await pb.collection('reporters').getOne(reporterId, { $autoCancel: false });
        setReporter(data);
      } catch (error) {
        console.error("Error fetching reporter:", error);
        toast.error("Failed to load reporter details.");
        navigate('/');
      }
    };
    if (reporterId) fetchReporter();
  }, [reporterId, navigate]);

  const handleSelectPlan = async (method) => {
    if (!reporterId) return;

    setIsLoading(true);
    try {
      const paymentRecord = await pb.collection('payments').create({
        reporter_id: reporterId,
        plan_type: 'premium',
        payment_method: method,
        payment_amount: feeAmount,
        payment_status: 'pending',
        payment_date: new Date().toISOString()
      }, { $autoCancel: false });

      await pb.collection('reporters').update(reporterId, {
        payment_status: 'pending_approval',
        plan_type: 'premium'
      }, { $autoCancel: false });

      navigate(`/payment/${method}/${reporterId}?paymentId=${paymentRecord.id}`);
    } catch (error) {
      console.error("Error creating payment record:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Select Payment Plan - Navdhriti Manawadhikar</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/20be51816882891787f931475df292ab.jpg" 
              alt="Navdhriti Manavadhikar Foundation" 
              className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-2xl object-cover shadow-lg border-2 border-slate-200"
            />
          </div>

          {reporter && (
            <Card className="mb-8 bg-white shadow-sm border-slate-200">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Application Received</h2>
                  <p className="text-sm text-slate-500">Please select a payment method to complete your registration.</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {reporter.name}</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {reporter.email}</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {reporter.phone}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold mb-6 border border-blue-100">
              <Receipt className="w-5 h-5" />
              Registration Fee: ₹{feeAmount}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Choose Your Payment Method
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Complete your Premium Reporter registration to get priority publishing and official press credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-3xl mx-auto">
            
            <Card className="relative flex flex-col h-full border-primary shadow-lg scale-105 z-10 bg-white">
              <div className="absolute top-0 inset-x-0 transform -translate-y-1/2 flex justify-center">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm uppercase tracking-wider font-bold">
                  Recommended
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Premium (Online) <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                </CardTitle>
                <CardDescription>Instant online activation</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                  ₹{feeAmount}
                  <span className="ml-1 text-xl font-medium text-slate-500">/yr</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium text-slate-900">Unlimited article submissions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium text-slate-900">Priority review (under 12 hrs)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium text-slate-900">Official Digital Press ID Card</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium text-slate-900">Featured author profile</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-lg h-12" 
                  onClick={() => handleSelectPlan('online')}
                  disabled={isLoading}
                >
                  <CreditCard className="mr-2 h-5 w-5" /> Pay Online Now
                </Button>
                <p className="text-xs text-center text-slate-500">Secured by Razorpay</p>
              </CardFooter>
            </Card>

            <Card className="relative flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">Premium (Offline)</CardTitle>
                <CardDescription>Manual bank transfer / UPI</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                  ₹{feeAmount}
                  <span className="ml-1 text-xl font-medium text-slate-500">/yr</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="font-medium text-slate-900">All Premium features included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="font-medium text-slate-900">Pay via NEFT/RTGS or any UPI app</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="font-medium text-slate-900">Manual verification required (24 hrs)</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="secondary" 
                  className="w-full text-lg h-12" 
                  onClick={() => handleSelectPlan('offline')}
                  disabled={isLoading}
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

export default PaymentOptionsPage;