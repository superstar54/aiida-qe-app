
# Wizard with Accordion and Tabs: Design Summary

## Overview

This document outlines the design for a multi-step wizard using **React**, with an **accordion-style UI** and **tabs** in each step. The wizard enables users to review, modify, and reset previous steps, ensuring consistency by resetting dependent steps when necessary.

## Key Features

1. **Accordion-Based Navigation**:
   - Each step of the wizard is represented as an accordion item, allowing users to expand/collapse steps.
   - Steps can be confirmed, and previously confirmed steps can be reviewed and modified.
   - When a step is modified, dependent steps are reset, ensuring consistency.

2. **Tabs within Each Step**:
   - Each step can have multiple **tabs** (e.g., "Basic Settings", "Advanced Settings"), allowing users to organize related inputs.
   - The `Tabs` component dynamically loads content based on the step.

3. **Step Confirmation and Resetting**:
   - Users can confirm each step by clicking the "Confirm" button.
   - Once confirmed, the step is marked as completed, and the user can proceed to the next step.
   - If a step is modified, dependent steps are automatically reset to maintain data integrity.

4. **Modification of Previous Steps**:
   - Users can go back and modify any confirmed step by clicking the "Modify" button.
   - Modifying a step will reset all subsequent dependent steps.
   - After resetting, users need to re-confirm the modified step and any dependent steps.

5. **Dependent Step Reset Logic**:
   - When a step is modified, only dependent steps are reset.
   - This ensures that unrelated steps retain their confirmed status and do not need to be re-confirmed.

## Detailed Design

### 1. AccordionWizard Component

The `AccordionWizard` component manages the state of the steps, including their confirmation status and any modifications. It handles the logic for resetting dependent steps and switching between steps.

```jsx
import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionStep from './AccordionStep';

const AccordionWizard = () => {
  // Define steps and their dependent steps
  const stepsData = [
    {
      title: 'Select Structure',
      tabs: [
        { title: 'Basic settings', content: <div>Basic structure settings content here...</div> },
        { title: 'Advanced settings', content: <div>Advanced structure settings content here...</div> }
      ],
      dependents: [1, 2, 3]
    },
    {
      title: 'Configure Workflow',
      tabs: [
        { title: 'Basic Settings', content: <div>Basic Settings content here...</div> },
        { title: 'Advanced Settings', content: <div>Advanced Settings content here...</div> }
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

  // Reset all dependent steps when a step is modified
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
      const updatedSteps = [...prevSteps];
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], confirmed: false, modified: true };
      resetDependents(stepIndex);  // Reset all dependent steps
      return updatedSteps;
    });
    setActiveStep(stepIndex.toString());  // Move to the modified step
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
```

### 2. AccordionStep Component

The `AccordionStep` component is responsible for rendering each step in the accordion, along with the tabs and buttons for confirmation and modification.

```jsx
import React from 'react';
import { Accordion, Button } from 'react-bootstrap';
import Tabs from './Tabs';

const AccordionStep = ({ stepNumber, title, tabs, confirmed, onConfirm, onModify, disabled }) => {
  return (
    <Accordion.Item eventKey={(stepNumber - 1).toString()}>
      <Accordion.Header>
        {`Step ${stepNumber}: ${title} ${confirmed ? '✔️' : ''}`}
      </Accordion.Header>
      <Accordion.Body>
        {/* Render Tabs */}
        <Tabs tabs={tabs} />

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
```

### Additional Features

- **Progress Indicator**: (Optional) A progress indicator or progress bar can be added to visually show the user's progression through the steps.
- **Review Summary**: At the end of the wizard, provide a summary view where users can review all the steps and modify them before submitting the final configuration.
- **Modal for Modifications**: (Optional) A confirmation modal can be added when a user attempts to modify a step, explaining that dependent steps will be reset.

## Conclusion

This design ensures flexibility, allowing users to modify previous steps while maintaining consistency by resetting dependent steps. The use of tabs within each step enhances the organization of the content, and the accordion-based UI makes it easy for users to navigate between different steps.
