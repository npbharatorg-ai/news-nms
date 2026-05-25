import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BankDetailsCard from '@/components/BankDetailsCard.jsx';
import QRCodeDisplay from '@/components/QRCodeDisplay.jsx';
import PaymentProofUpload from '@/components/PaymentProofUpload.jsx';

const OfflinePaymentPage = () => {
  const { reporterId } = useParams();
  const navigate = useNavigate();
  
  const [reporter, setReporter] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reporterData = await pb.collection('reporters').getOne(reporterId, { $autoCancel: false });
        setReporter(reporterData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load details.");
        navigate('/');
      }
    };
    if (reporterId) fetchData();
  }, [reporterId, navigate]);

  const handleUpload = async (file) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('reporter_id', reporterId);
      formData.append('plan_type', 'premium');
      formData.append('payment_method', 'offline');
      formData.append('payment_amount', 5000);
      formData.append('payment_status', 'pending');
      formData.append('approval_status', 'pending');
      formData.append('payment_date', new Date().toISOString());
      formData.append('payment_proof', file);
      
      await pb.collection('payments').create(formData, { $autoCancel: false });

      await pb.collection('reporters').update(reporterId, {
        payment_status: 'pending',
        approval_status: 'pending',
        status: 'PENDING_APPROVAL'
      }, { $autoCancel: false });

      toast.success("Payment proof submitted successfully!");
      toast.info("Admin will verify and approve within 24-48 hours.");
      
      setTimeout(() => {
        navigate('/reporter-login');
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      toast.error("Failed to submit payment proof. Please try again.");
      setIsSubmitting(false);
    }
  };

  const bankDetails = [
    { label: 'Account Holder', value: 'Navdhriti Manawadhikar Foundation' },
    { label: 'Account Number', value: '12290210005859' },
    { label: 'IFSC Code', value: 'UCBA0001229' },
    { label: 'Bank Name', value: 'UCO Bank' }
  ];

  const qrCodeUrl = "https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/7ebbec16a590bd0929d6d0ce8d7bca08.jpg";
  const upiId = "9549101983@ucobank";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Offline Payment - Navdhriti Manawadhikar</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/20be51816882891787f931475df292ab.jpg" 
              alt="Navdhriti Manavadhikar Foundation" 
              className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-2xl object-cover shadow-lg border-2 border-slate-200"
            />
          </div>

          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Complete Your Registration</h1>
            <p className="text-lg text-slate-600">
              Please transfer the registration fee using the bank details or QR code below, then upload your payment screenshot.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <BankDetailsCard details={bankDetails} amount={5000} />
            <QRCodeDisplay qrCodeUrl={qrCodeUrl} upiId={upiId} />
          </div>

          <Card className="shadow-lg border-slate-200 overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-amber-800 font-medium">
                  Payment proof upload करें, Admin 24-48 घंटे में आपके payment को verify करके approve करेगा
                </p>
                <p className="text-amber-700/80 text-sm mt-1">
                  Upload your payment proof. Admin will verify and approve your payment within 24-48 hours.
                </p>
              </div>
            </div>
            <CardContent className="p-8">
              <PaymentProofUpload onUpload={handleUpload} isSubmitting={isSubmitting} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OfflinePaymentPage;