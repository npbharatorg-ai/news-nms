import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Check localStorage flags as requested
  const isLoggedInStorage = localStorage.getItem('isLoggedIn') === 'true';
  const isVerifiedStorage = localStorage.getItem('verified') === 'true';

  useEffect(() => {
    if (!isLoading) {
      console.log(`ProtectedRoute: Checking access for route ${location.pathname}`);
      console.log(`ProtectedRoute: Auth state - Context: ${isAuthenticated}, Storage: ${isLoggedInStorage}`);
      console.log(`ProtectedRoute: Verified state - Storage: ${isVerifiedStorage}`);
      setIsChecking(false);
    }
  }, [isLoading, isAuthenticated, isLoggedInStorage, isVerifiedStorage, location.pathname]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  // Check if user is logged in (either via context or localStorage)
  if (!isAuthenticated && !isLoggedInStorage) {
    console.log('ProtectedRoute: Access denied - not authenticated. Redirecting to login.');
    if (location.pathname.includes('admin')) {
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }
    return <Navigate to="/reporter-login" state={{ from: location }} replace />;
  }

  const role = currentUser?.collectionName || (isLoggedInStorage ? 'reporters' : null);

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.log(`ProtectedRoute: Access denied - role [${role}] not in allowed roles`);
    if (role === 'admin_users') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (role === 'reporters') {
      return <Navigate to="/reporter-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Extra check for reporters to ensure they are verified
  if (role === 'reporters' && !isVerifiedStorage) {
    console.log('ProtectedRoute: Access denied - not verified. Redirecting to login.');
    toast.error('Your account is pending admin approval. Please contact the administrator.');
    return <Navigate to="/reporter-login" replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;