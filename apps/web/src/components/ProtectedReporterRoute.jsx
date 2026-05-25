import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Loader2, AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ProtectedReporterRoute = ({ children }) => {
  const { isReporterAuthenticated, initialLoading, currentReporter, reporterLogout } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState(null);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!initialLoading && isReporterAuthenticated && currentReporter?.id) {
        try {
          const record = await pb.collection('reporter_registrations').getOne(currentReporter.id, {
            $autoCancel: false
          });
          setApprovalStatus(record.approval_status);
        } catch (error) {
          console.error('Failed to fetch approval status:', error);
          setApprovalStatus('error');
        }
      }
      setIsChecking(false);
    };

    checkApprovalStatus();
  }, [initialLoading, isReporterAuthenticated, currentReporter]);

  if (initialLoading || isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying reporter access...</p>
      </div>
    );
  }

  if (!isReporterAuthenticated) {
    toast.error('Please log in as a reporter to access this page.');
    return <Navigate to="/reporter-login" state={{ from: location }} replace />;
  }

  if (approvalStatus === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
        <div className="bg-card text-card-foreground max-w-md w-full p-8 rounded-2xl shadow-lg border text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Pending Approval</h2>
            <p className="text-muted-foreground text-sm">
              Your account is pending admin approval. You will be notified once approved.
            </p>
          </div>
          <Button onClick={reporterLogout} variant="outline" className="w-full gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>
    );
  }

  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
        <div className="bg-card text-card-foreground max-w-md w-full p-8 rounded-2xl shadow-lg border text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Application Rejected</h2>
            <p className="text-muted-foreground text-sm">
              Your reporter application was rejected. Please contact support for more information.
            </p>
          </div>
          <Button onClick={reporterLogout} variant="outline" className="w-full gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>
    );
  }

  if (approvalStatus !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
        <div className="bg-card text-card-foreground max-w-md w-full p-8 rounded-2xl shadow-lg border text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Access Error</h2>
            <p className="text-muted-foreground text-sm">
              There was an error verifying your account status. Please contact support.
            </p>
          </div>
          <Button onClick={reporterLogout} variant="outline" className="w-full gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedReporterRoute;