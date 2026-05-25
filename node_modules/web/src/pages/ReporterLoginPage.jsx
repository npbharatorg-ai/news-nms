import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { AlertCircle, Loader2, User } from 'lucide-react';
import Header from '@/components/Header.jsx';

const ReporterLoginPage = () => {
  const navigate = useNavigate();
  const { reporterLogin, reporterLogout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.email || !formData.password) {
      const msg = "Please fill in all fields";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    
    try {
      const authData = await reporterLogin(formData.email, formData.password);
      
      if (!authData?.record?.id) {
        throw new Error('Authentication failed - no user record returned');
      }
      
      const reporterRecord = await pb.collection('reporter_registrations').getOne(authData.record.id, {
        $autoCancel: false
      });
      
      if (reporterRecord.approval_status === 'pending') {
        reporterLogout();
        const msg = 'Your account is pending admin approval. Please wait.';
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      
      if (reporterRecord.approval_status === 'rejected') {
        reporterLogout();
        const msg = 'Your account has been rejected. Please contact support.';
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      
      if (reporterRecord.approval_status !== 'approved') {
        reporterLogout();
        const msg = 'Your account status is invalid. Please contact support.';
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      toast.success('Login successful!');
      navigate('/reporter-dashboard', { replace: true });
    } catch (error) {
      let displayError = 'An unexpected error occurred. Please try again.';
      
      if (error.status === 400 || error.message.includes('Failed to authenticate')) {
        displayError = 'Invalid email or password. Please check your credentials.';
      } else if (!navigator.onLine || error.isAbort) {
        displayError = 'Network error. Please check your connection and try again.';
      }
      
      setErrorMsg(displayError);
      toast.error(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Reporter Login - Navdhriti Manawadhikar</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg border-0 bg-card">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Reporter Login</CardTitle>
            <CardDescription className="text-base">
              Sign in to manage your news submissions and profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="name@example.com" 
                  disabled={isLoading}
                  className="bg-background text-foreground"
                />
              </div>
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  value={formData.password} 
                  onChange={handleChange} 
                  disabled={isLoading}
                  className="bg-background text-foreground"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6 text-sm text-muted-foreground">
            <div>
              Don't have an account?{" "}
              <Link to="/reporter-registration" className="text-primary hover:underline font-semibold">
                Register Here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default ReporterLoginPage;