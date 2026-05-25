import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import NewsDetailPage from './pages/NewsDetailPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsConditionsPage from './pages/TermsConditionsPage.jsx';
import ReporterRegistrationPage from './pages/ReporterRegistrationPage.jsx';
import NewReporterRegistrationPage from './pages/NewReporterRegistrationPage.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage.jsx';
import ReporterLoginPage from './pages/ReporterLoginPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import ReporterDashboard from './pages/ReporterDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PaymentOptionsPage from './pages/PaymentOptionsPage.jsx';
import RazorpayPaymentPage from './pages/RazorpayPaymentPage.jsx';
import OfflinePaymentPage from './pages/OfflinePaymentPage.jsx';
import FreePaymentPage from './pages/FreePaymentPage.jsx';
import PaymentDetailsPage from './pages/PaymentDetailsPage.jsx';
import RegistrationConfirmationPage from './pages/RegistrationConfirmationPage.jsx';
import IDCardPage from './pages/IDCardPage.jsx';
import RenewalPage from './pages/RenewalPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProtectedReporterRoute from './components/ProtectedReporterRoute.jsx';
import PopUpAdDisplay from './components/PopUpAdDisplay.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { testDatabaseConnectivity } from './utils/diagnostics.js';

function App() {
  useEffect(() => {
    // Run diagnostics on app startup to verify database connection
    testDatabaseConnectivity();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <PopUpAdDisplay />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-conditions" element={<TermsConditionsPage />} />
              
              {/* Public Auth Routes */}
              <Route path="/reporter-register" element={<ReporterRegistrationPage />} />
              <Route path="/reporter-registration" element={<ReporterRegistrationPage />} />
              <Route path="/new-reporter-registration" element={<NewReporterRegistrationPage />} />
              <Route path="/new-reporter-registration/step1" element={<NewReporterRegistrationPage />} />
              <Route path="/new-reporter-registration/step2" element={<NewReporterRegistrationPage />} />
              <Route path="/new-reporter-registration/step3" element={<NewReporterRegistrationPage />} />
              <Route path="/new-reporter-registration/step4" element={<NewReporterRegistrationPage />} />
              <Route path="/new-reporter-registration/success" element={<SuccessPage />} />
              <Route path="/registration-success" element={<RegistrationSuccessPage />} />
              <Route path="/reporter-login" element={<ReporterLoginPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              
              {/* Payment Flow Routes */}
              <Route 
                path="/payment-options/:reporterId" 
                element={
                  <ProtectedRoute>
                    <PaymentOptionsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment/razorpay/:reporterId" 
                element={
                  <ProtectedRoute>
                    <RazorpayPaymentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment/offline/:reporterId" 
                element={
                  <ProtectedRoute>
                    <OfflinePaymentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment/free/:reporterId" 
                element={
                  <ProtectedRoute>
                    <FreePaymentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/registration-confirmation/:reporterId" 
                element={
                  <ProtectedRoute>
                    <RegistrationConfirmationPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment-details" 
                element={
                  <ProtectedRoute>
                    <PaymentDetailsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Reporter Routes */}
              <Route 
                path="/reporter-dashboard" 
                element={
                  <ProtectedReporterRoute>
                    <ReporterDashboard />
                  </ProtectedReporterRoute>
                } 
              />
              <Route 
                path="/reporter/id-card" 
                element={
                  <ProtectedReporterRoute>
                    <IDCardPage />
                  </ProtectedReporterRoute>
                } 
              />
              <Route 
                path="/reporter/renewal" 
                element={
                  <ProtectedReporterRoute>
                    <RenewalPage />
                  </ProtectedReporterRoute>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={<AdminDashboard />}
              />
              <Route 
                path="/admin-dashboard" 
                element={<AdminDashboard />}
              />
              
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;