import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';

import RegistrationStep1 from '@/components/RegistrationStep1.jsx';
import RegistrationStep2 from '@/components/RegistrationStep2.jsx';
import RegistrationStep3 from '@/components/RegistrationStep3.jsx';
import RegistrationStep4 from '@/components/RegistrationStep4.jsx';

const ReporterRegistrationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationId, setRegistrationId] = useState(null);
  
  const [formData, setFormData] = useState(null);
  const [documents, setDocuments] = useState(null);

  // Attempt to restore session state if page is refreshed
  useEffect(() => {
    const savedRegId = sessionStorage.getItem('reporter_reg_id');
    const savedStep = sessionStorage.getItem('reporter_reg_step');
    if (savedRegId) setRegistrationId(savedRegId);
    if (savedStep) setCurrentStep(parseInt(savedStep, 10));
  }, []);

  const updateStep = (step) => {
    setCurrentStep(step);
    sessionStorage.setItem('reporter_reg_step', step.toString());
    window.scrollTo(0, 0);
  };

  const handleStep1Success = (data, newRegistrationId) => {
    setFormData(data);
    setRegistrationId(newRegistrationId);
    sessionStorage.setItem('reporter_reg_id', newRegistrationId);
    updateStep(2);
  };

  const handleStep2Success = (docs) => {
    setDocuments(docs);
    updateStep(3);
  };

  const handleStep3Success = () => {
    updateStep(4);
  };

  const handlePaymentSuccess = (regId, method, userId = null) => {
    // Clear session storage on success
    sessionStorage.removeItem('reporter_reg_step1');
    sessionStorage.removeItem('reporter_reg_step');
    sessionStorage.removeItem('reporter_reg_id');
    
    navigate('/registration-success', { state: { userId, method, registrationId: regId } });
  };

  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col">
      <Helmet>
        <title>Reporter Registration - Navdhriti Manavadhikar Samachar</title>
      </Helmet>
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex justify-center mb-8">
            <img 
              src="https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/20be51816882891787f931475df292ab.jpg" 
              alt="Navdhriti Manavadhikar Foundation" 
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-lg border border-border"
            />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Join Our Reporter Network</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Complete the 4-step registration process to get your official Press ID and start publishing news.</p>
          </div>

          {/* Form Container */}
          <Card className="border-border shadow-2xl bg-card overflow-hidden rounded-2xl">
            <CardContent className="p-6 md:p-10">
              {currentStep === 1 && (
                <RegistrationStep1 
                  data={formData} 
                  onNext={handleStep1Success} 
                />
              )}
              {currentStep === 2 && (
                <RegistrationStep2 
                  registrationId={registrationId}
                  documents={documents} 
                  onNext={handleStep2Success} 
                  onBack={() => updateStep(1)} 
                />
              )}
              {currentStep === 3 && (
                <RegistrationStep3 
                  registrationId={registrationId}
                  formData={formData} 
                  documents={documents} 
                  onNext={handleStep3Success} 
                  onBack={() => updateStep(2)}
                  onEditStep={(step) => updateStep(step)}
                />
              )}
              {currentStep === 4 && (
                <RegistrationStep4 
                  registrationId={registrationId} 
                  formData={formData}
                  onSuccess={handlePaymentSuccess} 
                />
              )}
            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReporterRegistrationPage;