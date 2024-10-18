import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionStep from './AccordionStep';

const AccordionWizard = () => {
  const [steps, setSteps] = useState([
    { title: 'Select Structure', confirmed: false },
    { title: 'Configure Workflow', confirmed: false },
    { title: 'Choose Computational Resources', confirmed: false },
    { title: 'Review and Submit', confirmed: false }
  ]);

  // Track which step is currently open (step 1 by default)
  const [activeStep, setActiveStep] = useState("0"); // String type required for activeKey

  // Tab content for each step
  const tabsContent = {
    step1: [
      { title: 'Basic settings', content: <div>Structure basic settings content here...</div> },
      { title: 'Advanced settings', content: <div>Structure advanced settings content here...</div> }
    ],
    step2: [
      { title: 'Basic settings', content: <div>Workflow basic settings content here...</div> },
      { title: 'Advanced settings', content: <div>Workflow advanced settings content here...</div> }
    ],
    step3: [
      { title: 'Basic settings', content: <div>Computational resources basic settings...</div> },
      { title: 'Advanced settings', content: <div>Computational resources advanced settings...</div> }
    ],
    step4: [
      { title: 'Review settings', content: <div>Review all configurations before submission...</div> }
    ]
  };

  // Function to handle confirming a step
  const handleConfirm = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[stepIndex].confirmed = true;
      return updatedSteps;
    });

    // Automatically close the current step and open the next one
    if (stepIndex < steps.length - 1) {
      setActiveStep((stepIndex + 1).toString());  // Open the next step
    }
  };

  return (
    <Accordion activeKey={activeStep}>
      {steps.map((step, index) => (
        <AccordionStep
          key={index}
          stepNumber={index + 1}
          title={step.title}
          tabs={tabsContent[`step${index + 1}`]} // Dynamically load tabs based on the step
          confirmed={step.confirmed}
          onConfirm={() => handleConfirm(index)}
          disabled={index > 0 && !steps[index - 1].confirmed}  // Disable current step until previous one is confirmed
        />
      ))}
    </Accordion>
  );
};

export default AccordionWizard;
