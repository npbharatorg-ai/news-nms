import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Step1PersonalDetails from '@/components/Step1PersonalDetails.jsx';
import Step2DocumentUpload from '@/components/Step2DocumentUpload.jsx';
import Step3ReviewApplication from '@/components/Step3ReviewApplication.jsx';
import Step4PaymentPage from '@/components/Step4PaymentPage.jsx';

const steps = [
  { number: 1, title: 'Personal Details', path: '/new-reporter-registration/step1' },
  { number: 2, title: 'Documents', path: '/new-reporter-registration/step2' },
  { number: 3, title: 'Review', path: '/new-reporter-registration/step3' },
  { number: 4, title: 'Payment', path: '/new-reporter-registration/step4' }
];

const NewReporterRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [registrationId, setRegistrationId] = useState(null);

  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes('step1')) setCurrentStep(1);
    else if (path.includes('step2')) setCurrentStep(2);
    else if (path.includes('step3')) setCurrentStep(3);
    else if (path.includes('step4')) setCurrentStep(4);
    else navigate('/new-reporter-registration/step1');
  }, [location.pathname]);

  const handleStep1Next = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setRegistrationId(data.registrationId);
    setCurrentStep(2);
    navigate('/new-reporter-registration/step2');
  };

  const handleStep2Next = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(3);
    navigate('/new-reporter-registration/step3');
  };

  const handleStep3Next = () => {
    setCurrentStep(4);
    navigate('/new-reporter-registration/step4');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      navigate(`/new-reporter-registration/step${currentStep - 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Reporter Registration</h1>
          <p className="text-muted-foreground">Complete the steps below to register as a reporter</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      currentStep > step.number 
                        ? 'step-indicator-completed' 
                        : currentStep === step.number 
                        ? 'step-indicator-active' 
                        : 'step-indicator-pending'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <p className="text-xs mt-2 font-medium hidden sm:block">{step.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        currentStep > step.number ? 'bg-primary w-full' : 'bg-transparent w-0'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Card className="p-6 md:p-8">
          {currentStep === 1 && (
            <Step1PersonalDetails 
              onNext={handleStep1Next} 
              initialData={formData}
            />
          )}
          {currentStep === 2 && (
            <Step2DocumentUpload 
              registrationId={registrationId}
              onNext={handleStep2Next}
              onBack={handleBack}
              initialData={formData}
            />
          )}
          {currentStep === 3 && (
            <Step3ReviewApplication 
              registrationId={registrationId}
              formData={formData}
              onNext={handleStep3Next}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <Step4PaymentPage 
              registrationId={registrationId}
              onBack={handleBack}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default NewReporterRegistrationPage;