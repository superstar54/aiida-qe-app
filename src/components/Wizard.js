import React, { useState } from 'react';
import Step from './Step';

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Select Structure',
      tabs: [
        { title: 'Basic settings', content: <div>Basic settings content...</div> },
        { title: 'Advanced settings', content: <div>Advanced settings content...</div> }
      ]
    },
    {
      title: 'Configure Workflow',
      tabs: [
        { title: 'Basic settings', content: <div>Basic workflow content...</div> },
        { title: 'Advanced settings', content: <div>Advanced workflow content...</div> }
      ]
    },
    // Add more steps as needed
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="wizard">
      <Step stepNumber={currentStep + 1} title={steps[currentStep].title} tabs={steps[currentStep].tabs} />
      <div className="wizard-controls">
        {currentStep > 0 && <button onClick={handleBack}>Back</button>}
        {currentStep < steps.length - 1 && <button onClick={handleNext}>Next</button>}
        {currentStep === steps.length - 1 && <button onClick={() => alert('Submit!')}>Submit</button>}
      </div>
    </div>
  );
};

export default Wizard;
