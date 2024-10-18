import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionStep from './AccordionStep';
import BasicSettingsTab from './BasicSettingsTab';
import AdvancedSettingsTab from './AdvancedSettingsTab';
import StructureSelection from './StructureSelection';
import ChooseResourcesTab from './ChooseResourcesTab';

const AccordionWizard = () => {
  // Define steps and their dependent steps
  const stepsData = [
    {
      title: 'Select Structure',
      "tabs": [
            {
                "title": "Structure Selection", 
                "content": <StructureSelection />
            },
        ],
      dependents: [1, 2, 3]
    },
    {
      title: 'Configure Workflow',
      tabs: [
        { title: 'Basic workflow settings', content: <BasicSettingsTab /> }, // You can reuse components
        { title: 'Advanced workflow settings', content: <AdvancedSettingsTab /> }
      ],
      dependents: [2, 3]
    },
    {
      title: 'Choose Computational Resources',
      tabs: [
        { title: 'Basic resource settings', content: <ChooseResourcesTab /> },
      ],
      dependents: [3]
    },
    {
      title: 'Review and Submit',
      tabs: [
        { title: 'Review settings', content: <div>Review all configurations before submission...</div> }
      ],
      dependents: []
    }
  ];

  const [steps, setSteps] = useState(stepsData.map((step) => ({
    ...step,
    confirmed: false,
    modified: false,
    data: {} // Add data for each step
  })));
  const [activeStep, setActiveStep] = useState("0");

  // Function to reset dependent steps after a step is modified
  const resetDependents = (stepIndex) => {
    const updatedSteps = steps.map((step, index) => {
      if (index > stepIndex) {
        return { ...step, confirmed: false, modified: false }; // Reset subsequent steps
      }
      return step;
    });
    setSteps(updatedSteps);
  };

  // Function to handle data change in steps
  const handleDataChange = (stepIndex, newData) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], data: newData };
      return updatedSteps;
    });
  };

  // Function to handle confirming a step
  const handleConfirm = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], confirmed: true, modified: false };
      
      // Pass data to the next step (if applicable)
      if (stepIndex < updatedSteps.length - 1) {
        const currentData = updatedSteps[stepIndex].data;
        updatedSteps[stepIndex + 1] = { ...updatedSteps[stepIndex + 1], data: { ...currentData } }; // Pass data
      }

      return updatedSteps;
    });
    if (stepIndex < steps.length - 1) {
      setActiveStep((stepIndex + 1).toString());  // Move to the next step
    }
  };

  // Function to handle modifying a previous step
  const handleModify = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = prevSteps.map((step, index) => {
        // Reset the current and all dependent steps
        if (index >= stepIndex) {
          return { ...step, confirmed: false, modified: false };
        }
        return step;
      });
      return updatedSteps;
    });

    // Set the active step to the modified step
    setActiveStep(stepIndex.toString());
  };

  return (
    <Accordion activeKey={activeStep} onSelect={(eventKey) => setActiveStep(eventKey)}>
      {steps.map((step, index) => (
        <AccordionStep
          key={index}
          stepNumber={index + 1}
          title={step.title}
          tabs={step.tabs}
          confirmed={step.confirmed}
          modified={step.modified}
          stepData={step.data} // Pass the step's data to AccordionStep
          onDataChange={(newData) => handleDataChange(index, newData)} // Handle data change for the current step
          onConfirm={() => handleConfirm(index)}
          onModify={() => handleModify(index)}
          disabled={index > 0 && !steps[index - 1].confirmed}  // Disable step if the previous one isn't confirmed
        />
      ))}
    </Accordion>
  );
};

export default AccordionWizard;
