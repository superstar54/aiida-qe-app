import React from 'react';
import { Accordion, Card, Button } from 'react-bootstrap';
import Tabs from './Tabs';

const AccordionStep = ({ stepNumber, title, tabs, confirmed, onConfirm, disabled }) => {
  return (
    <Card>
    <Accordion.Item eventKey={(stepNumber - 1).toString()}>
      <Accordion.Header>
        {`Step ${stepNumber}: ${title} ${confirmed ? '✔️' : ''}`}
      </Accordion.Header>
      <Accordion.Body>
        <Tabs tabs={tabs} />
        <Button
          variant="success"
          onClick={onConfirm}
          disabled={disabled || confirmed}
          className="mt-3"
        >
          {confirmed ? 'Confirmed' : 'Confirm'}
        </Button>
      </Accordion.Body>
    </Accordion.Item>
    </Card>
  );
};

export default AccordionStep;
