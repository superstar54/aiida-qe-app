import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionStep from './AccordionStep';
import BasicSettingsTab from './BasicSettingsTab';
import AdvancedSettingsTab from './AdvancedSettingsTab';
import StructureSelection from './StructureSelection';

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
        { title: 'Basic resource settings', content: <div>Basic resource settings content here...</div> },
        { title: 'Advanced resource settings', content: <div>Advanced resource settings content here...</div> }
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

  // Function to handle confirming a step
  const handleConfirm = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], confirmed: true, modified: false };
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
          tabs={step.tabs}  // Pass tabs to AccordionStep
          confirmed={step.confirmed}
          modified={step.modified}
          onConfirm={() => handleConfirm(index)}
          onModify={() => handleModify(index)}
          disabled={index > 0 && !steps[index - 1].confirmed}  // Disable step if the previous one isn't confirmed
        />
      ))}
    </Accordion>
  );
};

export default AccordionWizard;
