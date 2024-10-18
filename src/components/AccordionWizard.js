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
      console.log("index", stepIndex);
      console.log('Confirmed Steps:', updatedSteps);

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
        if (index === stepIndex) {
          // For the current step, only change confirmed and modified flags
          return { ...step, confirmed: false, modified: true };
        } else if (index > stepIndex) {
          // For subsequent steps, reset confirmed, modified, and data
          return { ...step, confirmed: false, modified: true, data: {} };
        }
        // For previous steps, return them as is
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
          allStepsData={steps}
          onDataChange={(newData) => handleDataChange(index, newData)}
          onConfirm={() => handleConfirm(index)}
          onModify={() => handleModify(index)}
          disabled={index > 0 && !steps[index - 1].confirmed}
        />
      ))}
    </Accordion>
  );
};

export default AccordionWizard;
