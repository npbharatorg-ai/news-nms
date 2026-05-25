import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Printer, Download, ArrowLeft, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PressIDCard from '@/components/PressIDCard';

const IDCardPage = () => {
  const { currentUser, checkExpiry } = useAuth();
  const navigate = useNavigate();
  const [reporter, setReporter] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Error fetching reporter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReporter();
  }, [currentUser, navigate, checkExpiry]);

  const handlePrint = () => {
    window.print();
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

  const isActive = reporter?.status === 'ACTIVE';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Digital Press ID Card - Navdhriti Manawadhikar</title>
        <style type="text/css" media="print">
          {`
            @page { size: auto; margin: 0mm; }
            body { background-color: white; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .id-card-container { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              width: 100vw;
              background: white !important;
            }
          `}
        </style>
      </Helmet>
      
      <div className="no-print">
        <Header />
      </div>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 no-print">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/reporter-dashboard')} className="mb-6 gap-2 text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Digital Press ID Card</h1>
            <p className="text-slate-600 mt-2">Your official identification as a Navdhriti Manawadhikar reporter.</p>
          </div>

          {!isActive ? (
            <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900 max-w-xl mx-auto">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">ID Card Unavailable</AlertTitle>
              <AlertDescription className="mt-2">
                {reporter?.status === 'INACTIVE' 
                  ? 'Your press ID has expired. Please renew your subscription to access your ID card.'
                  : 'Your ID card will be generated and available here once your account is activated by the admin.'}
                
                {reporter?.status === 'INACTIVE' && (
                  <div className="mt-4">
                    <Button onClick={() => navigate('/reporter/renewal')} className="bg-amber-600 hover:bg-amber-700 text-white">
                      Renew Subscription
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
              
              {/* ID Card Preview */}
              <div className="flex-shrink-0 mx-auto">
                <PressIDCard reporter={reporter} />
              </div>

              {/* Actions */}
              <Card className="w-full md:w-64 shadow-sm border-slate-200">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-slate-900 border-b pb-2">Actions</h3>
                  
                  <Button onClick={handlePrint} className="w-full gap-2 bg-primary hover:bg-primary/90">
                    <Printer className="h-4 w-4" /> Print ID Card
                  </Button>
                  
                  <Button variant="outline" onClick={handlePrint} className="w-full gap-2">
                    <Download className="h-4 w-4" /> Save as PDF
                  </Button>

                  <div className="pt-4 text-xs text-slate-500 space-y-2">
                    <p><strong>Tip:</strong> For best results when printing or saving as PDF, ensure "Background graphics" is enabled in your print dialog settings.</p>
                    <p><strong>Valid until:</strong> {new Date(reporter.expiry_date).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </main>

      {/* Print-only container */}
      <div className="hidden print-only id-card-container">
        {isActive && <PressIDCard reporter={reporter} />}
      </div>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
};

export default IDCardPage;