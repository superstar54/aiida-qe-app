// AccordionStep.jsx
import React from 'react';
import { Accordion, Button } from 'react-bootstrap';
import WizardTabs from './WizardTabs';

const AccordionStep = ({
  stepIndex,
  stepNumber,
  title,
  confirmed,
  ButtonText,
  onConfirm,
  onModify,
  disabled,
}) => {
  return (
    <Accordion.Item eventKey={(stepNumber - 1).toString()}>
      <Accordion.Header>
        {`Step ${stepNumber}: ${title} ${confirmed ? '✔️' : ''}`}
      </Accordion.Header>
      <Accordion.Body>
        <>
          <WizardTabs stepIndex={stepIndex} />

          {ButtonText && (
            <Button
              variant="success"
              onClick={() => onConfirm(stepIndex)}
              disabled={disabled || confirmed}
              className="mt-3"
            >
              {confirmed ? `${ButtonText}ed` : ButtonText}
            </Button>
          )}

          {confirmed && (
            <Button
              variant="warning"
              onClick={() => onModify(stepIndex)}
              className="mt-3 ms-2"
            >
              Modify
            </Button>
          )}
        </>
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default AccordionStep;
