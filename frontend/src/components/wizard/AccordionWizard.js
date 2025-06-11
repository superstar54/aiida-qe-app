// AccordionWizard.jsx
import React, { useContext, useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionStep from './AccordionStep';
import { WizardContext } from './WizardContext';

const AccordionWizard = () => {
  const {
    steps,
    activeStep,
    setActiveStep,
    handleDataChange,
    handleConfirm,
    handleModify,
  } = useContext(WizardContext);
  
  console.log('AccordionWizard steps:', steps);

  return (
    <Accordion activeKey={activeStep} onSelect={(eventKey) => setActiveStep(eventKey)}>
      {steps.map((step, index) => (
        <AccordionStep
          key={index}
          stepIndex={index}
          stepNumber={index + 1}
          title={step.title}
          confirmed={step.confirmed}
          modified={step.modified}
          tabs={step.tabs}
          ButtonText={step.ButtonText}
          onDataChange={handleDataChange}
          onConfirm={handleConfirm}
          onModify={handleModify}
          disabled={index > 0 && !steps[index - 1].confirmed}
          previousStepConfirmed={index === 0 || steps[index - 1].confirmed}
        />
      ))}
    </Accordion>
  );
};

export default AccordionWizard;
