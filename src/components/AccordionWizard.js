import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionStep from './AccordionStep';
import BasicSettingsTab from './BasicSettingsTab';
import AdvancedSettingsTab from './AdvancedSettingsTab';
import StructureSelection from './StructureSelection';
import ChooseResourcesTab from './ChooseResourcesTab';
import ReviewAndSubmit from './ReviewAndSubmit';

// Define steps and their dependent steps
const initialStepsData = [
  {
    title: 'Select Structure',
    "tabs": [
      {
        "title": "Structure Selection", 
        "content": <StructureSelection />
      },
    ],
    dependents: [1, 2, 3],
  },
  {
    title: 'Configure Workflow',
    tabs: [
      { title: 'Basic workflow settings', content: <BasicSettingsTab /> }, // You can reuse components
      { title: 'Advanced workflow settings', content: <AdvancedSettingsTab /> }
    ],
    dependents: [2, 3],
  },
  {
    title: 'Choose Computational Resources',
    tabs: [
      { title: 'Basic resource settings', content: <ChooseResourcesTab /> },
    ],
    dependents: [3],
  },
  {
    title: 'Review and Submit',
    tabs: [
      { title: 'Review settings', content: <ReviewAndSubmit /> },  // The review step shows all data.
    ],
    dependents: [],
  },
];

const AccordionWizard = () => {
  const [steps, setSteps] = useState(initialStepsData.map((step) => ({
    ...step,
    confirmed: false,
    modified: false,
    data: {} // Data for each step.
  })));
  const [activeStep, setActiveStep] = useState("0");

  // Function to handle data change in a step
  const handleDataChange = (stepIndex, newData) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[stepIndex].data = newData;
      return updatedSteps;
    });
  };

  // Function to confirm a step and pass data to the next step
  const handleConfirm = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[stepIndex].confirmed = true;
      
      // Pass the data to the next step if applicable
      if (stepIndex < updatedSteps.length - 1) {
        const currentData = updatedSteps[stepIndex].data;
        updatedSteps[stepIndex + 1].data = { ...updatedSteps[stepIndex + 1].data, ...currentData };
      }

      return updatedSteps;
    });
    
    // Move to the next step
    if (stepIndex < steps.length - 1) {
      setActiveStep((stepIndex + 1).toString());
    }
  };

  // Function to modify a previous step (reset data for subsequent steps)
  const handleModify = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = prevSteps.map((step, index) => {
        if (index >= stepIndex) {
          return { ...step, confirmed: false, modified: true, data: {} }; // Reset current and subsequent steps
        }
        return step;
      });
      return updatedSteps;
    });

    // Move back to the step being modified
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
          onConfirm={() => handleConfirm(index)}  // Confirm step and pass data to next step
          onModify={() => handleModify(index)}    // Allow modification of previous steps
          disabled={index > 0 && !steps[index - 1].confirmed}  // Disable a step if the previous one isn't confirmed
        />
      ))}
    </Accordion>
  );
};

export default AccordionWizard;
