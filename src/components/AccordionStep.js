import React from 'react';
import { Accordion, Button } from 'react-bootstrap';
import Tabs from './Tabs';

const AccordionStep = ({ stepNumber, title, tabs, confirmed, onConfirm, onModify, disabled, onDataChange, stepData }) => {
  console.log("stepData: ", stepData);
  return (
    <Accordion.Item eventKey={(stepNumber - 1).toString()}>
      <Accordion.Header>
        {`Step ${stepNumber}: ${title} ${confirmed ? '✔️' : ''}`}
      </Accordion.Header>
      <Accordion.Body>
        {/* Render Tabs with the data passed */}
        <Tabs tabs={tabs} stepData={stepData} onDataChange={onDataChange} />
        
        {/* Confirm button */}
        <Button
          variant="success"
          onClick={onConfirm}
          disabled={disabled || confirmed}  // Confirm button is disabled if the step is already confirmed
          className="mt-3"
        >
          {confirmed ? 'Confirmed' : 'Confirm'}
        </Button>

        {/* Modify button, shown only if the step is confirmed */}
        {confirmed && (
          <Button
            variant="warning"
            onClick={onModify}
            className="mt-3 ms-2"
          >
            Modify
          </Button>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default AccordionStep;
