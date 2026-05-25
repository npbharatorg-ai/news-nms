import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Loader2, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const FreePaymentPage = () => {
  const { reporterId } = useParams();
  const navigate = useNavigate();
  const [reporter, setReporter] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await pb.collection('payments').create({
        reporter_id: reporterId,
        plan_type: 'free',
        payment_method: 'free',
        payment_amount: 0,
        payment_status: 'completed',
        payment_date: new Date().toISOString(),
        admin_notes: 'Free plan selected during registration.'
      }, { $autoCancel: false });

      await pb.collection('reporters').update(reporterId, {
        payment_status: 'pending_approval',
        plan_type: 'free'
      }, { $autoCancel: false });

      navigate(`/registration-confirmation/${reporterId}`);
    } catch (error) {
      console.error("Error confirming free plan:", error);
      toast.error("Failed to confirm plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Confirm Basic Plan - Navdhriti Manawadhikar</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2 text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Back to Plans
          </Button>

          <Card className="shadow-xl border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
              <CardTitle className="text-xl">Confirm Basic Plan</CardTitle>
              <CardDescription>You are selecting the free tier for occasional contributors.</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              {reporter && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-700"><User className="w-4 h-4"/> {reporter.name}</div>
                  <div className="flex items-center gap-2 text-slate-700"><Mail className="w-4 h-4"/> {reporter.email}</div>
                </div>
              )}
              
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
                <strong>Note:</strong> Free accounts require manual admin approval before you can start publishing articles. This usually takes 48-72 hours.
              </div>
            </CardContent>

            <CardFooter className="pt-2 pb-8">
              <Button 
                className="w-full h-12 text-base" 
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  "Confirm Free Plan"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreePaymentPage;