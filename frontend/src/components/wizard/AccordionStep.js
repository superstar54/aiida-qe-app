// AccordionStep.jsx
import React from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';
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
  previousStepConfirmed,
}) => {
  return (
    <Accordion.Item eventKey={(stepNumber - 1).toString()}>
      <Accordion.Header>
        {`Step ${stepNumber}: ${title} ${confirmed ? '✔️' : ''}`}
      </Accordion.Header>
      <Accordion.Body>
      {previousStepConfirmed ? (
          <>
            {/* Render Tabs when previous step is confirmed */}
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
          ) : (
            // Message prompting the user to complete the previous step
          <Card className="bg-light p-3 my-3 text-center">
            <ExclamationTriangleFill color="orange" size={24} className="mb-2" />
            <p className="mb-0 fw-bold">
              Please complete the previous step to proceed.
            </p>
          </Card>
          )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default AccordionStep;
