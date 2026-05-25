import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, User, Key, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const RegistrationSuccessPage = () => {
  const location = useLocation();
  const { userId, method } = location.state || {};

  // Prevent direct access without completing registration
  if (!location.state) {
    return <Navigate to="/reporter-register" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Registration Complete - Navdhriti</title>
      </Helmet>

      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
          <div className="h-2 w-full bg-emerald-500" />
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Application Submitted!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            <p className="text-center text-slate-600">
              {method === 'online' 
                ? "Your payment was successful and your registration is complete. Your account has been created."
                : "Your application and offline payment proof have been submitted and are pending admin review."}
            </p>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
              <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Account Information</h3>
              
              {userId && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Reporter ID</p>
                    <p className="font-mono font-bold text-slate-900">{userId}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Login Credentials</p>
                  <p className="text-sm text-slate-900">Use the email and password you provided during registration to log in to your dashboard.</p>
                </div>
              </div>
            </div>

            {method !== 'online' && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-200">
                <strong>Note:</strong> Since you chose offline payment, you must wait for an administrator to verify your payment proof before you can fully access the dashboard.
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pb-8">
            <Button asChild className="w-full" size="lg">
              <Link to="/reporter-login">
                Proceed to Login <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/">Return to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default RegistrationSuccessPage;