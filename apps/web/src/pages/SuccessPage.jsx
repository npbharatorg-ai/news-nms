import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Download, Home, Mail } from 'lucide-react';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, registrationId, pendingApproval } = location.state || {};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-3xl font-bold mb-4">
          {pendingApproval ? 'Payment Submitted!' : 'Registration Successful!'}
        </h1>

        {pendingApproval ? (
          <div className="space-y-4 text-left">
            <p className="text-muted-foreground text-center">
              Your offline payment has been submitted for verification.
            </p>
            <Card className="p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">What happens next?</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Our admin team will verify your payment within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>You will receive an email confirmation once approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Your User ID will be generated after approval</span>
                </li>
              </ul>
            </Card>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
              <Mail className="w-4 h-4" />
              <span>Check your email for updates</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Your User ID</p>
              <p className="text-3xl font-bold text-primary">{userId || 'NMS/NEWS/XXXX'}</p>
            </div>

            <Card className="p-4 bg-muted/50 text-left">
              <p className="text-sm font-medium mb-2">Next Steps</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>A confirmation email has been sent to your registered email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>You can now log in to your reporter dashboard using your credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Your press ID card will be available for download in your dashboard</span>
                </li>
              </ul>
            </Card>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>Confirmation email sent</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="gap-2 flex-1"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          {!pendingApproval && (
            <Button 
              onClick={() => navigate('/reporter-login')} 
              className="gap-2 flex-1"
            >
              Login to Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SuccessPage;