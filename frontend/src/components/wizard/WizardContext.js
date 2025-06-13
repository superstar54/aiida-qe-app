
import React, { createContext, useState, useEffect } from 'react';

export const WizardContext = createContext();

// Whenever initialStepsData prop changes, re‐initialize the internal steps.
export const WizardProvider = ({ children, initialStepsData, jobData }) => {
  // Start with an empty array; we’ll fill it in an effect below.
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState('0');

  useEffect(() => {
    if (!initialStepsData || initialStepsData.length === 0) {
      setSteps([]);
      return;
    }
    const seeded = initialStepsData.map((step) => ({
      ...step,
      confirmed: false,
      modified: false,
    }));
    setSteps(seeded);

    // Reset activeStep back to 0 whenever the list of steps changes.
    setActiveStep('0');
  }, [initialStepsData]);

  useEffect(() => {
    if (!jobData || steps.length === 0) return;

    setSteps((prevSteps) =>
      prevSteps.map((step, index) => {
        if (index === prevSteps.length - 1) {
          // Skip the last step
          return step;
        } else {
          return {
            ...step,
            confirmed: true,
            data: jobData.stepsData[step.id] || {},
          };
        }
      })
    );

    // Jump to the last step after loading job data
    setActiveStep((initialStepsData.length - 1).toString());
  }, [jobData, initialStepsData.length, steps.length]);

  const handleDataChange = (stepIndex, tabTitle, newData) => {
    setSteps((prevSteps) => {
      const updated = [...prevSteps];
      const existingData = updated[stepIndex].data || {};
      updated[stepIndex].data = { ...existingData, [tabTitle]: newData };
      return updated;
    });
  };

  const handleConfirm = (stepIndex) => {
    setSteps((prevSteps) => {
      const updated = [...prevSteps];
      updated[stepIndex].confirmed = true;
      return updated;
    });
    if (stepIndex < steps.length - 1) {
      setActiveStep((stepIndex + 1).toString());
    }
  };

  const handleModify = (stepIndex) => {
    setSteps((prevSteps) => {
      return prevSteps.map((step, index) => {
        if (index === stepIndex) {
          return { ...step, confirmed: false, modified: true };
        } else if (index > stepIndex) {
          return {
            ...step,
            confirmed: false,
            modified: true,
            data: initialStepsData[index].data || {},
          };
        }
        return step;
      });
    });
    setActiveStep(stepIndex.toString());
  };

  const value = {
    steps,
    activeStep,
    setActiveStep,
    handleDataChange,
    handleConfirm,
    handleModify,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};
