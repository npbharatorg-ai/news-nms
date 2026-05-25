import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Legacy support / generic user
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentReporter, setCurrentReporter] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid) {
      const model = pb.authStore.model;
      setCurrentUser(model);
      
      if (model?.collectionName === 'admin_users') {
        setCurrentAdmin(model);
      } else if (model?.collectionName === 'reporter_registrations' || model?.collectionName === 'reporters') {
        // Handle both old 'reporters' collection and new 'reporter_registrations' auth collection
        setCurrentReporter(model);
      }
    }
    setInitialLoading(false);
  }, []);

  // --- Admin Auth ---
  const adminLogin = async (email, password) => {
    try {
      const authData = await pb.collection('admin_users').authWithPassword(email, password, { $autoCancel: false });
      setCurrentAdmin(authData.record);
      setCurrentUser(authData.record);
      setCurrentReporter(null); // Ensure reporter is cleared
      return authData;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setCurrentAdmin(null);
    setCurrentReporter(null);
  };

  // --- Reporter Auth ---
  const reporterLogin = async (email, password) => {
    try {
      // Use the new reporter_registrations auth collection
      const authData = await pb.collection('reporter_registrations').authWithPassword(email, password, { $autoCancel: false });
      setCurrentReporter(authData.record);
      setCurrentUser(authData.record);
      setCurrentAdmin(null); // Ensure admin is cleared
      
      // Legacy storage for compatibility with older code if needed
      localStorage.setItem('reporterAuth', JSON.stringify(authData.record));
      
      return authData;
    } catch (error) {
      console.error('Reporter login failed:', error);
      throw error;
    }
  };

  const reporterLogout = () => {
    pb.authStore.clear();
    localStorage.removeItem('reporterAuth');
    setCurrentReporter(null);
    setCurrentUser(null);
  };

  const getReporterFromStorage = () => {
    const stored = localStorage.getItem('reporterAuth');
    return stored ? JSON.parse(stored) : null;
  };

  const checkExpiry = async (reporterData) => {
    if (!reporterData?.expiry_date) return reporterData;
    
    const expiryDate = new Date(reporterData.expiry_date);
    const now = new Date();
    
    if (expiryDate < now && reporterData.status === 'ACTIVE') {
      try {
        const collection = reporterData.collectionName || 'reporter_registrations';
        await pb.collection(collection).update(reporterData.id, {
          status: 'INACTIVE',
          payment_status: 'expired'
        }, { $autoCancel: false });
        
        const updatedReporter = await pb.collection(collection).getOne(reporterData.id, { $autoCancel: false });
        setCurrentReporter(updatedReporter);
        setCurrentUser(updatedReporter);
        localStorage.setItem('reporterAuth', JSON.stringify(updatedReporter));
        return updatedReporter;
      } catch (error) {
        console.error('Failed to update expired status:', error);
      }
    }
    
    return reporterData;
  };

  const value = {
    currentUser,
    currentAdmin,
    currentReporter,
    isAdminAuthenticated: !!currentAdmin,
    isReporterAuthenticated: !!currentReporter,
    isAuthenticated: pb.authStore.isValid,
    adminLogin,
    logout,
    reporterLogin,
    reporterLogout,
    getReporterFromStorage,
    checkExpiry,
    initialLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};