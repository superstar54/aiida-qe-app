import React from 'react';
import { Accordion, Button } from 'react-bootstrap';
import WizardTabs from './WizardTabs';

const AccordionStep = ({
  stepNumber,
  title,
  tabs,
  confirmed,
  onConfirm,
  onModify,
  disabled,
  onDataChange,
  allStepsData,
  ButtonText,
}) => {
  return (
    <Accordion.Item eventKey={(stepNumber - 1).toString()}>
      <Accordion.Header>
        {`Step ${stepNumber}: ${title} ${confirmed ? '✔️' : ''}`}
      </Accordion.Header>
      <Accordion.Body>
        {/* Render Tabs with the data passed */}
        <WizardTabs
          tabs={tabs}
          stepData={allStepsData[stepNumber - 1].data}
          allStepsData={allStepsData}
          onDataChange={onDataChange}
        />

        {/* Conditionally render the Confirm button */}
        {ButtonText && (
          <Button
            variant="success"
            onClick={onConfirm}
            disabled={disabled || confirmed}
            className="mt-3"
          >
            {confirmed ? ButtonText + "ed" : ButtonText}
          </Button>
        )}

        {/* Modify button, shown only if the step is confirmed */}
        {confirmed && (
          <Button variant="warning" onClick={onModify} className="mt-3 ms-2">
            Modify
          </Button>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default AccordionStep;
