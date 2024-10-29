// WizardContext.js
import React, { createContext, useState, useEffect } from 'react';

export const WizardContext = createContext();

export const WizardProvider = ({ children, initialStepsData, jobData }) => {
  const [steps, setSteps] = useState(
    initialStepsData.map((step) => ({
      ...step,
      confirmed: false,
      modified: false,
    }))
  );
  const [activeStep, setActiveStep] = useState('0');

  // Update steps when jobData is available
  useEffect(() => {
    if (jobData) {
      setSteps((prevSteps) =>
        prevSteps.map((step, index) => {
          if (index === prevSteps.length - 1) {
            // Skip the last step
            return step;
          } else {
            return {
              ...step,
              confirmed: true,
              data: jobData.stepsData[step.id] || {}, // Use jobData to set step data
            };
          }
        })
      );

      // Set active step to the last one
      setActiveStep((initialStepsData.length - 1).toString());
    }
  }, [jobData]);

  const handleDataChange = (stepIndex, tabTitle, newData) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      const existingData = updatedSteps[stepIndex].data || {};
      updatedSteps[stepIndex].data = {...existingData, [tabTitle]: newData};
      return updatedSteps;
    });
  };

  const handleConfirm = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[stepIndex].confirmed = true;
      return updatedSteps;
    });

    if (stepIndex < steps.length - 1) {
      setActiveStep((stepIndex + 1).toString());
    }
  };

  const handleModify = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = prevSteps.map((step, index) => {
        if (index === stepIndex) {
          return { ...step, confirmed: false, modified: true };
        } else if (index > stepIndex) {
          return { ...step, confirmed: false, modified: true, data: {} };
        }
        return step;
      });
      return updatedSteps;
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
