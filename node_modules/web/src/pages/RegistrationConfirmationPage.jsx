import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, Clock, User, Mail, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const RegistrationConfirmationPage = () => {
  const { reporterId } = useParams();
  const navigate = useNavigate();
  const [reporter, setReporter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReporter = async () => {
      try {
        const data = await pb.collection('reporters').getOne(reporterId, { $autoCancel: false });
        setReporter(data);
      } catch (error) {
        console.error("Error fetching reporter:", error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (reporterId) fetchReporter();
  }, [reporterId, navigate]);

  if (loading) return null;

  const isAutoActive = reporter?.payment_status === 'active';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Registration Complete - Navdhriti Manawadhikar</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Registration Successful!</h1>
            <p className="text-lg text-slate-600">Your reporter application has been received.</p>
          </div>

          <Card className="shadow-lg border-slate-200 overflow-hidden">
            <div className={`p-4 flex items-start gap-3 ${isAutoActive ? 'bg-green-50 border-b border-green-100' : 'bg-amber-50 border-b border-amber-100'}`}>
              {isAutoActive ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`font-semibold ${isAutoActive ? 'text-green-800' : 'text-amber-800'}`}>
                  Account Status: {isAutoActive ? 'Active' : 'Pending Approval'}
                </h3>
                <p className={`text-sm mt-1 ${isAutoActive ? 'text-green-700' : 'text-amber-700'}`}>
                  {isAutoActive 
                    ? "Your premium account is active. You can start publishing immediately."
                    : "Our admin team will review your application and documents. This process typically takes 24-48 hours. You will receive an email once approved."}
                </p>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b pb-2">Reporter Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-slate-600">
                      <User className="w-4 h-4" /> <span className="font-medium text-slate-900">{reporter?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="w-4 h-4" /> <span>{reporter?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <CreditCard className="w-4 h-4" /> <span className="capitalize">{reporter?.plan_type} Plan</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b pb-2">Next Steps</h4>
                  <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside pl-4">
                    <li>Check your email for confirmation</li>
                    <li>Login to your dashboard</li>
                    <li>Complete your profile</li>
                    {!isAutoActive && <li>Wait for admin approval to publish</li>}
                  </ul>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 p-6 border-t border-slate-100">
              <Button className="w-full h-12 text-lg gap-2" onClick={() => navigate('/reporter-dashboard')}>
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Button>
            </CardFooter>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegistrationConfirmationPage;